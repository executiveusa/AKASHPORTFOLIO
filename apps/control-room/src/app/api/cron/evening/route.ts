// Legacy route — replaced by /api/council/heartbeat cron
/**
 * Cron: Evening Wrap-Up — 17:00 CDMX
 * GET /api/cron/evening
 *
 * Cron schedule (vercel.json): "0 23 * * 1-5"  (17:00 CDMX = 23:00 UTC)
 * This is the most important meeting — includes Ralphy's coaching moment
 * and the executive summary for Ivette.
 */
import { NextResponse } from 'next/server';
import { runMeeting } from '../../../../lib/meeting-room';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const meeting = await runMeeting('evening_wrap');
    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      title: meeting.title,
      turns: meeting.transcript.length,
      duration: meeting.duration,
      summary: meeting.summary,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
