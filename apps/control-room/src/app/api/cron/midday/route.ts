/**
 * Cron: Midday Pulse — 13:00 CDMX
 * GET /api/cron/midday
 *
 * Cron schedule (vercel.json): "0 19 * * 1-5"  (13:00 CDMX = 19:00 UTC)
 */
import { NextResponse } from 'next/server';
import { runMeeting } from '../../../../lib/meeting-room';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const meeting = await runMeeting('midday_pulse');
    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      title: meeting.title,
      turns: meeting.transcript.length,
      duration: meeting.duration,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
