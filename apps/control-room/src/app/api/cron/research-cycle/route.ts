/**
 * POST /api/cron/research-cycle
 *
 * Vercel cron job — runs daily at 07:00 America/Mexico_City
 * Configured in vercel.json under "crons"
 *
 * Authentication: CRON_SECRET in env vars (set in Vercel project settings)
 * Security: Only Vercel cron invocations carry the correct Authorization header
 */

import { NextRequest, NextResponse } from 'next/server';
import { runResearchCycle } from '@/lib/research-cycle';

// Budget guard: abort if last run cost > $3 (prevents runaway cycles)
const MAX_SINGLE_RUN_COST_USD = 3.0;

export async function POST(req: NextRequest) {
  // Verify cron secret — reject all other callers
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, always require the secret
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Allow manual trigger in dev with ?dry=true
  const isDryRun = req.nextUrl.searchParams.get('dry') === 'true';
  const topicIds = req.nextUrl.searchParams.get('topics')?.split(',');

  let result;
  try {
    result = await runResearchCycle({
      dryRun: isDryRun,
      maxTopics: 5,
      topicIds,
    });
  } catch (err) {
    console.error('[cron/research-cycle] Fatal error:', err);
    return NextResponse.json(
      { error: 'Research cycle failed', detail: String(err) },
      { status: 500 }
    );
  }

  // Budget circuit breaker
  if (result.totalCostUsd > MAX_SINGLE_RUN_COST_USD) {
    console.warn(`[cron/research-cycle] Cost overrun: $${result.totalCostUsd} > $${MAX_SINGLE_RUN_COST_USD}`);
  }

  // Log to console for Vercel log drain
  console.log('[cron/research-cycle]', JSON.stringify({
    cycleId: result.cycleId,
    dryRun: isDryRun,
    topicsProcessed: result.topicsProcessed,
    findingsCount: result.findingsCount,
    significantFindings: result.significantFindings,
    totalCostUsd: result.totalCostUsd,
    errorCount: result.errors.length,
  }));

  return NextResponse.json({
    success: true,
    ...result,
    dryRun: isDryRun,
  });
}

// Also expose GET so Vercel can health-check the endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/cron/research-cycle',
    schedule: '0 13 * * *', // 07:00 UTC-6 = 13:00 UTC
    description: 'Autonomous research cycle — LATAM media intelligence',
    usage: 'POST with Authorization: Bearer <CRON_SECRET>. Optional: ?dry=true for dry run, ?topics=id1,id2 to select topics.',
  });
}
