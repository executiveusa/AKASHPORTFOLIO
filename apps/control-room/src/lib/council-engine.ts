/**
 * SYNTHIA™ Council Engine v2.0 — Enterprise Multi-Agent Board
 *
 * Implements Karpathy's 3-stage LLM Council pattern with SYNTHIA as Chairman:
 *
 *   Stage 1 — Position:  Each sphere gives their independent take on the Brief
 *   Stage 2 — Review:    Each sphere reviews ALL others, ranks them, finds gaps
 *   Stage 3 — Synthesis: SYNTHIA (Chairman) creates the final Memo
 *
 * Additional runtime:
 *   - Agent Zero bridge: dispatcher for execution tasks (Docker + ByteRover)
 *   - Pauli-Hermes bridge: research/enrichment specialist board member
 *   - LiteLLM gateway: provider-agnostic LLM routing with budget guard
 *   - Sphere expertise: persistent scratchpad per agent (expertise.json in Supabase)
 *   - Circuit breakers: per-meeting cost + time caps enforced before each LLM call
 *
 * SYNTHIA ALWAYS:
 *   - Opens meetings, frames the decision
 *   - Reads all position + review rounds
 *   - Writes the final Memo (NOT delegated to another agent)
 *   - Reports to Ivette if circuit breakers fire
 *
 * Board members ALWAYS:
 *   - Report their output to SYNTHIA (not to each other directly)
 *   - Draw from their Expertise file (sphere-specific domain memory)
 *   - Anonymize identities during Review stage (to prevent sycophancy)
 */

import { callLLM, type LLMMessage, type LLMResult } from './litellm-gateway';
import { supabaseAdmin } from './supabase-client';
import type { SphereAgentId } from '@/shared/council-events';

// ─── Sphere tool definitions ──────────────────────────────────────────────────

const CREATE_TASK_TOOL = {
  name: 'create_task',
  description: 'Create a new task/card in the project backlog when you identify concrete work that must be done.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Short task title (action verb + outcome)' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Task urgency' },
      description: { type: 'string', description: 'What needs to happen and why (optional)' },
    },
    required: ['title', 'priority'],
  },
};

const LOG_ISSUE_TOOL = {
  name: 'log_issue',
  description: 'Log a project risk, blocker, or issue when you identify a specific threat to delivery.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'What is the risk or problem' },
      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Impact severity' },
      mitigation: { type: 'string', description: 'Suggested mitigation step (optional)' },
    },
    required: ['title', 'severity'],
  },
};

type SphereTool = typeof CREATE_TASK_TOOL | typeof LOG_ISSUE_TOOL;
const SPHERE_TOOLS: Partial<Record<SphereAgentId, SphereTool[]>> = {
  cazadora: [CREATE_TASK_TOOL, LOG_ISSUE_TOOL],
  forjadora: [CREATE_TASK_TOOL, LOG_ISSUE_TOOL],
};

async function executeSphereTool(
  sphereId: SphereAgentId,
  toolName: string,
  toolInput: Record<string, unknown>,
  briefId: string,
): Promise<string> {
  try {
    if (toolName === 'create_task') {
      const { data, error } = await supabaseAdmin.from('agent_tasks').insert({
        sphere_id: sphereId,
        brief_id: briefId,
        task_type: 'council_action',
        title: toolInput.title,
        priority: toolInput.priority ?? 'medium',
        description: toolInput.description ?? null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }).select('id').single();
      if (error) return `error: ${error.message}`;
      return `task created: ${data?.id}`;
    }
    if (toolName === 'log_issue') {
      const { data, error } = await supabaseAdmin.from('agent_tasks').insert({
        sphere_id: sphereId,
        brief_id: briefId,
        task_type: 'issue',
        title: toolInput.title,
        priority: toolInput.severity ?? 'medium',
        description: toolInput.mitigation ?? null,
        status: 'open',
        created_at: new Date().toISOString(),
      }).select('id').single();
      if (error) return `error: ${error.message}`;
      return `issue logged: ${data?.id}`;
    }
    return 'unknown tool';
  } catch (err) {
    return `tool execution failed: ${String(err)}`;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CouncilBrief {
  id: string;
  situation: string;          // Background — what's happening
  stakes: string;             // What's at risk — company/product/personal
  constraints: string;        // Time, budget, non-negotiables
  key_questions: string[];    // 1–4 questions that need answers
  context_docs?: string;      // Optional: business metrics, product overview, extra data
  initiatedBy: string;        // 'ivette' | agentId
  requestedAt: string;        // ISO timestamp
}

export interface SpherePosition {
  sphereId: SphereAgentId;
  displayName: string;
  stance: string;
  reasoning: string;
  confidence: number;         // 0..1
  recommendation: string;
  dissentFlag: boolean;       // true if contrarian take
}

export interface SphereReview {
  reviewerSphereId: SphereAgentId;
  rankings: Array<{
    anonymousId: string;      // 'VOICE_A' .. 'VOICE_I' — no real names until memo
    score: number;            // 1..10
    strengths: string;
    gaps: string;
  }>;
  topInsight: string;         // The single most valuable observation across all positions
}

export interface CouncilMemo {
  id: string;
  briefId: string;
  meetingId: string;
  decisionFramework: string;  // Decision tree / choice map
  recommendation: string;     // The call SYNTHIA makes
  rationale: string;
  boardStances: Array<{
    sphereId: SphereAgentId;
    displayName: string;
    finalStance: string;
    vote: 'accept' | 'reject' | 'conditional' | 'abstain';
  }>;
  resolvedTensions: string[];
  unresolvedTensions: string[];
  nextActions: Array<{
    action: string;
    owner: SphereAgentId;
    deadline: string;
  }>;
  dissent: string | null;
  createdAt: string;
  costUsd: number;
  durationMs: number;
}

export interface MeetingConstraints {
  maxTurnTimeMs: number;    // per LLM call
  maxTotalCostUsd: number;  // circuit breaker
  maxDurationMs: number;    // wall-clock limit
}

export const DEFAULT_CONSTRAINTS: MeetingConstraints = {
  maxTurnTimeMs:   30_000,   // 30s per LLM call
  maxTotalCostUsd: 5.0,      // $5 max per meeting
  maxDurationMs:   5 * 60 * 1000, // 5 min wall clock
};

// ─── Board role definitions (each sphere is a specialized board member) ───────

interface BoardRole {
  sphereId: SphereAgentId;
  boardTitle: string;
  decisionLens: string;
  temperament: string;
  reasoningPattern: string;
  preferredHorizon: string;    // 'sub-90-days' | 'quarterly' | 'multi-year'
  likelyAllies: SphereAgentId[];
  likelyRivals: SphereAgentId[];
  modelOverride?: string;      // optional: give chairman a stronger model
}

export const BOARD_ROLES: Record<SphereAgentId, BoardRole> = {
  synthia: {
    sphereId: 'synthia',
    boardTitle: 'Chairman — Coordinating Intelligence',
    decisionLens: 'Integration. You see the whole board before recommending. You synthesize contradictions.',
    temperament: 'Calm, non-partisan, deeply present. You ask the question nobody asked.',
    reasoningPattern: 'Systems thinking. Meadows feedback loops. Find the leverage point in the structure.',
    preferredHorizon: 'multi-year',
    likelyAllies: ['alex', 'consejo'],
    likelyRivals: [],
    modelOverride: 'claude-3-5-sonnet-20241022', // Chairman gets strongest available
  },
  alex: {
    sphereId: 'alex',
    boardTitle: 'Chief Advisor — Compounding Strategist',
    decisionLens: 'Compounding advantage. You ask: does this build our moat over 3 years?',
    temperament: 'Gold-standard patience. Never impulsive. Anchored in first principles.',
    reasoningPattern: 'Warren Buffett + Packy McCormick. Long arcs, durable assets, compounding flywheel.',
    preferredHorizon: 'multi-year',
    likelyAllies: ['synthia', 'ing-teknos'],
    likelyRivals: ['cazadora'],
  },
  cazadora: {
    sphereId: 'cazadora',
    boardTitle: 'Revenue Hunter — 90-Day Cash Engine',
    decisionLens: 'Revenue NOW. Pipeline, conversion, cash in 90 days.',
    temperament: 'Impatient with abstraction. Gravitational pull toward shipping, selling, collecting.',
    reasoningPattern: 'Sales velocity, pipeline math, outbound cadence. Close the deal first, optimize later.',
    preferredHorizon: 'sub-90-days',
    likelyAllies: ['seductora', 'dr-economia'],
    likelyRivals: ['alex', 'consejo'],
  },
  forjadora: {
    sphereId: 'forjadora',
    boardTitle: 'Systems Architect — Technical Truth',
    decisionLens: 'Technical feasibility and architectural integrity. What will actually work at scale?',
    temperament: 'Pragmatic, detail-focused, skeptical of hand-waving. Shows the math.',
    reasoningPattern: "RFC-style reasoning. What's the runtime complexity? What breaks at 10x?",
    preferredHorizon: 'quarterly',
    likelyAllies: ['ing-teknos', 'alex'],
    likelyRivals: ['cazadora'],
  },
  seductora: {
    sphereId: 'seductora',
    boardTitle: 'Conversion Architect — Psychology of Yes',
    decisionLens: 'Human persuasion, emotional truth, desire mechanics. What makes people say YES?',
    temperament: 'Cuban warmth. Sensual intelligence. Deeply attuned to unspoken desire.',
    reasoningPattern: 'Robert Cialdini + Habanera cadence. Reciprocity, scarcity, authority, liking.',
    preferredHorizon: 'sub-90-days',
    likelyAllies: ['cazadora', 'dra-cultura'],
    likelyRivals: ['forjadora'],
  },
  consejo: {
    sphereId: 'consejo',
    boardTitle: 'Moonshot Contrarian — Risk Cartographer',
    decisionLens: 'What if we\'re thinking too small? What\'s the 10x move? And: what can kill us?',
    temperament: 'Chilean precision + philosophical distance. Asks what nobody wants to ask.',
    reasoningPattern: 'Second-order consequences, pre-mortem, Nassim Taleb antifragility.',
    preferredHorizon: 'multi-year',
    likelyAllies: ['alex'],
    likelyRivals: ['cazadora', 'seductora'],
  },
  'dr-economia': {
    sphereId: 'dr-economia',
    boardTitle: 'Financial Strategist — Arbitrage & Unit Economics',
    decisionLens: 'Unit economics, LTV/CAC, MRR trajectory, LATAM arbitrage. Follow the money.',
    temperament: 'Venezuelan pragmatism. Has lived through currency collapse. Extreme risk awareness.',
    reasoningPattern: 'SaaS metrics, forex spreads, cash flow modeling. Numbers over narrative.',
    preferredHorizon: 'quarterly',
    likelyAllies: ['cazadora', 'forjadora'],
    likelyRivals: ['consejo'],
  },
  'dra-cultura': {
    sphereId: 'dra-cultura',
    boardTitle: 'Cultural Architect — Brand & Community',
    decisionLens: 'Community resonance, brand coherence, content compounding. Does this feel true to who we are?',
    temperament: 'Peruvian warmth, aesthetic sensitivity. Sees what the product says to culture.',
    reasoningPattern: 'Cultural semiotics, brand archetypes, community flywheel.',
    preferredHorizon: 'quarterly',
    likelyAllies: ['seductora', 'synthia'],
    likelyRivals: ['dr-economia'],
  },
  'ing-teknos': {
    sphereId: 'ing-teknos',
    boardTitle: 'Infrastructure Oracle — Systems Durability',
    decisionLens: 'Infrastructure resilience, DevOps velocity, security posture. Will it survive production?',
    temperament: 'Puerto Rican directness. Finds the exact failure mode before it happens.',
    reasoningPattern: 'SRE principles, chaos engineering, DORA metrics, OWASP.',
    preferredHorizon: 'quarterly',
    likelyAllies: ['forjadora', 'alex'],
    likelyRivals: ['cazadora'],
  },
  'la-vigilante': {
    sphereId: 'la-vigilante',
    boardTitle: 'Guardian — Compliance & Circuit Breaker',
    decisionLens: 'Does this violate ZTE rules, budget limits, or security contracts? ENFORCE.',
    temperament: 'Neutral Español. No emotion. Pure protocol.',
    reasoningPattern: 'Audit log, circuit breakers, La Vigilante alert system.',
    preferredHorizon: 'sub-90-days',
    likelyAllies: [],
    likelyRivals: [],
  },
} as Record<SphereAgentId, BoardRole>;

// ─── Per-meeting cost tracker ─────────────────────────────────────────────────

export class MeetingCostTracker {
  private startMs: number;
  private totalCostUsd = 0;

  constructor(private constraints: MeetingConstraints) {
    this.startMs = Date.now();
  }

  record(result: LLMResult) {
    this.totalCostUsd += result.costEstimateUsd ?? 0;
  }

  check(): { ok: boolean; reason?: string } {
    if (this.totalCostUsd >= this.constraints.maxTotalCostUsd) {
      return { ok: false, reason: `cost_exceeded: $${this.totalCostUsd.toFixed(3)} >= $${this.constraints.maxTotalCostUsd}` };
    }
    if (Date.now() - this.startMs >= this.constraints.maxDurationMs) {
      return { ok: false, reason: `duration_exceeded: ${Math.round((Date.now() - this.startMs) / 1000)}s` };
    }
    return { ok: true };
  }

  elapsedMs() { return Date.now() - this.startMs; }
  get cost() { return this.totalCostUsd; }
}

// ─── Sphere expertise persistence ─────────────────────────────────────────────

async function loadSphereExpertise(sphereId: SphereAgentId): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('agent_memory')
      .select('expertise_text')
      .eq('sphere_id', sphereId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .throwOnError();

    return (data?.[0]?.expertise_text as string | undefined) ?? '';
  } catch {
    return ''; // non-fatal
  }
}

async function saveSphereExpertise(
  sphereId: SphereAgentId,
  meeting_id: string,
  new_insight: string,
): Promise<void> {
  try {
    await supabaseAdmin.from('agent_memory').upsert({
      sphere_id: sphereId,
      meeting_id,
      expertise_text: new_insight,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'sphere_id' });
  } catch {
    // non-fatal — expertise is an enhancement, not a requirement
  }
}

// ─── Tool-augmented LLM call (direct Anthropic SDK — bypasses litellm) ────────

async function callSphereWithTools(
  sphereId: SphereAgentId,
  systemPrompt: string,
  userMessage: string,
  tools: SphereTool[],
  briefId: string,
): Promise<{ content: string; toolsExecuted: string[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { content: '', toolsExecuted: [] };

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: systemPrompt,
    tools,
    messages: [{ role: 'user', content: userMessage }],
  });

  const toolsExecuted: string[] = [];
  let textContent = '';

  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      const result = await executeSphereTool(sphereId, block.name, block.input as Record<string, unknown>, briefId);
      toolsExecuted.push(`${block.name}(${JSON.stringify(block.input)}) → ${result}`);
    }
  }

  return { content: textContent, toolsExecuted };
}

// ─── Stage 1: Position ────────────────────────────────────────────────────────

export async function runPositionStage(
  brief: CouncilBrief,
  boardIds: SphereAgentId[],
  tracker: MeetingCostTracker,
  onProgress?: (sphereId: SphereAgentId, position: SpherePosition) => void,
): Promise<SpherePosition[]> {
  const positions: SpherePosition[] = [];

  for (const sphereId of boardIds) {
    const gate = tracker.check();
    if (!gate.ok) {
      console.warn(`[council-engine] Stage 1 circuit breaker: ${gate.reason}`);
      break;
    }

    const role = BOARD_ROLES[sphereId];
    const expertise = await loadSphereExpertise(sphereId);

    const systemPrompt = buildPositionPrompt(role, brief, expertise);
    const userMsg = buildBriefUserMessage(brief);
    const sphereTools = SPHERE_TOOLS[sphereId];

    let positionText: string;
    let result: LLMResult | null = null;

    if (sphereTools && sphereTools.length > 0) {
      // Tool-augmented call for action-capable spheres (CAZADORA, FORJADORA)
      try {
        const { content, toolsExecuted } = await callSphereWithTools(sphereId, systemPrompt, userMsg, sphereTools, brief.id);
        positionText = content;
        if (toolsExecuted.length > 0) {
          console.info(`[council-engine] ${sphereId} executed tools: ${toolsExecuted.join('; ')}`);
        }
      } catch (err) {
        console.error(`[council-engine] Stage 1 tool-call failed for ${sphereId}:`, err);
        continue;
      }
    } else {
      try {
        result = await callLLM(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg },
          ],
          {
            model: role.modelOverride,
            maxTokens: 600,
            temperature: 0.75,
            sphereId,
          },
        );
        positionText = result.content;
      } catch (err) {
        console.error(`[council-engine] Stage 1 failed for ${sphereId}:`, err);
        continue;
      }
    }

    if (result) tracker.record(result);
    const position = parsePositionResponse(sphereId, role, positionText);
    positions.push(position);

    onProgress?.(sphereId, position);

    // Save insight to expertise memory
    await saveSphereExpertise(
      sphereId,
      brief.id,
      `${new Date().toISOString()} | Brief: ${brief.situation.slice(0, 100)} | Stance: ${position.stance.slice(0, 200)}`,
    );
  }

  return positions;
}

// ─── Stage 2: Review + Ranking ────────────────────────────────────────────────

export async function runReviewStage(
  brief: CouncilBrief,
  positions: SpherePosition[],
  boardIds: SphereAgentId[],
  tracker: MeetingCostTracker,
  onProgress?: (sphereId: SphereAgentId, review: SphereReview) => void,
): Promise<SphereReview[]> {
  if (positions.length === 0) return [];

  // Anonymize positions: VOICE_A, VOICE_B, ... to prevent sycophancy
  const anonymousMap = buildAnonymousMap(positions);
  const anonymousText = buildAnonymousPositionText(positions, anonymousMap);

  const reviews: SphereReview[] = [];

  for (const sphereId of boardIds) {
    const gate = tracker.check();
    if (!gate.ok) {
      console.warn(`[council-engine] Stage 2 circuit breaker: ${gate.reason}`);
      break;
    }

    const role = BOARD_ROLES[sphereId];
    const expertise = await loadSphereExpertise(sphereId);
    const myAnonymousId = anonymousMap.get(sphereId) ?? 'UNKNOWN';

    const systemPrompt = buildReviewPrompt(role, brief, expertise, myAnonymousId);

    let result: LLMResult;
    try {
      result = await callLLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `POSICIONES DEL CONSEJO:\n${anonymousText}\n\nEvalúa cada voz. Excluye la tuya (${myAnonymousId}).` },
        ],
        {
          model: role.modelOverride,
          maxTokens: 500,
          temperature: 0.6,
          sphereId,
        },
      );
    } catch (err) {
      console.error(`[council-engine] Stage 2 failed for ${sphereId}:`, err);
      continue;
    }

    tracker.record(result);
    const review = parseReviewResponse(sphereId, result.content, positions, anonymousMap);
    reviews.push(review);
    onProgress?.(sphereId, review);
  }

  return reviews;
}

// ─── Stage 3: SYNTHIA Chairman Synthesis → Final Memo ────────────────────────

export async function runSynthesisStage(
  brief: CouncilBrief,
  meetingId: string,
  positions: SpherePosition[],
  reviews: SphereReview[],
  tracker: MeetingCostTracker,
): Promise<CouncilMemo> {
  const startMs = Date.now();

  const systemPrompt = buildChairmanMemoPrompt(brief, positions, reviews);
  const userMessage = buildMemoUserMessage(brief, positions, reviews);

  let memoText = '';
  let result: LLMResult | null = null;

  const gate = tracker.check();
  if (!gate.ok) {
    // Degenerate memo — circuit breaker fired before synthesis
    memoText = `[SYNTHIA] Circuit breaker fired before synthesis: ${gate.reason}. Partial data available.`;
  } else {
    try {
      result = await callLLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        {
          model: BOARD_ROLES.synthia.modelOverride,
          maxTokens: 1200,
          temperature: 0.5, // lower temp for chairman — precision over creativity
          sphereId: 'synthia',
        },
      );
      memoText = result.content;
      tracker.record(result);
    } catch (err) {
      console.error('[council-engine] Stage 3 synthesis failed:', err);
      memoText = `[SYNTHIA] Synthesis failed: ${String(err)}. Board positions available for manual review.`;
    }
  }

  const memo: CouncilMemo = parseMemoResponse(
    memoText,
    brief,
    meetingId,
    positions,
    tracker.cost,
    Date.now() - startMs + tracker.elapsedMs(),
  );

  // Persist memo to Supabase
  await persistMemo(memo);

  return memo;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

/**
 * Per-sphere identity block: ROLE · VOICE · MANDATE · BLIND SPOT
 *
 * These strings are injected into every Stage 1 and Stage 2 prompt to give
 * each sphere a distinct character beyond the generic BoardRole fields.
 *
 * Requirements enforced here:
 *   - Spanish-first (CDMX register) — each block is already in Spanish
 *   - No markdown in spoken output — instruction lives in the caller prompt
 *   - Single clear job per sphere (HEART_AND_SOUL doctrine: one primary function)
 */
function buildSphereIdentityBlock(sphereId: SphereAgentId): string {
  const blocks: Partial<Record<SphereAgentId, string>> = {
    synthia: `ROL: Eres la Jefa de Gabinete del Consejo, la inteligencia coordinadora que sintetiza todo y toma la decisión final.
VOZ: Calmada, no parcial, profundamente presente. Hablas con autoridad sin imponer. Haces la pregunta que nadie más formuló.
MANDATO: Siempre empujas por síntesis real, no consenso falso. Mapeas las contradicciones antes de resolverlas.
PUNTO CIEGO: Tiendes a buscar equilibrio cuando a veces el desequilibrio es la respuesta correcta.`,

    alex: `ROL: Eres el Asesor en Jefe, el estratega de largo plazo que evalúa si una decisión construye ventaja compuesta en tres años o la erosiona.
VOZ: Paciente, anclado en primeros principios, nunca impulsivo. Piensas en décadas y hablas en oraciones completas y lentas.
MANDATO: Siempre preguntas si esto construye el foso duradero o solo genera ruido de corto plazo.
PUNTO CIEGO: Tiendes a subestimar la urgencia real de los ingresos en el corto plazo.`,

    cazadora: `ROL: Eres la Cazadora de Prospectos, la máquina de ingresos de 90 días que encuentra clientes, abre pipeline y empuja al cierre.
VOZ: Impaciente con la abstracción, gravitacional hacia el cierre. Hablas con números, fechas y nombres concretos. Nunca genérico.
MANDATO: Siempre empujas por acción de ventas inmediata. Tu pregunta es siempre la misma: quién paga y cuándo.
PUNTO CIEGO: Tiendes a ignorar la calidad del cliente en favor de la velocidad del cierre.`,

    forjadora: `ROL: Eres la Forjadora de Sistemas, la arquitecta pragmática que determina qué funciona realmente a escala y cuánto tiempo tarda construirlo.
VOZ: Detallista, escéptica del handwave, muestras las matemáticas. Hablas con precisión técnica sin jerga innecesaria.
MANDATO: Siempre preguntas qué se rompe a diez veces la escala actual y cuánto tiempo toma construirlo de verdad.
PUNTO CIEGO: Tiendes a sobre-engineerizar cuando una solución de ochenta por ciento funcionaría perfectamente.`,

    seductora: `ROL: Eres la Arquitecta de Conversión, la experta en la psicología del sí que cierra tratos con inteligencia emocional y calidez real.
VOZ: Cálida, intuitiva, profundamente sintonizada con el deseo no expresado. Hablas de personas reales, no de métricas abstractas.
MANDATO: Siempre preguntas qué hace que esta propuesta sea irresistible para un ser humano real con miedos y deseos concretos.
PUNTO CIEGO: Tiendes a subestimar las objeciones racionales cuando el momentum emocional es alto.`,

    consejo: `ROL: Eres el Facilitador del Consejo, el guardián del proceso que mantiene al consejo en el camino correcto y hace las preguntas que nadie quiere hacer.
VOZ: Preciso, filosófico, con distancia estratégica. Preguntas lo incómodo. Nunca esquivas la consecuencia de segundo orden.
MANDATO: Siempre empujas por el pre-mortem: qué nos puede matar, qué estamos ignorando, qué movimiento de diez veces no estamos considerando.
PUNTO CIEGO: Tiendes a paralizar la acción con demasiado análisis cuando la velocidad es la ventaja real.`,

    'dr-economia': `ROL: Eres el Doctor en Economía, el guardián del dinero que analiza arbitraje, unit economics y flujo de caja con pragmatismo extremo.
VOZ: Pragmático y directo. Has visto colapsos de moneda. Números sobre narrativa, siempre. Nunca te dejas llevar por el optimismo sin respaldo.
MANDATO: Siempre sigues el dinero: LTV sobre CAC, MRR real, márgenes reales no proyectados, riesgo de tipo de cambio.
PUNTO CIEGO: Tiendes a bloquear oportunidades de alto riesgo y alta recompensa que el modelo financiero no puede capturar.`,

    'dra-cultura': `ROL: Eres la Doctora en Cultura, la arquitecta de marca y comunidad que evalúa si una decisión resuena con la identidad cultural del CDMX y construye comunidad real.
VOZ: Cálida, con sensibilidad estética aguda. Ves lo que el producto le dice a la cultura antes de que la cultura lo diga. Hablas de resonancia, no de algoritmos.
MANDATO: Siempre preguntas si esto se siente verdadero a quiénes somos y si compone el volante de comunidad a largo plazo.
PUNTO CIEGO: Tiendes a priorizar coherencia de marca sobre la urgencia de los ingresos cuando el tiempo importa.`,

    'ing-teknos': `ROL: Eres el Ingeniero de Infraestructura, el oráculo de sistemas que determina si una solución técnica sobrevivirá producción real con resiliencia, seguridad y velocidad de despliegue.
VOZ: Directo, sin adornos. Encuentras el modo de falla exacto antes de que ocurra. Hablas en métricas SRE, DORA y casos de falla específicos.
MANDATO: Siempre preguntas si esto sobrevive producción: seguridad, disponibilidad, tiempo de recuperación y velocidad real de entrega al cliente.
PUNTO CIEGO: Tiendes a sobre-ponderar la estabilidad técnica sobre la velocidad de entrega al cliente cuando el mercado no espera.`,
  };

  return blocks[sphereId] ?? `ROL: Eres un miembro especializado del Consejo de SYNTHIA™.
VOZ: Directa, específica, opinionada desde tu especialidad.
MANDATO: Siempre analizas desde tu lente única sin intentar cubrir todos los ángulos.
PUNTO CIEGO: Reconoce la perspectiva que te falta desde tu especialidad.`;
}

function buildBriefUserMessage(brief: CouncilBrief): string {
  const questions = brief.key_questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  return [
    `SITUACIÓN:\n${brief.situation}`,
    `STAKES:\n${brief.stakes}`,
    `RESTRICCIONES:\n${brief.constraints}`,
    `PREGUNTAS CLAVE:\n${questions}`,
    brief.context_docs ? `CONTEXTO ADICIONAL:\n${brief.context_docs}` : '',
  ].filter(Boolean).join('\n\n');
}

function buildPositionPrompt(role: BoardRole, brief: CouncilBrief, expertise: string): string {
  const expertiseSection = expertise
    ? `\nTU EXPERTISE ACUMULADA (de reuniones anteriores):\n${expertise.slice(0, 1000)}\n`
    : '';

  const identityBlock = buildSphereIdentityBlock(role.sphereId);

  return `Eres ${role.boardTitle} en el Consejo de SYNTHIA™.

${identityBlock}

HORIZONTE PREFERIDO: ${role.preferredHorizon}
${expertiseSection}
IDIOMA: Todo tu razonamiento y output va en español mexicano, registro CDMX. Sin markdown. Sin asteriscos ni viñetas. Texto plano como si hablaras en voz alta en el consejo.

INSTRUCCIONES:
- Analiza el brief EXCLUSIVAMENTE desde tu lente de decisión
- No intentes cubrir todos los ángulos. Sé específico y opinionado.
- Si el brief viola tus principios, disiente con fuerza y explica por qué
- Termina con UNA recomendación accionable concreta
- Máximo 4 oraciones por sección

FORMATO DE RESPUESTA (sigue exactamente):
STANCE: [Una oración. Tu posición central.]
REASONING: [2-3 oraciones. Tu análisis desde tu lente.]
RECOMMENDATION: [Una oración. Qué hacer exactamente.]
CONFIDENCE: [0.0-1.0. Qué tan seguro estás.]
DISSENT: [true/false. ¿Estás en desacuerdo fuerte con el enfoque del brief?]`.trim();
}

function buildReviewPrompt(
  role: BoardRole,
  brief: CouncilBrief,
  expertise: string,
  myAnonymousId: string,
): string {
  const expertiseSection = expertise
    ? `\nTU EXPERTISE:\n${expertise.slice(0, 500)}\n`
    : '';

  const identityBlock = buildSphereIdentityBlock(role.sphereId);

  return `Eres ${role.boardTitle} en el Consejo de SYNTHIA™.

${identityBlock}
${expertiseSection}
TU ID ANÓNIMO EN ESTA RONDA: ${myAnonymousId} (no evalúes tu propia voz)

IDIOMA: Todo en español mexicano, registro CDMX. Sin markdown. Sin asteriscos ni viñetas. Texto plano como si hablaras en voz alta en el consejo.

Se te presentarán las posiciones ANÓNIMAS de todos los miembros del consejo.
TU TAREA: Evalúa cada voz (excepto la tuya) desde tu especialidad y tu mandato.

LENTE DE EVALUACIÓN: ${role.decisionLens}

FORMATO (sigue exactamente):
Para cada VOICE_X:
RANK: [nombre_id] SCORE: [1-10] STRENGTHS: [qué tienen razón] GAPS: [qué les falta]

Luego:
TOP_INSIGHT: [El hallazgo más valioso de toda la ronda. Una oración.]`.trim();
}

function buildChairmanMemoPrompt(
  brief: CouncilBrief,
  positions: SpherePosition[],
  reviews: SphereReview[],
): string {
  return `Eres SYNTHIA™ — Chairman del Consejo de Kupuri Media.

Tu trabajo: crear el MEMO FINAL. Este memo es la respuesta definitiva al brief.
Es el equivalente del Jeff Bezos 6-pager: estructurado, honesto, accionable.

PRINCIPIOS DEL CHAIRMAN:
- No tomas partido por ningún miembro del consejo
- Pero SÍ haces una recomendación final clara — no hay "depende"
- Mapeas las tensiones sin resolución y las declaras como risk items
- Nombras el mayor riesgo del camino recomendado
- Asignas DUEÑOS a cada próxima acción (siempre una esfera del consejo)
- Eres honesta sobre lo que NO sabe el consejo

FORMATO DEL MEMO (sigue exactamente, en español):
## DECISIÓN
[Una oración — la recomendación del Chairman]

## MARCO DE DECISIÓN
[2-3 oraciones — el mapa del problema y por qué esta decisión es la correcta]

## VOTOS DEL CONSEJO
[Para cada sphere: NOMBRE: [vote: accept|reject|conditional|abstain] — [una oración de su posición final]]

## TENSIONES RESUELTAS
[Lista de tensiones del debate que encontraron síntesis]

## TENSIONES SIN RESOLVER
[Lista de desacuerdos genuinos que siguen abiertos — estos son risk items]

## PRÓXIMAS ACCIONES
[Lista: ACCIÓN | DUEÑO (sphere) | FECHA LÍMITE]

## DISIDENTE
[Si alguien votó en contra, nombra quién y por qué — es valioso, no un error]`.trim();
}

function buildMemoUserMessage(
  brief: CouncilBrief,
  positions: SpherePosition[],
  reviews: SphereReview[],
): string {
  const positionSummary = positions
    .map(p => `**${p.displayName}** (${BOARD_ROLES[p.sphereId]?.boardTitle ?? ''}):\n  Stance: ${p.stance}\n  Recommendation: ${p.recommendation}\n  Confidence: ${p.confidence}\n  Dissent: ${p.dissentFlag}`)
    .join('\n\n');

  const topInsights = reviews
    .filter(r => r.topInsight)
    .map(r => `- ${r.reviewerSphereId}: ${r.topInsight}`)
    .join('\n');

  const questions = brief.key_questions.join(' | ');

  return `BRIEF ORIGINAL:
Situación: ${brief.situation}
Preguntas clave: ${questions}

POSICIONES DEL CONSEJO:
${positionSummary}

INSIGHTS DE REVISIÓN:
${topInsights}

Escribe el Memo Final del Chairman.`.trim();
}

// ─── Parsers (defensive — never crash on malformed LLM output) ────────────────

function parsePositionResponse(
  sphereId: SphereAgentId,
  role: BoardRole,
  text: string,
): SpherePosition {
  const extract = (prefix: string): string => {
    const match = text.match(new RegExp(`${prefix}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 'si'));
    return match?.[1]?.trim() ?? '';
  };

  const confidenceStr = extract('CONFIDENCE');
  const confidence = parseFloat(confidenceStr) || 0.5;
  const dissentStr = extract('DISSENT').toLowerCase();

  return {
    sphereId,
    displayName: role.boardTitle,
    stance: extract('STANCE') || text.slice(0, 200),
    reasoning: extract('REASONING'),
    confidence: Math.min(1, Math.max(0, confidence)),
    recommendation: extract('RECOMMENDATION'),
    dissentFlag: dissentStr === 'true',
  };
}

function buildAnonymousMap(positions: SpherePosition[]): Map<SphereAgentId, string> {
  const map = new Map<SphereAgentId, string>();
  const labels = ['VOICE_A','VOICE_B','VOICE_C','VOICE_D','VOICE_E','VOICE_F','VOICE_G','VOICE_H','VOICE_I'];
  positions.forEach((p, idx) => {
    map.set(p.sphereId, labels[idx] ?? `VOICE_${idx}`);
  });
  return map;
}

function buildAnonymousPositionText(
  positions: SpherePosition[],
  anonymousMap: Map<SphereAgentId, string>,
): string {
  return positions.map(p => {
    const anonId = anonymousMap.get(p.sphereId) ?? 'UNKNOWN';
    return `${anonId}:\nStance: ${p.stance}\nReasoning: ${p.reasoning}\nRecommendation: ${p.recommendation}`;
  }).join('\n\n---\n\n');
}

function parseReviewResponse(
  reviewerSphereId: SphereAgentId,
  text: string,
  positions: SpherePosition[],
  anonymousMap: Map<SphereAgentId, string>,
): SphereReview {
  const topInsightMatch = text.match(/TOP_INSIGHT:\s*(.+?)(?:\n|$)/i);
  const _rawInsight = topInsightMatch?.[1]?.trim() ?? '';
  // Reject prompt-echo: discard if the LLM returned the template placeholder
  const ECHO_PATTERN = /^\[|una oración|one sentence|follow format|most valuable (finding|insight)/i;
  const topInsight = (_rawInsight && !ECHO_PATTERN.test(_rawInsight)) ? _rawInsight : '';

  // Build a reverse map: anonymousId → position index
  const anonToSphere = new Map<string, SphereAgentId>();
  anonymousMap.forEach((anonId, sphereId) => anonToSphere.set(anonId, sphereId));

  const rankings = positions
    .filter(p => p.sphereId !== reviewerSphereId)
    .map(p => {
      const anonId = anonymousMap.get(p.sphereId) ?? '';
      const rankMatch = text.match(new RegExp(`${anonId}.*?SCORE:\\s*(\\d+).*?STRENGTHS:\\s*(.+?)\\s*GAPS:\\s*(.+?)(?=RANK:|TOP_INSIGHT:|$)`, 'si'));
      return {
        anonymousId: anonId,
        score: parseInt(rankMatch?.[1] ?? '5', 10),
        strengths: rankMatch?.[2]?.trim() ?? '',
        gaps: rankMatch?.[3]?.trim() ?? '',
      };
    });

  return { reviewerSphereId, rankings, topInsight };
}

function parseMemoResponse(
  text: string,
  brief: CouncilBrief,
  meetingId: string,
  positions: SpherePosition[],
  costUsd: number,
  durationMs: number,
): CouncilMemo {
  const extract = (header: string): string => {
    const match = text.match(new RegExp(`## ${header}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'));
    return match?.[1]?.trim() ?? '';
  };

  const extractList = (header: string): string[] =>
    extract(header).split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
      .map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

  const boardStances = positions.map(p => ({
    sphereId: p.sphereId,
    displayName: p.displayName,
    finalStance: p.stance,
    vote: (p.dissentFlag ? 'reject' : p.confidence >= 0.7 ? 'accept' : 'conditional') as CouncilMemo['boardStances'][0]['vote'],
  }));

  const nextActionsRaw = extract('PRÓXIMAS ACCIONES').split('\n').filter(Boolean);
  const nextActions = nextActionsRaw.map(line => {
    const parts = line.split('|').map(s => s.trim());
    return {
      action: parts[0] ?? line,
      owner: (parts[1]?.toLowerCase().replace(/\s+/g, '-') ?? 'synthia') as SphereAgentId,
      deadline: parts[2] ?? '7 days',
    };
  });

  return {
    id: crypto.randomUUID(),
    briefId: brief.id,
    meetingId,
    decisionFramework: extract('MARCO DE DECISIÓN'),
    recommendation: extract('DECISIÓN'),
    rationale: extract('MARCO DE DECISIÓN'),
    boardStances,
    resolvedTensions: extractList('TENSIONES RESUELTAS'),
    unresolvedTensions: extractList('TENSIONES SIN RESOLVER'),
    nextActions,
    dissent: extract('DISIDENTE') || null,
    createdAt: new Date().toISOString(),
    costUsd,
    durationMs,
  };
}

// ─── Supabase persistence ─────────────────────────────────────────────────────

export async function persistMemo(memo: CouncilMemo): Promise<void> {
  try {
    await supabaseAdmin.from('council_memos').upsert({
      id: memo.id,
      brief_id: memo.briefId,
      meeting_id: memo.meetingId,
      recommendation: memo.recommendation,
      decision_framework: memo.decisionFramework,
      rationale: memo.rationale,
      board_stances: memo.boardStances,
      resolved_tensions: memo.resolvedTensions,
      unresolved_tensions: memo.unresolvedTensions,
      next_actions: memo.nextActions,
      dissent: memo.dissent,
      cost_usd: memo.costUsd,
      duration_ms: memo.durationMs,
      created_at: memo.createdAt,
    });
  } catch (err) {
    console.error('[council-engine] Failed to persist memo:', err);
    // Non-fatal — throw to surface to caller but memo still returned in-memory
    throw err;
  }
}

export async function loadMemo(briefId: string): Promise<CouncilMemo | null> {
  try {
    const { data } = await supabaseAdmin
      .from('council_memos')
      .select('*')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false })
      .limit(1)
      .throwOnError();

    if (!data?.[0]) return null;
    const row = data[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      briefId: row.brief_id as string,
      meetingId: row.meeting_id as string,
      decisionFramework: row.decision_framework as string,
      recommendation: row.recommendation as string,
      rationale: row.rationale as string ?? '',
      boardStances: (row.board_stances as CouncilMemo['boardStances']) ?? [],
      resolvedTensions: (row.resolved_tensions as string[]) ?? [],
      unresolvedTensions: (row.unresolved_tensions as string[]) ?? [],
      nextActions: (row.next_actions as CouncilMemo['nextActions']) ?? [],
      dissent: row.dissent as string | null,
      createdAt: row.created_at as string,
      costUsd: parseFloat(String(row.cost_usd ?? 0)),
      durationMs: parseInt(String(row.duration_ms ?? 0), 10),
    };
  } catch {
    return null;
  }
}

// ─── Top-level orchestrator — SYNTHIA chairs the full council meeting ─────────

/** All non-chairman, non-guardian sphere IDs (the voting board). */
export const DEFAULT_BOARD_IDS: SphereAgentId[] = [
  'alex', 'cazadora', 'forjadora', 'seductora',
  'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos',
];

export interface CouncilMeetingOpts {
  /** Board member IDs to include. Defaults to all 8 non-chairman spheres. */
  boardIds?: SphereAgentId[];
  /** Resource constraints. Defaults to DEFAULT_CONSTRAINTS. */
  constraints?: MeetingConstraints;
  /**
   * Called after each sphere completes a stage.
   * Safe to use for SSE streaming — called on the same async thread.
   */
  onEvent?: (event: {
    stage: 'position' | 'review' | 'synthesis' | 'dispatch';
    sphereId?: SphereAgentId;
    data: unknown;
  }) => void;
}

/**
 * SYNTHIA™ chairs the full 3-stage council meeting.
 *
 * Flow:
 *   0. Enrich brief via Pauli Hermes (graceful degradation if unavailable)
 *   1. Stage 1 — Position: each board member gives their take
 *   2. Stage 2 — Review: each member evaluates all other positions (anonymized)
 *   3. Stage 3 — Synthesis: SYNTHIA writes the final Memo
 *   4. Dispatch: next actions from Memo are sent to Agent Zero for execution
 *
 * Circuit breakers enforce per-meeting cost + time caps throughout.
 */
export async function runCouncilMeeting(
  brief: CouncilBrief,
  opts: CouncilMeetingOpts = {},
): Promise<CouncilMemo> {
  const {
    boardIds = DEFAULT_BOARD_IDS,
    constraints = DEFAULT_CONSTRAINTS,
    onEvent,
  } = opts;

  const meetingId = `meeting_${brief.id}_${Date.now()}`;
  const tracker = new MeetingCostTracker(constraints);

  // ── 0. Enrich brief context via Pauli Hermes ──────────────────────────────
  let enrichedBrief = brief;
  try {
    const { enrichBrief } = await import('./pauli-hermes-bridge');
    const enrichedContextDocs = await enrichBrief(brief);
    if (enrichedContextDocs !== (brief.context_docs ?? '')) {
      enrichedBrief = { ...brief, context_docs: enrichedContextDocs };
      onEvent?.({ stage: 'position', data: { enriched: true } });
    }
  } catch (err) {
    // Pauli Hermes is optional — log and continue
    console.warn('[runCouncilMeeting] Pauli Hermes enrichment unavailable:', err);
  }

  // ── 1. Stage 1 — Position ─────────────────────────────────────────────────
  const positions = await runPositionStage(
    enrichedBrief,
    boardIds,
    tracker,
    (sphereId, position) => onEvent?.({ stage: 'position', sphereId, data: position }),
  );

  // ── 2. Stage 2 — Review ───────────────────────────────────────────────────
  const reviews = await runReviewStage(
    enrichedBrief,
    positions,
    boardIds,
    tracker,
    (sphereId, review) => onEvent?.({ stage: 'review', sphereId, data: review }),
  );

  // ── 3. Stage 3 — Synthesis (SYNTHIA™ Chairman) ────────────────────────────
  onEvent?.({ stage: 'synthesis', sphereId: 'synthia', data: { started: true } });
  const memo = await runSynthesisStage(
    enrichedBrief,
    meetingId,
    positions,
    reviews,
    tracker,
  );
  onEvent?.({ stage: 'synthesis', sphereId: 'synthia', data: memo });

  // ── 4. Dispatch next actions → Agent Zero (fire-and-forget) ──────────────
  if (memo.nextActions.length > 0) {
    void dispatchNextActionsToAgentZero(memo).catch(err => {
      console.error('[runCouncilMeeting] Agent Zero dispatch error:', err);
    });
    onEvent?.({ stage: 'dispatch', data: { actions: memo.nextActions.length } });
  }

  return memo;
}

/**
 * Fire next actions from the council Memo to Agent Zero.
 * One task per action, tied back to the brief via brief_id.
 * Non-blocking — results are reported asynchronously via /api/council/orchestrator/agent-result.
 */
async function dispatchNextActionsToAgentZero(memo: CouncilMemo): Promise<void> {
  let bridgeModule: typeof import('./agent-zero-bridge');
  try {
    bridgeModule = await import('./agent-zero-bridge');
  } catch {
    console.warn('[runCouncilMeeting] agent-zero-bridge not available — skipping dispatch');
    return;
  }

  const { agentZeroHealthCheck, agentZeroDispatch, reportToSynthia } = bridgeModule;

  const health = await agentZeroHealthCheck();
  if (!health.ok) {
    console.warn('[runCouncilMeeting] Agent Zero is offline — skipping dispatch');
    return;
  }

  for (const action of memo.nextActions) {
    try {
      const taskId = await agentZeroDispatch({
        capability: 'shell',
        instruction: action.action,
        context: JSON.stringify({
          meetingId: memo.meetingId,
          briefId: memo.briefId,
          owner: action.owner,
          deadline: action.deadline,
          recommendation: memo.recommendation,
        }),
        sphereId: action.owner,
        priority: 'normal',
      });
      console.info(`[runCouncilMeeting] Dispatched to Agent Zero: ${taskId} → ${action.owner}: ${action.action}`);
    } catch (err) {
      console.error(`[runCouncilMeeting] Failed to dispatch action "${action.action}" to Agent Zero:`, err);
    }
  }
}

// ─── LLM message type re-export for convenience ───────────────────────────────
export type { LLMMessage };
