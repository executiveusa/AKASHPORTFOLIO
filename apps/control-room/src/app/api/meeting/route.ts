/**
 * Meeting Room API — KUPURI MEDIA™
 * GET  /api/meeting         → Get all meetings (or today's with ?today=true)
 * GET  /api/meeting?id=X    → Get specific meeting for replay
 * POST /api/meeting         → Trigger a meeting manually
 */
import { NextRequest, NextResponse } from 'next/server';
import { runMeeting, getMeetings, getMeeting, getTodaysMeetings, MeetingType } from '../../../lib/meeting-room';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const today = searchParams.get('today') === 'true';
  const limit = parseInt(searchParams.get('limit') || '30');

  if (id) {
    const meeting = getMeeting(id);
    if (!meeting) return NextResponse.json({ error: 'Reunión no encontrada' }, { status: 404 });
    return NextResponse.json(meeting);
  }

  if (today) {
    return NextResponse.json(getTodaysMeetings());
  }

  return NextResponse.json(getMeetings(limit));
}

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    const validTypes: MeetingType[] = ['morning_standup', 'midday_pulse', 'evening_wrap'];

    if (!validTypes.includes(type)) {
      return NextResponse.json({
        error: `Tipo de reunión inválido. Opciones: ${validTypes.join(', ')}`,
      }, { status: 400 });
    }

    // Run meeting asynchronously — return meeting ID immediately so UI can subscribe to SSE
    const meetingId = `meeting-${type}-${Date.now()}`;
    // Fire and forget — the SSE stream will deliver real-time updates
    runMeeting(type as MeetingType).catch(console.error);

    return NextResponse.json({ started: true, meetingId, message: 'Reunión iniciada. Conéctate al stream /api/meeting/live para seguirla en vivo.' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
