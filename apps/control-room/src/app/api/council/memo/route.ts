/**
 * GET /api/council/memo?briefId=…  (requireUser)
 *
 * Returns the closed meeting memo from the in-memory registry.
 * On in-memory miss, falls back to Supabase sphere_meetings table.
 * briefId and meetingId are the same value (set equal at meeting start).
 * 404 JSON if not found in either store.
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

  // Try in-memory registry first (same instance, fast path)
  const history = getMeetingHistory();
  const entry = history.find(m => m.meetingId === briefId);

  if (entry) {
    return NextResponse.json({
      meetingId:  entry.meetingId,
      topic:      entry.topic,
      decisions:  entry.decisions ?? [],
      coherence:  entry.coherence ?? null,
      closedAt:   entry.endedAt,
    });
  }

  // Fallback: query Supabase sphere_meetings (cross-instance / process restart)
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-client');
    const { data, error } = await supabaseAdmin
      .from('sphere_meetings')
      .select('meeting_id, topic, decisions, coherence, ended_at')
      .eq('meeting_id', briefId)
      .single();

    if (!error && data) {
      return NextResponse.json({
        meetingId:  (data as Record<string, unknown>).meeting_id as string,
        topic:      (data as Record<string, unknown>).topic as string,
        decisions:  ((data as Record<string, unknown>).decisions as string[] | null) ?? [],
        coherence:  ((data as Record<string, unknown>).coherence as number | null) ?? null,
        closedAt:   (data as Record<string, unknown>).ended_at as string,
      });
    }
  } catch {
    // Supabase unavailable — fall through to 404
  }

  return NextResponse.json({ error: 'not found' }, { status: 404 });
}
