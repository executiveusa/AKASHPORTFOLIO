// Legacy route — replaced by /api/council/heartbeat cron
/**
 * Cron: Morning Standup — 09:00 CDMX
 * GET /api/cron/morning
 *
 * Triggered by Vercel Cron or manual call.
 * Cron schedule (vercel.json): "0 15 * * 1-5"  (09:00 CDMX = 15:00 UTC)
 */
import { NextRequest, NextResponse } from 'next/server';
import { runMeeting } from '../../../../lib/meeting-room';

export const runtime = 'nodejs';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
