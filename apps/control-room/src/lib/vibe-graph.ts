/**
 * Vibe Graph — Synthia™ Sphere OS Context Engine
 * 
 * Prevents agent collision by giving each sphere a live map of the ecosystem.
 * Architecture: directed graph where nodes = agents/tasks/facts, edges = relationships.
 * 
 * Each node has a confidence score that decays over time.
 * When contradicted, old facts are superseded (not deleted) — full audit trail.
 * 
 * Agents read their subgraph slice before acting: GET /api/vibe/context?agent=X
 * Agents write new facts after learning: POST /api/vibe/ingest
 * Agents mark stale facts: PATCH /api/vibe/invalidate
 */

import { supabaseClient } from '@/lib/supabase-client';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Node / Edge types
// ---------------------------------------------------------------------------

export type NodeKind = 'agent' | 'task' | 'fact' | 'memory' | 'goal' | 'resource' | 'relationship';

export interface VibeNode {
  id: string;           // uuid
  kind: NodeKind;
  owner_agent_id: SphereAgentId | 'system';
  label: string;        // human-readable name
  content: string;      // full fact/memory text
  tags: string[];
  confidence: number;   // 0..1, decays 10%/day after 7 days
  created_at: string;   // ISO string
  last_verified_at: string;
  superseded_by?: string; // node id that replaces this one
  metadata: Record<string, unknown>;
}

export type EdgeKind = 
  | 'depends_on' | 'conflicts_with' | 'related_to' 
  | 'owns' | 'created' | 'supersedes' | 'references';

export interface VibeEdge {
  id: string;
  source_id: string; // node id
  target_id: string; // node id
  kind: EdgeKind;
  weight: number; // 0..1
  created_at: string;
}

// ---------------------------------------------------------------------------
// Ingest — add a new fact/node to the graph
// ---------------------------------------------------------------------------

export async function vibeIngest(input: {
  agentId: SphereAgentId | 'system';
  kind: NodeKind;
  label: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  relatesToIds?: string[]; // existing node IDs this relates to
}): Promise<VibeNode> {
  const node: VibeNode = {
    id: crypto.randomUUID(),
    kind: input.kind,
    owner_agent_id: input.agentId,
    label: input.label,
    content: input.content,
    tags: input.tags ?? [],
    confidence: 1.0,
    created_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    metadata: input.metadata ?? {},
  };

  try {
    const { error } = await supabaseClient.from('vibe_nodes').insert([node]);
    if (error) throw error;

    // Create edges for relationships
    if (input.relatesToIds && input.relatesToIds.length > 0) {
      const edges: VibeEdge[] = input.relatesToIds.map(targetId => ({
        id: crypto.randomUUID(),
        source_id: node.id,
        target_id: targetId,
        kind: 'related_to',
        weight: 0.8,
        created_at: new Date().toISOString(),
      }));
      await supabaseClient.from('vibe_edges').insert(edges);
    }
  } catch (err) {
    console.warn('[vibe-graph] Supabase unavailable, using in-memory fallback:', (err as Error).message);
    inMemoryNodes.set(node.id, node);
  }

  return node;
}

// ---------------------------------------------------------------------------
// Context query — returns a sphere's view of the ecosystem
// Used by each agent before acting to prevent collision
// ---------------------------------------------------------------------------

export interface VibeContext {
  agentId: SphereAgentId;
  ownNodes: VibeNode[];        // facts/tasks this agent owns
  sharedNodes: VibeNode[];     // high-confidence global facts
  activeAgents: string[];      // which agents are currently active
  pendingConflicts: VibeNode[]; // nodes with conflicting facts
  ecosystemSummary: string;    // compressed text for LLM context injection
}

export async function getVibeContext(agentId: SphereAgentId): Promise<VibeContext> {
  try {
    // Own nodes
    const { data: ownData } = await supabaseClient
      .from('vibe_nodes')
      .select('*')
      .eq('owner_agent_id', agentId)
      .is('superseded_by', null)
      .order('last_verified_at', { ascending: false })
      .limit(50);

    // High-confidence shared facts
    const { data: sharedData } = await supabaseClient
      .from('vibe_nodes')
      .select('*')
      .eq('kind', 'fact')
      .is('superseded_by', null)
      .gte('confidence', 0.7)
      .order('last_verified_at', { ascending: false })
      .limit(30);

    // Active agents (agent nodes updated in last 10 minutes)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: activeData } = await supabaseClient
      .from('vibe_nodes')
      .select('owner_agent_id')
      .eq('kind', 'agent')
      .gte('last_verified_at', tenMinAgo);

    const activeAgents = [...new Set((activeData ?? []).map(n => n.owner_agent_id))];

    const ownNodes = (ownData ?? []) as VibeNode[];
    const sharedNodes = (sharedData ?? []) as VibeNode[];

    // Detect conflicts (two nodes with high confidence saying opposite things)
    const pendingConflicts = sharedNodes.filter(n => 
      n.tags.includes('conflict') || n.content.toLowerCase().includes('contradicts')
    );

    const ecosystemSummary = buildEcosystemSummary(agentId, ownNodes, sharedNodes, activeAgents);

    return { agentId, ownNodes, sharedNodes, activeAgents, pendingConflicts, ecosystemSummary };
  } catch (err) {
    console.warn('[vibe-graph] Using in-memory context:', (err as Error).message);
    return buildMemoryContext(agentId);
  }
}

// ---------------------------------------------------------------------------
// Invalidation — mark a node as superseded
// ---------------------------------------------------------------------------

export async function vibeInvalidate(nodeId: string, newNodeId: string): Promise<void> {
  try {
    await supabaseClient
      .from('vibe_nodes')
      .update({ superseded_by: newNodeId, confidence: 0 })
      .eq('id', nodeId);
  } catch (err) {
    const node = inMemoryNodes.get(nodeId);
    if (node) inMemoryNodes.set(nodeId, { ...node, superseded_by: newNodeId, confidence: 0 });
  }
}

// ---------------------------------------------------------------------------
// Confidence decay — run nightly via cron
// Nodes older than 7 days without verification lose 10%/day
// ---------------------------------------------------------------------------

export async function decayConfidenceScores(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    // Supabase doesn't support arithmetic updates directly, use RPC
    await supabaseClient.rpc('decay_vibe_confidence', { cutoff: sevenDaysAgo });
  } catch (err) {
    console.warn('[vibe-graph] Confidence decay RPC unavailable:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Ecosystem summary builder — compressed text for LLM prompt injection
// ---------------------------------------------------------------------------

function buildEcosystemSummary(
  agentId: SphereAgentId,
  ownNodes: VibeNode[],
  sharedNodes: VibeNode[],
  activeAgents: string[]
): string {
  const lines: string[] = [
    `=== VIBE GRAPH CONTEXT for ${agentId.toUpperCase()} ===`,
    `Active agents: ${activeAgents.join(', ') || 'none'}`,
    '',
    `Your ${ownNodes.length} recent nodes:`,
    ...ownNodes.slice(0, 10).map(n => `  [${n.kind}] ${n.label} (conf: ${n.confidence.toFixed(2)})`),
    '',
    `Ecosystem shared facts (${sharedNodes.length}):`,
    ...sharedNodes.slice(0, 15).map(n => `  [${n.owner_agent_id}] ${n.label}`),
    '=== END CONTEXT ===',
  ];
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// In-memory fallback (when Supabase is unavailable)
// ---------------------------------------------------------------------------

const inMemoryNodes = new Map<string, VibeNode>();

function buildMemoryContext(agentId: SphereAgentId): VibeContext {
  const allNodes = Array.from(inMemoryNodes.values());
  const ownNodes = allNodes.filter(n => n.owner_agent_id === agentId);
  const sharedNodes = allNodes.filter(n => n.kind === 'fact' && n.confidence >= 0.7);
  return {
    agentId,
    ownNodes,
    sharedNodes,
    activeAgents: [],
    pendingConflicts: [],
    ecosystemSummary: buildEcosystemSummary(agentId, ownNodes, sharedNodes, []),
  };
}
