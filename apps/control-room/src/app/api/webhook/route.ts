import { NextResponse } from 'next/server';
import { synthiaObservability } from '@/lib/observability';

/**
 * Global Webhook for Synthia 3.0
 * Unifies events from n8n, GitHub, and external agents.
 */
export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // standard format: { type, summary, data, source }
        const { type, summary, data, source } = payload;

        const event = synthiaObservability.logEvent({
            sessionId: payload.sessionId || 'external-hook',
            type: type || 'info',
            summary: `[${source || 'WEBHOOK'}] ${summary || 'Incoming data'}`,
            data: data || payload
        });

        return NextResponse.json({ success: true, eventId: event.id });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
