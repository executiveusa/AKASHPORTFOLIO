import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface CouncilUpdate {
  timestamp: string;
  agentId: string;
  opinion: string;
  confidence: number;
  language: 'en' | 'es';
}

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get('meetingId');

  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId required' }, { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial council state
      const initialState: CouncilUpdate = {
        timestamp: new Date().toISOString(),
        agentId: 'ivette-primary',
        opinion: 'Council chamber initialized',
        confidence: 1,
        language: 'en',
      };

      controller.enqueue(
        `data: ${JSON.stringify(initialState)}\n\n`
      );

      // Simulate council discussion with updates every 3-5 seconds
      const interval = setInterval(() => {
        const agents = [
          'advisor-economic',
          'advisor-cultural',
          'advisor-tech',
          'advisor-social',
          'ivette-primary',
        ];

        const agentId = agents[Math.floor(Math.random() * agents.length)];
        const update: CouncilUpdate = {
          timestamp: new Date().toISOString(),
          agentId,
          opinion: `Agent ${agentId} is considering the proposal...`,
          confidence: Math.random() * 0.5 + 0.5,
          language: Math.random() > 0.5 ? 'en' : 'es',
        };

        controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);

        // Stop after 30 updates or 2 minutes
        if (Math.random() > 0.95) {
          clearInterval(interval);
          controller.close();
        }
      }, 3000 + Math.random() * 2000);

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
