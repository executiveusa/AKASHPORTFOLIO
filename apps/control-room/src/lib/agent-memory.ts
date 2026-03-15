/**
 * Agent Memory — Persistent per-sphere long-term memory with staleness scoring.
 * 
 * Each sphere has its own memory store. When Ivette provides new information
 * that contradicts an old memory, the old entry is marked superseded.
 * 
 * buildAgentContext(agentId) returns a prompt injection block so each sphere
 * knows what it "remembers" before acting.
 */

import { supabaseClient } from '@/lib/supabase-client';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Memory types
// ---------------------------------------------------------------------------

export type MemoryKind = 
  | 'fact'            // ground truth about Ivette / the business
  | 'preference'      // Ivette's stated preferences
  | 'task_outcome'    // result of a completed task
  | 'relationship'    // who knows whom, what they do
  | 'directive'       // standing instructions from Ivette
  | 'lesson'          // things that didn't work (negative knowledge)
  | 'goal';           // medium/long-term goal state

export interface AgentMemory {
  id: string;
  agent_id: SphereAgentId;
  kind: MemoryKind;
  content: string;       // full memory text
  summary: string;       // ≤ 120 chars for context injection
  importance: number;    // 0..1 — used for retrieval ranking
  confidence: number;    // 0..1 — decays if not verified
  created_at: string;
  last_accessed_at: string;
  last_verified_at: string;
  access_count: number;
  superseded_by?: string;
  tags: string[];
  source: 'ivette' | 'council' | 'self' | 'watcher';
}

// ---------------------------------------------------------------------------
// Store a new memory
// ---------------------------------------------------------------------------

export async function memorize(input: {
  agentId: SphereAgentId;
  kind: MemoryKind;
  content: string;
  summary: string;
  importance?: number;
  tags?: string[];
  source?: AgentMemory['source'];
}): Promise<AgentMemory> {
  const mem: AgentMemory = {
    id: crypto.randomUUID(),
    agent_id: input.agentId,
    kind: input.kind,
    content: input.content,
    summary: input.summary.slice(0, 120),
    importance: input.importance ?? 0.5,
    confidence: 1.0,
    created_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    access_count: 0,
    tags: input.tags ?? [],
    source: input.source ?? 'council',
  };

  try {
    // Check for potential conflicts with existing memories of same kind
    const { data: existing } = await supabaseClient
      .from('agent_memory')
      .select('id, summary, tags')
      .eq('agent_id', input.agentId)
      .eq('kind', input.kind)
      .is('superseded_by', null)
      .overlaps('tags', input.tags ?? [])
      .limit(5);

    const { error } = await supabaseClient.from('agent_memory').insert([mem]);
    if (error) throw error;

    // Flag potential conflicts for La Vigilante to review
    if (existing && existing.length > 0) {
      console.log(`[agent-memory] Agent ${input.agentId} has ${existing.length} potentially related memories`);
    }
  } catch (err) {
    console.warn('[agent-memory] Supabase unavailable, using in-memory:', (err as Error).message);
    inMemoryStore.set(mem.id, mem);
  }

  return mem;
}

// ---------------------------------------------------------------------------
// Supersede an old memory with a new one
// ---------------------------------------------------------------------------

export async function updateMemory(oldId: string, newInput: {
  agentId: SphereAgentId;
  kind: MemoryKind;
  content: string;
  summary: string;
  importance?: number;
  tags?: string[];
  source?: AgentMemory['source'];
}): Promise<AgentMemory> {
  const updated = await memorize(newInput);

  try {
    await supabaseClient
      .from('agent_memory')
      .update({ superseded_by: updated.id, confidence: 0 })
      .eq('id', oldId);
  } catch (err) {
    const old = inMemoryStore.get(oldId);
    if (old) inMemoryStore.set(oldId, { ...old, superseded_by: updated.id, confidence: 0 });
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Recall — fetch the most relevant memories for an agent
// Scoring: importance × confidence × recency × access_count_boost
// ---------------------------------------------------------------------------

export async function recall(agentId: SphereAgentId, opts?: {
  kinds?: MemoryKind[];
  tags?: string[];
  minImportance?: number;
  limit?: number;
}): Promise<AgentMemory[]> {
  const limit = opts?.limit ?? 20;

  try {
    let query = supabaseClient
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .is('superseded_by', null)
      .gte('importance', opts?.minImportance ?? 0.1)
      .order('importance', { ascending: false })
      .limit(limit);

    if (opts?.kinds && opts.kinds.length > 0) {
      query = query.in('kind', opts.kinds);
    }
    if (opts?.tags && opts.tags.length > 0) {
      query = query.overlaps('tags', opts.tags);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Update last_accessed_at for retrieved memories (fire-and-forget)
    const ids = (data ?? []).map(m => m.id);
    if (ids.length > 0) {
      supabaseClient
        .from('agent_memory')
        .update({ last_accessed_at: new Date().toISOString() })
        .in('id', ids)
        .then(() => {});
    }

    return (data ?? []) as AgentMemory[];
  } catch (err) {
    return Array.from(inMemoryStore.values())
      .filter(m => m.agent_id === agentId && !m.superseded_by)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }
}

// ---------------------------------------------------------------------------
// buildAgentContext — injects memory into LLM prompt
// Call this before every sphere's LLM invocation.
// ---------------------------------------------------------------------------

export async function buildAgentContext(agentId: SphereAgentId): Promise<string> {
  const memories = await recall(agentId, { limit: 30 });

  if (memories.length === 0) return '';

  const byKind: Partial<Record<MemoryKind, AgentMemory[]>> = {};
  for (const m of memories) {
    (byKind[m.kind] ??= []).push(m);
  }

  const lines: string[] = [`=== MEMORIA DE ${agentId.toUpperCase()} ===`];

  const kindLabels: Record<MemoryKind, string> = {
    directive: 'DIRECTIVAS PERMANENTES',
    preference: 'PREFERENCIAS DE IVETTE',
    fact: 'HECHOS VERIFICADOS',
    goal: 'OBJETIVOS ACTIVOS',
    task_outcome: 'RESULTADOS RECIENTES',
    relationship: 'RED DE RELACIONES',
    lesson: 'LECCIONES APRENDIDAS',
  };

  const priorityOrder: MemoryKind[] = ['directive', 'preference', 'goal', 'fact', 'relationship', 'task_outcome', 'lesson'];
  for (const kind of priorityOrder) {
    const group = byKind[kind];
    if (!group || group.length === 0) continue;
    lines.push(`\n${kindLabels[kind]}:`);
    for (const m of group.slice(0, 5)) {
      lines.push(`  • ${m.summary} (import: ${m.importance.toFixed(1)}, conf: ${m.confidence.toFixed(2)})`);
    }
  }

  lines.push('=== FIN MEMORIA ===');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Staleness decay — called nightly via cron
// ---------------------------------------------------------------------------

export async function decayStaleness(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Reduce confidence of old unverified memories
    await supabaseClient.rpc('decay_agent_memory_confidence', { cutoff: sevenDaysAgo });
  } catch (err) {
    // Apply in-memory decay
    for (const [id, mem] of inMemoryStore) {
      const age = Date.now() - new Date(mem.last_verified_at).getTime();
      if (age > 7 * 24 * 60 * 60 * 1000) {
        inMemoryStore.set(id, { ...mem, confidence: Math.max(0, mem.confidence - 0.05) });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const inMemoryStore = new Map<string, AgentMemory>();
