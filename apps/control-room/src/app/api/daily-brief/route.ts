/**
 * Daily Brief API Endpoint
 * GET /api/daily-brief?userId={userId} - Generate daily brief
 * Called by cron job daily at 8am CDMX
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBrief, BriefData } from '@/lib/daily-brief';
import { supabaseClient } from '@/lib/supabase-client';

export const runtime = 'nodejs';

interface DailyBriefRequest {
  userId: string;
  language?: 'es' | 'en';
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const language =
      (req.nextUrl.searchParams.get('language') as 'es' | 'en') || 'es';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Fetch user context from Supabase
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      );
    }

    // Fetch Google Trends data (mock for now - would integrate with SerpAPI)
    const googleTrends = [
      { search: 'emprendimiento digital', volume: 5400, trend: 'up' as const, changePercent: 12 },
      { search: 'inteligencia artificial negocios', volume: 4200, trend: 'up' as const, changePercent: 8 },
      { search: 'marketing digital', volume: 3100, trend: 'steady' as const, changePercent: 0 },
    ];

    // Fetch calendar events (mock - would integrate with Cal.com or Google Calendar)
    const calendarEvents = [
      { title: 'Junta con cliente', time: '10:00 AM', duration: 30 },
      { title: 'Revisión de proyectos', time: '11:30 AM', duration: 45 },
      { title: 'Almuerzo estratégico', time: '1:00 PM', duration: 60 },
    ];

    // Fetch stats from Supabase
    const { count: pendingMessages } = await supabaseClient
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    const { count: newLeads } = await supabaseClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: completedTasks } = await supabaseClient
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Fetch yesterday's revenue (mock)
    const yesterdayRevenue = 0;

    // Generate brief
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

    // Store brief in Supabase for dashboard display
    const { error: storageError } = await supabaseClient
      .from('daily_briefs')
      .insert({
        user_id: userId,
        date: new Date().toISOString(),
        language,
        content: brief.fullBrief,
        sections: {
          greeting: brief.greeting,
          trending: brief.trending,
          metrics: brief.metrics,
          schedule: brief.schedule,
          recommendation: brief.recommendation,
          cta: brief.cta,
        },
      });

    if (storageError) {
      console.warn('Could not store brief:', storageError);
    }

    return NextResponse.json({
      success: true,
      brief,
      metadata: {
        userId,
        language,
        generatedAt: new Date().toISOString(),
        stats: {
          pendingMessages,
          newLeads,
          completedTasks,
          revenue: yesterdayRevenue,
        },
      },
    });
  } catch (error) {
    console.error('Daily Brief API Error:', error);

    return NextResponse.json(
      {
        error: 'Error generating daily brief',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Manually trigger brief generation
 */
export async function POST(req: NextRequest) {
  try {
    const body: DailyBriefRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Reuse GET logic
    const url = new URL(req.url);
    url.pathname = '/api/daily-brief';
    url.searchParams.set('userId', body.userId);
    if (body.language) {
      url.searchParams.set('language', body.language);
    }

    const getReq = new NextRequest(url, { method: 'GET' });
    return GET(getReq);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error processing request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
