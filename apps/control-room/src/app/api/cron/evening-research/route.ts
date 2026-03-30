/**
 * POST /api/cron/evening-research
 *
 * Vercel cron job — runs daily at 19:00 America/Mexico_City (01:00 UTC next day)
 * Configured in vercel.json: { "path": "/api/cron/evening-research", "schedule": "0 1 * * *" }
 *
 * Complements the morning research-cycle (07:00 CST).
 * Evening run focuses on LATAM afternoon news, social signals, and arbitrage alerts.
 *
 * Authentication: CRON_SECRET in env vars (set in Vercel project settings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runResearchCycle } from '@/lib/research-cycle';

const MAX_SINGLE_RUN_COST_USD = 3.0;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const isDryRun = req.nextUrl.searchParams.get('dry') === 'true';
  const topicIds = req.nextUrl.searchParams.get('topics')?.split(',');

  let result;
  try {
    result = await runResearchCycle({
      dryRun: isDryRun,
      maxTopics: 5,
      topicIds,
      // Evening cycle label — used in nightly-summary aggregation
      cycleLabel: 'evening',
    });
  } catch (err) {
    console.error('[cron/evening-research] Fatal error:', err);
    return NextResponse.json(
      { error: 'Evening research cycle failed', detail: String(err) },
      { status: 500 }
    );
  }

  if (result.totalCostUsd > MAX_SINGLE_RUN_COST_USD) {
    console.warn(`[cron/evening-research] Cost overrun: $${result.totalCostUsd} > $${MAX_SINGLE_RUN_COST_USD}`);
  }

  console.log('[cron/evening-research]', JSON.stringify({
    cycleId:              result.cycleId,
    cycleLabel:           'evening',
    dryRun:               isDryRun,
    topicsProcessed:      result.topicsProcessed,
    findingsCount:        result.findingsCount,
    significantFindings:  result.significantFindings,
    totalCostUsd:         result.totalCostUsd,
    timestamp:            new Date().toISOString(),
  }));

  return NextResponse.json({
    ok:                   true,
    cycleId:              result.cycleId,
    cycleLabel:           'evening',
    topicsProcessed:      result.topicsProcessed,
    findingsCount:        result.findingsCount,
    significantFindings:  result.significantFindings,
    totalCostUsd:         result.totalCostUsd,
    dryRun:               isDryRun,
    timestamp:            new Date().toISOString(),
  });
}

// Allow GET for quick health check / manual trigger in dev
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST' }, { status: 405 });
  }
  return POST(req);
}
