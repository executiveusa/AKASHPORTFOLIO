/**
 * GET /api/onboarding/stats
 *
 * Read-only viral funnel analytics from Supabase.
 * Returns stage completion rates, language split, and total unique sessions.
 * Cached at CDN edge for 60 s (stale-while-revalidate 300 s) to absorb traffic spikes.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 60; // ISR: regenerate every 60 s

interface FunnelRow {
  event_type: string;
  stage: number | null;
  lang: string;
  count: number;
}

export async function GET(): Promise<NextResponse> {
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'No DB configured' }, { status: 503 });
  }

  try {
    // Aggregate query via PostgREST
    const res = await fetch(
      `${supabaseUrl}/rest/v1/onboarding_events?select=event_type,stage,lang,count:id.count()&groupby=event_type,stage,lang`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`Supabase ${res.status}`);

    const rows: FunnelRow[] = await res.json();

    // Unique sessions
    const sessionsRes = await fetch(
      `${supabaseUrl}/rest/v1/onboarding_events?select=session_id&event_type=eq.view`,
      {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
        next: { revalidate: 60 },
      }
    );
    const sessions: Array<{ session_id: string }> = sessionsRes.ok ? await sessionsRes.json() : [];
    const uniqueSessions = new Set(sessions.map(r => r.session_id)).size;

    // Build funnel
    const stageCount = [0, 1, 2, 3].map(s =>
      rows.filter(r => r.event_type === 'stage_change' && r.stage === s)
           .reduce((sum, r) => sum + Number(r.count), 0)
    );
    const completions = rows
      .filter(r => r.event_type === 'complete')
      .reduce((sum, r) => sum + Number(r.count), 0);

    const langRows = rows.filter(r => r.event_type === 'lang_toggle');
    const enToggles = langRows.filter(r => r.lang === 'en').reduce((s, r) => s + Number(r.count), 0);
    const esToggles = langRows.filter(r => r.lang === 'es').reduce((s, r) => s + Number(r.count), 0);

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      uniqueSessions,
      completions,
      completionRate: uniqueSessions > 0 ? +(completions / uniqueSessions * 100).toFixed(1) : 0,
      funnel: {
        stage0_views: stageCount[0],
        stage1_reached: stageCount[1],
        stage2_reached: stageCount[2],
        stage3_reached: stageCount[3],
      },
      language: {
        enToggles,
        esDefault: uniqueSessions - enToggles,
        esToggles,
      },
    });
  } catch (err) {
    console.error('[onboarding/stats]', err);
    return NextResponse.json({ ok: false, error: 'Stats unavailable' }, { status: 503 });
  }
}
