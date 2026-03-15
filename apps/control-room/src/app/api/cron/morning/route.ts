/**
 * Cron: Morning Standup — 09:00 CDMX
 * GET /api/cron/morning
 *
 * Triggered by Vercel Cron or manual call.
 * Cron schedule (vercel.json): "0 15 * * 1-5"  (09:00 CDMX = 15:00 UTC)
 */
import { NextResponse } from 'next/server';
import { runMeeting } from '../../../../lib/meeting-room';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const meeting = await runMeeting('morning_standup');
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
