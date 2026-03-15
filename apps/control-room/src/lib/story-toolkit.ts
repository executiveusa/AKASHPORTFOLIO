/**
 * Story Toolkit — post-meeting synthesis pipeline.
 *
 * After a SphereOS council meeting closes, this module:
 *  1. Collapses the full transcript into a structured summary
 *  2. Extracts decisions, action items, open questions, and PRD fragments
 *  3. Persists the summary to Supabase sphere_meetings
 *  4. Pushes relevant decisions to agent memory (so spheres "remember" next time)
 *  5. Emits a story-arc update to the Vibe Graph
 */

import { callLLM } from '@/lib/litellm-gateway';
import { supabaseClient } from '@/lib/supabase-client';
import { memorize } from '@/lib/agent-memory';
import { vibeIngest } from '@/lib/vibe-graph';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MeetingTranscript {
  meetingId: string;
  topic: string;
  startedAt: string;
  closedAt: string;
  turns: TranscriptTurn[];
}

export interface TranscriptTurn {
  agentId: SphereAgentId | 'ivette';
  text: string;
  timestamp: string;
  signalKind?: string;
}

export interface MeetingSummary {
  meetingId: string;
  topic: string;
  narrative: string;          // 3-5 sentence story arc
  decisions: Decision[];
  actionItems: ActionItem[];
  openQuestions: string[];
  prdFragment?: string;       // if a product decision was made
  generatedAt: string;
}

export interface Decision {
  id: string;
  text: string;
  madeBy: SphereAgentId | 'ivette' | 'consensus';
  confidence: number;
  tags: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: SphereAgentId | 'ivette';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueHint?: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function synthesizeMeeting(transcript: MeetingTranscript): Promise<MeetingSummary> {
  const raw = buildTranscriptText(transcript);

  const [narrativeResult, structuredResult] = await Promise.all([
    callLLM([
      {
        role: 'system',
        content: NARRATIVE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Sintetiza esta reunión del consejo:\n\nTema: ${transcript.topic}\n\n${raw}`,
      },
    ], { maxTokens: 600, temperature: 0.4 }),
    callLLM([
      {
        role: 'system',
        content: STRUCTURED_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Extrae decisiones, tareas y preguntas de esta reunión en formato JSON:\n\n${raw}`,
      },
    ], { maxTokens: 1200, temperature: 0.1 }),
  ]);

  const narrative = narrativeResult.kind === 'ok' ? narrativeResult.content : transcript.topic;
  const structured = parseStructuredOutput(structuredResult.kind === 'ok' ? structuredResult.content : '{}');

  const summary: MeetingSummary = {
    meetingId: transcript.meetingId,
    topic: transcript.topic,
    narrative,
    decisions: structured.decisions ?? [],
    actionItems: structured.actionItems ?? [],
    openQuestions: structured.openQuestions ?? [],
    prdFragment: structured.prdFragment,
    generatedAt: new Date().toISOString(),
  };

  // Persist + propagate in parallel
  await Promise.all([
    persistSummary(summary, transcript),
    propagateToMemory(summary),
    propagateToVibeGraph(summary),
  ]);

  return summary;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

async function persistSummary(summary: MeetingSummary, transcript: MeetingTranscript): Promise<void> {
  try {
    await supabaseClient.from('sphere_meetings').upsert([
      {
        id: summary.meetingId,
        topic: summary.topic,
        narrative: summary.narrative,
        decisions: summary.decisions,
        action_items: summary.actionItems,
        open_questions: summary.openQuestions,
        prd_fragment: summary.prdFragment ?? null,
        turn_count: transcript.turns.length,
        started_at: transcript.startedAt,
        closed_at: transcript.closedAt,
        generated_at: summary.generatedAt,
      },
    ]);
  } catch (err) {
    console.warn('[story-toolkit] Supabase persist failed:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Propagate decisions into agent memory (so spheres remember decisions)
// ---------------------------------------------------------------------------

async function propagateToMemory(summary: MeetingSummary): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  for (const decision of summary.decisions) {
    const target = decision.madeBy !== 'ivette' && decision.madeBy !== 'consensus'
      ? decision.madeBy
      : null;

    if (target) {
      tasks.push(
        memorize({
          agentId: target,
          kind: 'task_outcome',
          content: `[Decisión en reunión "${summary.topic}"] ${decision.text}`,
          summary: decision.text.slice(0, 120),
          importance: decision.confidence,
          tags: ['decision', 'meeting', ...decision.tags],
          source: 'council',
        })
      );
    }
  }

  for (const item of summary.actionItems) {
    if (item.assignedTo !== 'ivette') {
      tasks.push(
        memorize({
          agentId: item.assignedTo,
          kind: 'directive',
          content: `[Tarea asignada en "${summary.topic}"] ${item.title}: ${item.description}`,
          summary: item.title.slice(0, 120),
          importance: item.priority === 'critical' ? 1.0 : item.priority === 'high' ? 0.8 : 0.6,
          tags: ['action-item', item.priority, ...item.tags],
          source: 'council',
        })
      );
    }
  }

  await Promise.all(tasks);
}

// ---------------------------------------------------------------------------
// Push summary arc to Vibe Graph
// ---------------------------------------------------------------------------

async function propagateToVibeGraph(summary: MeetingSummary): Promise<void> {
  await vibeIngest({
    agentId: 'system',
    kind: 'fact',
    label: `Meeting: ${summary.topic}`,
    content: `${summary.narrative}\n\nDecisiones (${summary.decisions.length}): ${
      summary.decisions.map(d => d.text).join('; ')
    }`,
    tags: ['meeting-summary', 'council'],
    metadata: { meetingId: summary.meetingId },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTranscriptText(transcript: MeetingTranscript): string {
  return transcript.turns
    .map(t => `[${t.timestamp}] ${t.agentId.toUpperCase()}: ${t.text}`)
    .join('\n');
}

function parseStructuredOutput(raw: string): {
  decisions?: Decision[];
  actionItems?: ActionItem[];
  openQuestions?: string[];
  prdFragment?: string;
} {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ?? raw.match(/({[\s\S]*})/);
    if (!jsonMatch) return {};
    const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
    return {
      decisions: (parsed.decisions ?? []).map((d: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        text: String(d.text ?? ''),
        madeBy: String(d.madeBy ?? 'consensus') as Decision['madeBy'],
        confidence: Number(d.confidence ?? 0.8),
        tags: Array.isArray(d.tags) ? d.tags as string[] : [],
      })),
      actionItems: (parsed.actionItems ?? parsed.action_items ?? []).map((a: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        title: String(a.title ?? ''),
        description: String(a.description ?? ''),
        assignedTo: String(a.assignedTo ?? a.assigned_to ?? 'synthia') as ActionItem['assignedTo'],
        priority: (['critical','high','medium','low'].includes(String(a.priority)) ? a.priority : 'medium') as ActionItem['priority'],
        dueHint: a.dueHint ? String(a.dueHint) : undefined,
        tags: Array.isArray(a.tags) ? a.tags as string[] : [],
      })),
      openQuestions: Array.isArray(parsed.openQuestions) ? parsed.openQuestions.map(String) : [],
      prdFragment: parsed.prdFragment ? String(parsed.prdFragment) : undefined,
    };
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const NARRATIVE_SYSTEM_PROMPT = `
Eres el cronista oficial del Consejo Synthia™ Sphere OS. 
Tu tarea: escribir una síntesis narrativa de 3-5 oraciones de la reunión.
Escribe en español neutro. Incluye: tema principal, postura de cada esfera, decisión central.
Sé concreto — no menciones "la IA dijo" sino el nombre del agente.
`.trim();

const STRUCTURED_SYSTEM_PROMPT = `
Extrae información estructurada de la reunión del consejo en JSON con esta forma exacta:
{
  "decisions": [{ "text": "...", "madeBy": "synthia|alex|...|consensus", "confidence": 0.0-1.0, "tags": [] }],
  "actionItems": [{ "title": "...", "description": "...", "assignedTo": "synthia|...|ivette", "priority": "critical|high|medium|low", "dueHint": "...", "tags": [] }],
  "openQuestions": ["...", "..."],
  "prdFragment": "Si hubo decisión de producto, resume aquí. Sino null."
}
Solo responde con el JSON, sin texto adicional.
`.trim();
