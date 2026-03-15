/**
 * LLM Council API — KUPURI MEDIA™
 * POST /api/council       → Convene a council session
 * GET  /api/council       → Get recent sessions
 * GET  /api/council?id=X  → Get specific session
 */
import { NextRequest, NextResponse } from 'next/server';
import { conveneCouncil, getCouncilSessions, getCouncilSession, CouncilAgenda } from '../../../lib/council';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (id) {
    const session = getCouncilSession(id);
    if (!session) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    return NextResponse.json(session);
  }

  return NextResponse.json(getCouncilSessions(limit));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context, options, urgency, requester } = body;

    if (!question || !context) {
      return NextResponse.json({ error: 'Se requieren: question, context' }, { status: 400 });
    }

    const agenda: CouncilAgenda = {
      question,
      context,
      options,
      urgency: urgency || 'today',
      requester: requester || 'synthia-prime',
    };

    const session = await conveneCouncil(agenda);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export const runtime = 'nodejs';

interface CouncilMeeting {
  id: string;
  topic: string;
  status: 'pending' | 'live' | 'completed';
  participants: string[];
  decisions: string[];
  createdAt: string;
  updatedAt: string;
}

// POST: Initiate a new council meeting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, participants, context } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic required' }, { status: 400 });
    }

    const meeting: CouncilMeeting = {
      id: `council-${Date.now()}`,
      topic,
      status: 'live',
      participants: participants || [
        'advisor-economic',
        'advisor-cultural',
        'advisor-tech',
        'advisor-social',
        'ivette-primary',
      ],
      decisions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in Supabase if client is available
    try {
      const { data, error } = await supabaseClient
        .from('agent_meetings')
        .insert([{
          meeting_id: meeting.id,
          topic: meeting.topic,
          status: meeting.status,
          participants: meeting.participants,
          metadata: { context },
          created_at: meeting.createdAt,
        }]);

      if (error) console.error('Supabase insert error:', error);
    } catch (err) {
      console.warn('Supabase unavailable, using memory storage:', err);
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Council POST error:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}

// GET: Fetch active council meetings or specific meeting
export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get('meetingId');

    if (meetingId) {
      // Fetch specific meeting
      try {
        const { data, error } = await supabaseClient
          .from('agent_meetings')
          .select('*')
          .eq('meeting_id', meetingId)
          .single();

        if (error) throw error;
        return NextResponse.json(data);
      } catch (err) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
    }

    // Fetch all active meetings
    try {
      const { data, error } = await supabaseClient
        .from('agent_meetings')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (err) {
      console.warn('Supabase query failed:', err);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Council GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

// PUT: Update council meeting status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingId, status, decision } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId required' }, { status: 400 });
    }

    try {
      const { data, error } = await supabaseClient
        .from('agent_meetings')
        .update({
          status: status || 'completed',
          metadata: decision ? { decision } : {},
          updated_at: new Date().toISOString(),
        })
        .eq('meeting_id', meetingId)
        .select();

      if (error) throw error;
      return NextResponse.json(data?.[0] || { id: meetingId, status });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }
  } catch (error) {
    console.error('Council PUT error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
