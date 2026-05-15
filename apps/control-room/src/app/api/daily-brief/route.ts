/**
 * Daily Brief API
 * GET /api/daily-brief?userId={userId}&language={es|en}
 *
 * Production: pulls real data from Supabase tables.
 * Calendar events: reads from agent_tasks table (scheduled items).
 * Trends: Firecrawl scrapes Google Trends LATAM if configured; falls back to curated static topics.
 * Revenue: reads from revenue_events table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBrief, BriefData } from '@/lib/daily-brief';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

async function fetchLatamTrends(): Promise<BriefData['googleTrends']> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    return [
      { search: 'emprendimiento digital LATAM', volume: 5400, trend: 'up', changePercent: 12 },
      { search: 'inteligencia artificial negocios México', volume: 4200, trend: 'up', changePercent: 8 },
      { search: 'marketing digital 2025', volume: 3100, trend: 'steady', changePercent: 0 },
    ];
  }

  try {
    const res = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://trends.google.com/trends/trendingsearches/daily?geo=MX',
        formats: ['extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              trends: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    search: { type: 'string' },
                    volume: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Firecrawl ${res.status}`);
    const data = await res.json();
    const trends = data.data?.extract?.trends || [];

    return trends.slice(0, 5).map((t: { search: string; volume?: number }, i: number) => ({
      search: t.search,
      volume: t.volume || 1000,
      trend: i < 2 ? 'up' : 'steady',
      changePercent: i < 2 ? 10 + i * 3 : 0,
    }));
  } catch (err) {
    console.warn('[daily-brief] Firecrawl trends failed, using fallback:', err);
    return [
      { search: 'emprendimiento digital', volume: 5400, trend: 'up', changePercent: 12 },
      { search: 'IA para negocios', volume: 4200, trend: 'up', changePercent: 8 },
      { search: 'marketing digital', volume: 3100, trend: 'steady', changePercent: 0 },
    ];
  }
}

async function fetchCalendarEvents(userId: string): Promise<BriefData['calendarEvents']> {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: tasks } = await supabaseClient
    .from('agent_tasks')
    .select('title, scheduled_at, estimated_duration_min')
    .eq('user_id', userId)
    .eq('task_type', 'calendar_event')
    .gte('scheduled_at', todayStart)
    .lte('scheduled_at', todayEnd)
    .order('scheduled_at', { ascending: true })
    .limit(10);

  if (!tasks?.length) return [];

  return tasks.map((t) => ({
    title: t.title,
    time: new Date(t.scheduled_at).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: t.estimated_duration_min || 30,
  }));
}

async function fetchYesterdayRevenue(userId: string): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ysStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
  const ysEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

  const { data } = await supabaseAdmin
    .from('revenue_events')
    .select('amount_usd')
    .eq('user_id', userId)
    .gte('created_at', ysStart)
    .lte('created_at', ysEnd);

  if (!data?.length) return 0;
  return data.reduce((sum, r) => sum + (r.amount_usd || 0), 0);
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const language = (req.nextUrl.searchParams.get('language') as 'es' | 'en') || 'es';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', details: userError?.message },
        { status: 404 }
      );
    }

    const [googleTrends, calendarEvents, yesterdayRevenue] = await Promise.all([
      fetchLatamTrends(),
      fetchCalendarEvents(userId),
      fetchYesterdayRevenue(userId),
    ]);

    const [
      { count: pendingMessages },
      { count: newLeads },
      { count: completedTasks },
    ] = await Promise.all([
      supabaseClient
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
      supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabaseClient
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const briefData: BriefData = {
      userName: userData.name || 'Emprendedora',
      businessName: userData.business_name || 'Mi Negocio',
      industry: userData.industry || 'Servicios',
      date: new Date(),
      language,
      googleTrends,
      calendarEvents,
      pendingMessages: pendingMessages || 0,
      newLeads: newLeads || 0,
      completedTasks: completedTasks || 0,
      revenue: yesterdayRevenue,
    };

    const brief = await generateDailyBrief(briefData);

    const { error: storeError } = await supabaseAdmin.from('daily_briefs').insert({
      user_id: userId,
      content: brief,
      generated_at: new Date().toISOString(),
      language,
    });

    if (storeError) {
      console.warn('[daily-brief] Failed to store brief:', storeError);
    }

    return NextResponse.json({ brief, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[daily-brief] Error:', error);
    return NextResponse.json({ error: 'Error generando brief' }, { status: 500 });
  }
}
