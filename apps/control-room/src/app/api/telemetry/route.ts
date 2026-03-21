/**
 * Telemetry API — ZTE Observation Loop
 *
 * GET  /api/telemetry           — recent events (last N, default 50)
 * GET  /api/telemetry?type=X    — filter by event type
 * POST /api/telemetry           — ingest an event (internal agents use this)
 * GET  /api/telemetry/budget    — LLM budget status + loop guard state
 * GET  /api/telemetry/reports   — list ops/reports files (ZTE stage 7 outputs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthiaObservability } from '@/lib/observability';
import { getBudgetStatus, getLoopGuardStatus } from '@/lib/litellm-gateway';
import { listReports } from '@/lib/ops-reports';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// GET — observation loop surface
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get('view') ?? 'events';
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10), 200);
  const typeFilter = req.nextUrl.searchParams.get('type');

  if (view === 'budget') {
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      budget: getBudgetStatus(),
      loopGuard: getLoopGuardStatus(),
    });
  }

  if (view === 'reports') {
    const reports = listReports(limit);
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      count: reports.length,
      reports,
    });
  }

  // Default: events
  let events = synthiaObservability.getRecentEvents(limit);
  if (typeFilter) {
    events = events.filter(e => e.type === typeFilter);
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    count: events.length,
    events,
  });
}

// ---------------------------------------------------------------------------
// POST — ingest event from internal agents
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, summary, data, sessionId } = body as {
    type?: string;
    summary?: string;
    data?: unknown;
    sessionId?: string;
  };

  if (!type || !summary) {
    return NextResponse.json({ error: 'type and summary are required' }, { status: 400 });
  }

  const validTypes = ['tool_call', 'reasoning', 'state_change', 'error', 'success', 'info'] as const;
  const eventType = validTypes.includes(type as typeof validTypes[number])
    ? (type as typeof validTypes[number])
    : 'info';

  const event = synthiaObservability.logEvent({
    sessionId: sessionId as string | undefined,
    type: eventType,
    summary: summary as string,
    data: data ?? {},
  });

  return NextResponse.json({ ok: true, eventId: event.id }, { status: 201 });
}
