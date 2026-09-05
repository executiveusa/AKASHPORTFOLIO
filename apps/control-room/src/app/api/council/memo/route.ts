/**
 * GET /api/council/memo?briefId=…  (requireUser)
 *
 * Returns the closed meeting memo from the in-memory registry.
 * briefId and meetingId are the same value (they were set equal at meeting start).
 * 404 JSON if not found.
 *
 * This closes the dangling artifactRef emitted in meeting.end events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { getMeetingHistory } from '@/lib/council/registry';

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const briefId =
    req.nextUrl.searchParams.get('briefId') ??
    req.nextUrl.searchParams.get('meetingId');

  if (!briefId) {
    return NextResponse.json({ error: 'briefId is required' }, { status: 400 });
  }

  const history = getMeetingHistory();
  const entry = history.find(m => m.meetingId === briefId);

  if (!entry) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({
    meetingId:  entry.meetingId,
    topic:      entry.topic,
    decisions:  entry.decisions ?? [],
    coherence:  entry.coherence ?? null,
    closedAt:   entry.endedAt,
  });
}
