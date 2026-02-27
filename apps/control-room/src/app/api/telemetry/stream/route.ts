import { NextResponse } from 'next/server';
import { synthiaObservability } from '@/lib/observability';

/**
 * SSE Endpoint for real-time telemetry streaming
 */
export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const onEvent = (event: any) => {
                const data = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(data));
            };

            // Send initial state/recent events
            const recent = synthiaObservability.getRecentEvents();
            recent.forEach(e => onEvent(e));

            // Subscribe to new events
            synthiaObservability.on('new_event', onEvent);

            // Cleanup
            return () => {
                synthiaObservability.off('new_event', onEvent);
            };
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
