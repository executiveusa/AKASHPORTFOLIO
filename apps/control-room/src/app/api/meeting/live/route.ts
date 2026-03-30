/**
 * Meeting Live Stream — SSE — KUPURI MEDIA™
 * GET /api/meeting/live → Server-Sent Events stream of live meeting turns
 *
 * Ivette can watch meetings in real-time or use /api/meeting?id=X for replay.
 */
import { NextRequest, NextResponse } from 'next/server';
import { meetingEmitter } from '../../../../lib/meeting-room';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Send initial heartbeat
      send('connected', { message: 'Conectado al stream de reuniones en vivo — KUPURI MEDIA™', timestamp: new Date().toISOString() });

      const onStart = (meeting: unknown) => send('meeting:start', meeting);
      const onTurn = (payload: unknown) => send('meeting:turn', payload);
      const onComplete = (meeting: unknown) => send('meeting:complete', meeting);

      meetingEmitter.on('meeting:start', onStart);
      meetingEmitter.on('meeting:turn', onTurn);
      meetingEmitter.on('meeting:complete', onComplete);

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        send('heartbeat', { ts: Date.now() });
      }, 15000);

      req.signal.addEventListener('abort', () => {
        meetingEmitter.off('meeting:start', onStart);
        meetingEmitter.off('meeting:turn', onTurn);
        meetingEmitter.off('meeting:complete', onComplete);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
