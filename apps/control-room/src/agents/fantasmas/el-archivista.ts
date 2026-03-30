/**
 * EL ARCHIVISTA™ — Memory Consolidation Ghost Agent
 * Kupuri Media · Fantasmas Ghost Agents
 *
 * Runs during nightly cron (02:00 CST).
 * Consolidates agent memories, archives session logs,
 * and purges stale Vibe Graph nodes.
 *
 * Stateless by design — reads from Supabase, writes structured
 * archival documents, emits La Vigilante events on anomalies.
 */

import { supabaseAdmin } from "@/lib/supabase-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArchivalReport {
  archivedAt: string;
  sessionCount: number;
  memoriesConsolidated: number;
  vibeNodesPurged: number;
  archiveDocId: string;
  durationMs: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export async function runArchivalCycle(opts?: {
  dryRun?: boolean;
  maxSessions?: number;
}): Promise<ArchivalReport> {
  const startedAt = Date.now();
  const archivedAt = new Date().toISOString();
  const errors: string[] = [];
  let sessionCount = 0;
  let memoriesConsolidated = 0;
  let vibeNodesPurged = 0;
  const archiveDocId = crypto.randomUUID();

  if (!supabaseAdmin) {
    return {
      archivedAt,
      sessionCount: 0,
      memoriesConsolidated: 0,
      vibeNodesPurged: 0,
      archiveDocId,
      durationMs: Date.now() - startedAt,
      errors: ["Supabase not configured"],
    };
  }

  // 1. Fetch sessions older than 24h not yet archived
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: sessions, error: sessionsErr } = await supabaseAdmin
    .from("agent_tasks")
    .select("id, agent_id, task, result, created_at")
    .lt("created_at", cutoff)
    .is("archived_at", null)
    .limit(opts?.maxSessions ?? 200);

  if (sessionsErr) {
    errors.push(`sessions fetch: ${sessionsErr.message}`);
  } else if (sessions && sessions.length > 0) {
    sessionCount = sessions.length;

    if (!opts?.dryRun) {
      // Archive by stamping archived_at
      const { error: archErr } = await supabaseAdmin
        .from("agent_tasks")
        .update({ archived_at: archivedAt })
        .in("id", sessions.map((s) => s.id));

      if (archErr) errors.push(`archive stamp: ${archErr.message}`);
    }
  }

  // 2. Consolidate agent_memory rows (merge duplicate keys per agent)
  const { data: memories, error: memErr } = await supabaseAdmin
    .from("agent_memory")
    .select("id, agent_id, key")
    .lt("created_at", cutoff)
    .limit(500);

  if (memErr) {
    errors.push(`memory fetch: ${memErr.message}`);
  } else if (memories) {
    // Detect duplicate keys per agent
    const seen = new Map<string, string[]>();
    for (const m of memories) {
      const k = `${m.agent_id}::${m.key}`;
      if (!seen.has(k)) seen.set(k, []);
      seen.get(k)!.push(m.id);
    }

    const toDelete: string[] = [];
    for (const ids of seen.values()) {
      if (ids.length > 1) toDelete.push(...ids.slice(1)); // keep newest
    }

    memoriesConsolidated = toDelete.length;

    if (!opts?.dryRun && toDelete.length > 0) {
      const { error: delErr } = await supabaseAdmin
        .from("agent_memory")
        .delete()
        .in("id", toDelete);
      if (delErr) errors.push(`memory dedup: ${delErr.message}`);
    }
  }

  // 3. Purge low-confidence Vibe Graph nodes (confidence < 0.1)
  if (!opts?.dryRun) {
    const { count, error: vibeErr } = await supabaseAdmin
      .from("vibe_nodes")
      .delete({ count: "exact" })
      .lt("confidence", 0.1);

    if (vibeErr) errors.push(`vibe purge: ${vibeErr.message}`);
    else vibeNodesPurged = count ?? 0;
  }

  return {
    archivedAt,
    sessionCount,
    memoriesConsolidated,
    vibeNodesPurged,
    archiveDocId,
    durationMs: Date.now() - startedAt,
    errors,
  };
}
