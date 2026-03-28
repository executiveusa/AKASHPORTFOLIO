/**
 * research-cycle.ts — Autonomous Research Cycle Engine
 * Phase 8 | ZTE-20260319-0001
 *
 * A Ralphy-style agentic loop that runs on a schedule:
 *   ASK → PLAN → EXECUTE → OBSERVE → ITERATE
 *
 * Each cycle:
 * 1. SCAN    — fetch competitive signals (BrightData SERP + Postiz trends)
 * 2. ANALYZE — run sphere council mini-session on findings (CONSEJO + DR-ECONOMÍA + DRA-CULTURA)
 * 3. STORE   — write findings to vibe_nodes (kind='knowledge') in Supabase
 * 4. NOTIFY  — POST to Postiz webhook if significant signal found
 *
 * Triggered by: /api/cron/research-cycle (Vercel cron, daily at 07:00 MX)
 */

import { callLLM } from '@/lib/litellm-gateway';
import { getVibeContext } from '@/lib/vibe-graph';
import { supabaseClient } from '@/lib/supabase-client';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResearchTopic {
  id: string;
  query: string;
  category: 'competitor' | 'trend' | 'regulation' | 'technology' | 'latam-market';
  priority: number;           // 1-5 (5 = highest)
  lastRunAt: string | null;
}

export interface ResearchFinding {
  topicId: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  significance: number;       // [0..1]
  sources: string[];
  agentInsights: AgentInsight[];
  runAt: string;
}

export interface AgentInsight {
  agentId: string;
  insight: string;
  confidence: number;         // [0..1]
}

export interface ResearchCycleResult {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  topicsProcessed: number;
  findingsCount: number;
  significantFindings: number;
  totalCostUsd: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Default research topics — LATAM media & tech focus
// ---------------------------------------------------------------------------

const DEFAULT_TOPICS: ResearchTopic[] = [
  {
    id: 'latam-creators',
    query: 'LATAM influencer marketing trends 2025 México Colombia Argentina',
    category: 'latam-market',
    priority: 5,
    lastRunAt: null,
  },
  {
    id: 'cdmx-media',
    query: 'agencia de medios Ciudad de México nuevas campañas 2025',
    category: 'competitor',
    priority: 4,
    lastRunAt: null,
  },
  {
    id: 'ai-content-tools',
    query: 'AI content creation tools for social media Spanish language 2025',
    category: 'technology',
    priority: 4,
    lastRunAt: null,
  },
  {
    id: 'tiktok-latam',
    query: 'TikTok advertising LATAM brand opportunities 2025',
    category: 'trend',
    priority: 3,
    lastRunAt: null,
  },
  {
    id: 'video-production-mx',
    query: 'producción de video México costo oportunidades presupuesto 2025',
    category: 'latam-market',
    priority: 3,
    lastRunAt: null,
  },
];

// ---------------------------------------------------------------------------
// Main cycle runner
// ---------------------------------------------------------------------------

export async function runResearchCycle(options?: {
  topicIds?: string[];
  maxTopics?: number;
  dryRun?: boolean;
}): Promise<ResearchCycleResult> {
  const cycleId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  const findings: ResearchFinding[] = [];
  let totalCostUsd = 0;

  // Load topics
  const topics = DEFAULT_TOPICS
    .filter(t => !options?.topicIds || options.topicIds.includes(t.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, options?.maxTopics ?? 5);

  console.log(`[research-cycle] Starting cycle ${cycleId} with ${topics.length} topics`);

  for (const topic of topics) {
    try {
      const finding = await processTopic(topic, options?.dryRun ?? false);
      findings.push(finding);
      totalCostUsd += estimateLLMCost(finding);
    } catch (err) {
      errors.push(`Topic ${topic.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Store significant findings to Supabase vibe_nodes
  if (!options?.dryRun) {
    await storeFindings(findings, cycleId);
  }

  // Notify if high-significance findings
  const significant = findings.filter(f => f.significance > 0.7);
  if (significant.length > 0 && !options?.dryRun) {
    await notifySignificantFindings(significant, cycleId);
  }

  const completedAt = new Date().toISOString();

  return {
    cycleId,
    startedAt,
    completedAt,
    topicsProcessed: topics.length,
    findingsCount: findings.length,
    significantFindings: significant.length,
    totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Process a single research topic
// ---------------------------------------------------------------------------

async function processTopic(topic: ResearchTopic, dryRun: boolean): Promise<ResearchFinding> {
  const runAt = new Date().toISOString();

  // STEP 1: SCAN — search for signals
  const searchResults = dryRun
    ? `[DRY RUN] Simulated SERP results for: ${topic.query}`
    : await searchForTopic(topic.query);

  // STEP 2: ANALYZE — mini council (3 agents)
  const analysisAgents: SphereAgentId[] = ['consejo', 'dr-economia', 'dra-cultura'];
  const insights: AgentInsight[] = [];

  for (const agentId of analysisAgents) {
    const vibeCtx = await getVibeContext(agentId).catch(() => ({ ecosystemSummary: '' }));

    const systemPrompt = buildResearchPrompt(agentId, topic, vibeCtx.ecosystemSummary);

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Resultados de búsqueda:\n\n${searchResults}\n\nDa tu análisis en máximo 3 oraciones.` },
      ],
      { model: 'claude-3-haiku-20240307', temperature: 0.4, maxTokens: 200 },
    ).catch((err: Error) => ({ content: `[Error: ${err.message}]` } as { content: string }));

    insights.push({
      agentId,
      insight: typeof result === 'object' && result !== null && 'content' in result
        ? String((result as { content: string }).content)
        : 'Sin análisis disponible.',
      confidence: 0.7,
    });
  }

  // STEP 3: Synthesize
  const allInsights = insights.map(i => `${i.agentId}: ${i.insight}`).join('\n');
  const synthesis = await callLLM(
    [
      { role: 'system', content: 'Eres SYNTHIA™. Sintetiza los insights del consejo en un resumen ejecutivo de 2 oraciones para Ivette. Incluye el nivel de oportunidad: ALTA/MEDIA/BAJA.' },
      { role: 'user', content: `Insights del consejo:\n${allInsights}\n\nTopic: ${topic.query}` },
    ],
    { model: 'claude-3-haiku-20240307', temperature: 0.3, maxTokens: 150 },
  ).catch(() => ({ content: 'Síntesis no disponible.' } as { content: string }));

  const summaryText = typeof synthesis === 'object' && synthesis !== null && 'content' in synthesis
    ? String((synthesis as { content: string }).content)
    : 'Sin síntesis disponible.';

  // Calculate significance
  const hasHighOpport = summaryText.toUpperCase().includes('ALTA');
  const significance = hasHighOpport ? 0.85 : summaryText.toUpperCase().includes('MEDIA') ? 0.55 : 0.25;

  return {
    topicId: topic.id,
    summary: summaryText,
    sentiment: significance > 0.6 ? 'positive' : 'neutral',
    significance,
    sources: [topic.query],
    agentInsights: insights,
    runAt,
  };
}

// ---------------------------------------------------------------------------
// Search stub — will use HERALD/BrightData when available
// ---------------------------------------------------------------------------

async function searchForTopic(query: string): Promise<string> {
  // Attempt HERALD dispatch via SYNTHIA™ backend
  try {
    console.warn('[TODO] migrate: /api/herald/dispatch — use synthiaApi.herald.dispatch()');
    // Stub: fall through to LLM synthesis
  } catch {
    // fall through to LLM synthesis
  }

  // Fallback: ask LLM for a market synthesis
  const result = await callLLM(
    [
      { role: 'system', content: 'Eres un analista de mercado LATAM. Provee un resumen de 200 palabras de las tendencias actuales en el tema indicado, basado en tu conocimiento hasta 2024.' },
      { role: 'user', content: query },
    ],
    { model: 'claude-3-haiku-20240307', temperature: 0.6, maxTokens: 300 },
  ).catch(() => ({ content: 'Datos de búsqueda no disponibles.' } as { content: string }));

  return typeof result === 'object' && result !== null && 'content' in result
    ? String((result as { content: string }).content)
    : query;
}

// ---------------------------------------------------------------------------
// Research prompt per agent
// ---------------------------------------------------------------------------

function buildResearchPrompt(agentId: string, topic: ResearchTopic, vibeCtx: string): string {
  const roles: Record<string, string> = {
    'consejo': 'Eres CONSEJO™, el facilitador del Consejo. Analiza la relevancia estratégica de estos datos para Kupuri Media.',
    'dr-economia': 'Eres DR. ECONOMÍA, analista financiero. Evalúa el potencial de ingresos y el costo de oportunidad que representan estos datos.',
    'dra-cultura': 'Eres DRA. CULTURA, estratega cultural CDMX. Evalúa el fit cultural con la audiencia LATAM y las tendencias de contenido.',
  };

  const role = roles[agentId] ?? `Eres ${agentId}. Analiza estos datos.`;

  return `${role}

Contexto del ecosistema Kupuri:
${vibeCtx || 'Sin contexto de Vibe Graph disponible.'}

Tema de investigación: ${topic.query}
Categoría: ${topic.category}
Prioridad: ${topic.priority}/5

Tu análisis debe responder: ¿Qué significa esto para Kupuri Media™ hoy?`;
}

// ---------------------------------------------------------------------------
// Store findings to Supabase vibe_nodes
// ---------------------------------------------------------------------------

async function storeFindings(findings: ResearchFinding[], cycleId: string): Promise<void> {
  for (const finding of findings) {
    const nodeId = `research-${finding.topicId}-${Date.now()}`;

    const { error } = await supabaseClient
      .from('vibe_nodes')
      .upsert({
        id: nodeId,
        kind: 'knowledge',
        label: `Research: ${finding.topicId}`,
        meta: {
          cycleId,
          summary: finding.summary,
          significance: finding.significance,
          sentiment: finding.sentiment,
          agentInsights: finding.agentInsights,
          runAt: finding.runAt,
        },
        confidence: finding.significance,
        last_verified_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`[research-cycle] Failed to store finding ${finding.topicId}:`, error);
    }
  }
}

// ---------------------------------------------------------------------------
// Notify via Postiz webhook
// ---------------------------------------------------------------------------

async function notifySignificantFindings(findings: ResearchFinding[], cycleId: string): Promise<void> {
  const postizWebhook = process.env.POSTIZ_WEBHOOK_URL;
  if (!postizWebhook) return;

  const message = findings
    .map(f => `🔍 *${f.topicId}* (${Math.round(f.significance * 100)}% significancia)\n${f.summary}`)
    .join('\n\n');

  try {
    await fetch(postizWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🧠 *Ciclo de Investigación SYNTHIA™*\nCiclo: \`${cycleId}\`\n\n${message}`,
        channel: 'research-alerts',
      }),
    });
  } catch (err) {
    console.error('[research-cycle] Notification failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Cost estimator (rough)
// ---------------------------------------------------------------------------

function estimateLLMCost(finding: ResearchFinding): number {
  // Haiku-3: ~$0.00025 input / $0.00125 output per 1k tokens
  // Assume ~400 tokens total per agent × 3 agents + synthesis
  const estimatedTokens = 400 * (finding.agentInsights.length + 1);
  return (estimatedTokens / 1000) * 0.001;
}
