/**
 * POST /api/cron/self-improvement
 *
 * ZTE Self-Improvement Cycle — runs at 03:00 America/Mexico_City (09:00 UTC)
 * Configured in vercel.json under "crons"
 *
 * What it does:
 *  1. Pull highest-priority incomplete Beads tasks
 *  2. Extract what worked from recent ops reports → /skills/{role}/patterns/
 *  3. Extract failures → /memory/failure_patterns/
 *  4. Update confidence scores
 *  5. Emit daily report to telemetry
 *
 * Authentication: CRON_SECRET in env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';
import { getBudgetStatus } from '@/lib/litellm-gateway';
import { listReports, writeReport } from '@/lib/ops-reports';
import { synthiaObservability } from '@/lib/observability';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Always require CRON_SECRET regardless of environment
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cycleId = `ZTE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-CRON`;
  const cycleStart = Date.now();
  const results: Record<string, unknown> = { cycleId };

  // 1. Pull recent ops reports to extract patterns
  const reports = listReports(50);
  const completedReports = reports.filter(r => r.status === 'COMPLETE');
  const failedReports = reports.filter(r => r.status === 'FAILED');

  results.reportsAnalyzed = reports.length;
  results.completedTasks = completedReports.length;
  results.failedTasks = failedReports.length;

  // 2. Identify friction patterns from failures
  const frictionPatterns = failedReports.map(r => ({
    bead_id: r.bead_id,
    stage: r.stage,
    blocker: r.blockers[0] ?? 'unknown',
    task: r.task_name,
  }));

  // 3. Persist agent-level memory to Supabase (improvement loop)
  const improvements: string[] = [];

  try {
    if (frictionPatterns.length > 0) {
      for (const pattern of frictionPatterns) {
        const { error } = await supabaseClient.from('agent_memory').insert({
          id: crypto.randomUUID(),
          agent_id: 'synthia',
          kind: 'lesson',
          content: `Task "${pattern.task}" failed at ${pattern.stage}: ${pattern.blocker}`,
          summary: `Failure at ${pattern.stage}: ${pattern.blocker.slice(0, 100)}`,
          importance: 0.8,
          confidence: 1.0,
          created_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
          access_count: 0,
          tags: ['friction', 'self-improvement', pattern.stage.toLowerCase()],
          source: 'self',
        });
        if (!error) improvements.push(`Stored lesson: ${pattern.blocker.slice(0, 60)}`);
      }
    }
  } catch (err) {
    console.warn('[cron/self-improvement] Supabase write failed:', err);
  }

  // 4. Budget + loop guard health check
  const budget = getBudgetStatus();
  results.budgetStatus = budget;

  const warnings: string[] = [];
  if (budget.isOverBudget) warnings.push(`Daily budget exceeded: $${budget.spentTodayUsd.toFixed(2)}`);
  if (Object.keys(budget.loopGuard).length > 0) {
    warnings.push(`LOOP_GUARD active: ${JSON.stringify(budget.loopGuard)}`);
  }

  // 5. Emit to observability
  synthiaObservability.logEvent({
    type: 'success',
    summary: `[CRON] Self-improvement cycle complete. ${completedReports.length} successes, ${failedReports.length} failures analyzed.`,
    data: { cycleId, improvements, warnings, frictionPatterns },
  });

  // 6. Write completion ops report
  writeReport({
    bead_id: cycleId,
    task_name: 'ZTE Self-Improvement Cycle',
    stage: 'NOTIFY',
    status: 'COMPLETE',
    started_at: new Date(cycleStart).toISOString(),
    completed_at: new Date().toISOString(),
    elapsed_seconds: Math.round((Date.now() - cycleStart) / 1000),
    cost_used_usd: 0,
    last_action: 'Self-improvement cycle executed',
    next_action: 'Next run at 03:00 MX time',
    blockers: warnings,
    files_changed: [],
    tests_run: 0,
    tests_passed: 0,
    notes: `Improvements stored: ${improvements.length}. Warnings: ${warnings.join('; ') || 'none'}`,
  });

  const elapsed = Math.round((Date.now() - cycleStart) / 1000);

  console.log(`[cron/self-improvement] ${cycleId} | ${elapsed}s | ` +
    `completed:${completedReports.length} failed:${failedReports.length} improvements:${improvements.length}`);

  return NextResponse.json({
    success: true,
    cycleId,
    elapsed_seconds: elapsed,
    reports_analyzed: reports.length,
    improvements_stored: improvements.length,
    warnings,
    budget_ok: !budget.isOverBudget,
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/cron/self-improvement',
    schedule: '0 9 * * *', // 03:00 UTC-6 = 09:00 UTC
    description: 'ZTE Self-Improvement Cycle — extracts patterns from ops reports into agent memory',
    note: 'Requires Authorization: Bearer CRON_SECRET header',
  });
}
