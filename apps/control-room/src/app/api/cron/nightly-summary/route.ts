/**
 * /api/cron/nightly-summary — ZTE Nightly Synthesis Loop
 *
 * Runs at 02:00 CST (08:00 UTC) daily via Vercel cron.
 * Vercel.json schedule: "0 8 * * *"
 *
 * ZTE Stage responsibilities:
 *   1. Decay vibe graph confidence (Meadows delay feedback)
 *   2. Summarize memory entries → consolidate patterns
 *   3. Sweep circuit breakers — reset if stale
 *   4. Write ops/report for previous day
 *   5. POST /api/telemetry to log nightly cycle
 *   6. Emit system score (Meadows 12-axis) — flag if < 8.5
 *
 * CRON_SECRET header must match env var.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getBudgetStatus, resetLoopGuard, getLoopGuardStatus } from '@/lib/litellm-gateway';
import { writeReport } from '@/lib/ops-reports';
import { synthiaObservability } from '@/lib/observability';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Auth helper — identical check used across all cron routes
// ---------------------------------------------------------------------------

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startMs = Date.now();
  const beadId = `ZTE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-NIGHTLY`;
  const summary: string[] = [];
  const errors: string[] = [];

  // -------------------------------------------------------------------------
  // Step 1: Decay vibe graph confidence
  // -------------------------------------------------------------------------
  let vibeDecayed = 0;
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    const { data: staleNodes } = await supabaseAdmin
      .from('vibe_nodes')
      .select('id, confidence')
      .lt('created_at', cutoff)
      .is('superseded_by', null);

    if (staleNodes && staleNodes.length > 0) {
      for (const node of staleNodes) {
        const newConf = Math.max(0.1, ((node.confidence as number) ?? 1) * 0.85);
        await supabaseAdmin.from('vibe_nodes').update({ confidence: newConf }).eq('id', node.id);
      }
      vibeDecayed = staleNodes.length;
    }
    summary.push(`Vibe decay applied to ${vibeDecayed} stale nodes`);
  } catch (err) {
    errors.push(`Vibe decay failed: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // Step 2: Consolidate agent memory patterns
  // -------------------------------------------------------------------------
  let memoriesConsolidated = 0;
  try {
    const { data: memories } = await supabaseAdmin
      .from('agent_memory')
      .select('id, agent_id, summary, importance')
      .gt('importance', 0.9)
      .is('superseded_by', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (memories && memories.length > 10) {
      // Flag high-importance patterns for agent review (structure for future reinforcing loop)
      await supabaseAdmin.from('vibe_nodes').insert({
        owner_agent_id: 'la-vigilante',
        kind: 'pattern',
        label: `Nightly memory synthesis: ${memories.length} high-importance memories`,
        content: JSON.stringify({ count: memories.length, agents: [...new Set(memories.map((m: Record<string, unknown>) => m.agent_id as string))] }),
        confidence: 0.9,
      });
      memoriesConsolidated = memories.length;
    }
    summary.push(`Memory consolidation: ${memoriesConsolidated} patterns synthesized`);
  } catch (err) {
    errors.push(`Memory consolidation failed: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // Step 3: Sweep stale circuit breakers (auto-reset if >24h old)
  // -------------------------------------------------------------------------
  const loopStatus = getLoopGuardStatus();
  const haltedKeys = Object.entries(loopStatus)
    .filter(([, v]) => v.haltedAt && Date.now() - new Date(v.haltedAt).getTime() > 86400000);

  if (haltedKeys.length > 0) {
    haltedKeys.forEach(([key]) => resetLoopGuard(key));
    summary.push(`Auto-cleared ${haltedKeys.length} stale circuit breakers: ${haltedKeys.map(([k]) => k).join(', ')}`);
  } else {
    summary.push('Circuit breakers healthy — no stale halts');
  }

  // -------------------------------------------------------------------------
  // Step 4: Compute daily Meadows systems score
  // -------------------------------------------------------------------------
  const budget = getBudgetStatus();
  const agentCount = await getAgentCount();

  // Rough daily score computation (balancing feedback — alerts if < 8.5)
  const scores = {
    STK: agentCount > 0 ? 8.5 : 4,       // Stocks: agents registered in DB
    FLW: budget.percentUsed < 80 ? 8 : 5,  // Flows: budget flow healthy
    FBK: errors.length === 0 ? 9 : 6,       // Feedback: no cron errors
    DLY: 8,                                  // Delays: cron ran on schedule
    LVR: 7,                                  // Leverage: balancing loops present
    RSL: errors.length === 0 ? 8 : 5,       // Resilience: no errors
    VIS: 8,                                  // Visibility: telemetry + watcher present
    AGT: Math.min(10, agentCount),           // Agency: active agents
    BLR: haltedKeys.length === 0 ? 9 : 4,   // Blast Radius: no circuit issues
    LRN: memoriesConsolidated > 0 ? 7 : 4,  // Learning: memory consolidation
    SEC: 9,                                  // Security: env var secrets only
    DOC: 7,                                  // Documentation: ops reports written
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const qualityGatePassed = overallScore >= 8.5;

  summary.push(`Systems score: ${overallScore.toFixed(2)}/10 ${qualityGatePassed ? '✅ PASS' : '⚠ BELOW 8.5 THRESHOLD'}`);

  if (!qualityGatePassed) {
    errors.push(`Quality gate FAIL: ${overallScore.toFixed(2)}/10 < 8.5 — redesign required in low-scoring axes`);
  }

  // -------------------------------------------------------------------------
  // Step 5: Write ops report
  // -------------------------------------------------------------------------
  try {
    writeReport({
      bead_id: beadId,
      task_name: 'Nightly Synthesis Loop',
      stage: 'NOTIFY',
      status: errors.length > 0 ? 'FAILED' : 'COMPLETE',
      started_at: new Date(startMs).toISOString(),
      completed_at: new Date().toISOString(),
      elapsed_seconds: Math.round((Date.now() - startMs) / 1000),
      cost_used_usd: 0,
      last_action: summary[summary.length - 1] ?? 'completed',
      next_action: qualityGatePassed ? 'Resume normal operations' : 'Audit low-scoring axes before next sprint',
      blockers: errors,
      files_changed: [],
      tests_run: 0,
      tests_passed: 0,
      notes: summary.join(' | '),
      systems_score: { ...scores, overall: overallScore },
    });
  } catch (err) {
    errors.push(`Ops report write failed: ${(err as Error).message}`);
  }

  // -------------------------------------------------------------------------
  // Step 6: Log to telemetry
  // -------------------------------------------------------------------------
  synthiaObservability.logEvent({
    type: errors.length > 0 ? 'error' : 'success',
    summary: `Nightly synthesis ${beadId}: score ${overallScore.toFixed(2)}/10`,
    data: { summary, errors, scores },
  });

  const durationMs = Date.now() - startMs;

  return NextResponse.json({
    ok: errors.length === 0,
    bead_id: beadId,
    duration_ms: durationMs,
    systems_score: { ...scores, overall: overallScore },
    quality_gate_passed: qualityGatePassed,
    summary,
    errors,
  });
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function getAgentCount(): Promise<number> {
  try {
    const { count } = await supabaseAdmin
      .from('agent_state')
      .select('*', { count: 'exact', head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}
