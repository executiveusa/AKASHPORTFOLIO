/**
 * EL TEJEDOR™ — Integration Weaver Ghost Agent
 * Kupuri Media · Fantasmas Ghost Agents
 *
 * Orchestrates data flow between external APIs and Supabase.
 * Maintains the integration registry — what runs, when, and at what cost.
 *
 * Pattern: pull data from source → transform → push to Supabase + Vibe Graph
 */

import { supabaseAdmin } from "@/lib/supabase-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Integration {
  id: string;
  name: string;
  source: string;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: "ok" | "error" | "skip";
  costUsdEstimate: number;
}

export interface WeaverRunResult {
  integrationId: string;
  status: "ok" | "error" | "skip";
  rowsProcessed: number;
  costUsd: number;
  durationMs: number;
  error?: string;
}

export interface WeaverReport {
  ranAt: string;
  integrations: WeaverRunResult[];
  totalCostUsd: number;
  totalDurationMs: number;
}

// ---------------------------------------------------------------------------
// Registry (extend as integrations are added)
// ---------------------------------------------------------------------------

const INTEGRATION_REGISTRY: Integration[] = [
  {
    id: "vibe-decay",
    name: "Vibe Graph Confidence Decay",
    source: "internal",
    enabled: true,
    costUsdEstimate: 0,
  },
  {
    id: "agent-task-summary",
    name: "Agent Task Daily Summary",
    source: "supabase",
    enabled: true,
    costUsdEstimate: 0,
  },
  {
    id: "sphere-heartbeat",
    name: "Sphere Health Heartbeat",
    source: "internal",
    enabled: true,
    costUsdEstimate: 0,
  },
];

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export async function runIntegrations(opts?: {
  ids?: string[];
  dryRun?: boolean;
}): Promise<WeaverReport> {
  const ranAt = new Date().toISOString();
  const startMs = Date.now();
  const results: WeaverRunResult[] = [];

  const toRun = INTEGRATION_REGISTRY.filter(
    (i) => i.enabled && (!opts?.ids || opts.ids.includes(i.id))
  );

  for (const integration of toRun) {
    const result = await runIntegration(integration, opts?.dryRun ?? false);
    results.push(result);

    if (supabaseAdmin && !opts?.dryRun) {
      await supabaseAdmin
        .from("integration_runs")
        .insert({
          integration_id: integration.id,
          status: result.status,
          rows_processed: result.rowsProcessed,
          cost_usd: result.costUsd,
          duration_ms: result.durationMs,
          error: result.error ?? null,
          ran_at: ranAt,
        })
        .then(null, (err: Error) => console.warn("[EL_TEJEDOR] failed to log run:", err.message));
    }
  }

  return {
    ranAt,
    integrations: results,
    totalCostUsd: results.reduce((s, r) => s + r.costUsd, 0),
    totalDurationMs: Date.now() - startMs,
  };
}

async function runIntegration(integration: Integration, dryRun: boolean): Promise<WeaverRunResult> {
  const startMs = Date.now();

  try {
    switch (integration.id) {
      case "vibe-decay":
        return await runVibeDecay(dryRun, startMs);

      case "agent-task-summary":
        return await runTaskSummary(dryRun, startMs);

      case "sphere-heartbeat":
        return await runSphereHeartbeat(dryRun, startMs);

      default:
        return { integrationId: integration.id, status: "skip", rowsProcessed: 0, costUsd: 0, durationMs: Date.now() - startMs };
    }
  } catch (err) {
    return {
      integrationId: integration.id,
      status: "error",
      rowsProcessed: 0,
      costUsd: 0,
      durationMs: Date.now() - startMs,
      error: String(err),
    };
  }
}

// ── Individual integration runners ──────────────────────────────────────────

async function runVibeDecay(dryRun: boolean, startMs: number): Promise<WeaverRunResult> {
  if (!supabaseAdmin) return skip("vibe-decay", startMs);

  const decayFactor = 0.95;
  let rowsProcessed = 0;

  if (!dryRun) {
    const { data, error } = await supabaseAdmin
      .from("vibe_nodes")
      .select("id, confidence")
      .gt("confidence", 0.05);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      rowsProcessed = data.length;
      for (const node of data) {
        await supabaseAdmin
          .from("vibe_nodes")
          .update({ confidence: Math.max(0, (node.confidence as number) * decayFactor) })
          .eq("id", node.id)
          .then(null, () => {});
      }
    }
  }

  return { integrationId: "vibe-decay", status: "ok", rowsProcessed, costUsd: 0, durationMs: Date.now() - startMs };
}

async function runTaskSummary(dryRun: boolean, startMs: number): Promise<WeaverRunResult> {
  if (!supabaseAdmin) return skip("agent-task-summary", startMs);

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("agent_tasks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yesterday);

  if (error) throw new Error(error.message);

  if (!dryRun) {
    console.log(`[EL_TEJEDOR] agent-task-summary: ${count ?? 0} tasks in last 24h`);
  }

  return { integrationId: "agent-task-summary", status: "ok", rowsProcessed: count ?? 0, costUsd: 0, durationMs: Date.now() - startMs };
}

async function runSphereHeartbeat(_dryRun: boolean, startMs: number): Promise<WeaverRunResult> {
  const spheres = ["synthia", "alex", "cazadora", "forjadora", "seductora", "consejo", "dr-economia", "dra-cultura", "ing-teknos"];
  console.log(`[EL_TEJEDOR] heartbeat: ${spheres.length} spheres registered`);
  return { integrationId: "sphere-heartbeat", status: "ok", rowsProcessed: spheres.length, costUsd: 0, durationMs: Date.now() - startMs };
}

function skip(id: string, startMs: number): WeaverRunResult {
  return { integrationId: id, status: "skip", rowsProcessed: 0, costUsd: 0, durationMs: Date.now() - startMs };
}
