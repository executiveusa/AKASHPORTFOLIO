import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface WebhookEvent {
  id: string;
  source: 'whatsapp' | 'tiktok';
  type: string;
  data: Record<string, any>;
  timestamp: string;
  processed: boolean;
}

const webhookLog: WebhookEvent[] = [];

// POST: Receive webhooks from WhatsApp or TikTok
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source = req.nextUrl.searchParams.get('source') as 'whatsapp' | 'tiktok';
    const signature = req.headers.get('x-webhook-signature');

    if (!source) {
      return NextResponse.json({ error: 'source parameter required' }, { status: 400 });
    }

    const event: WebhookEvent = {
      id: `webhook-${Date.now()}`,
      source,
      type: body.type || 'unknown',
      data: body,
      timestamp: new Date().toISOString(),
      processed: false,
    };

    webhookLog.push(event);

    // Handle different webhook types
    if (source === 'whatsapp' && body.type === 'message') {
      handleWhatsAppMessage(body);
    } else if (source === 'tiktok' && body.type === 'comment') {
      handleTikTokComment(body);
    }

    event.processed = true;

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// GET: Retrieve webhook log (for debugging)
export async function GET(req: NextRequest) {
  try {
    const source = req.nextUrl.searchParams.get('source');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    let results = webhookLog;

    if (source) {
      results = results.filter(e => e.source === source);
    }

    return NextResponse.json(results.slice(-limit).reverse());
  } catch (error) {
    console.error('Webhook GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

// Helper: Handle WhatsApp messages
async function handleWhatsAppMessage(data: any) {
  try {
    const { from, text, messageId } = data;

    console.log(`[WhatsApp] Message from ${from}: ${text}`);

    // Trigger council meeting if message mentions discussion
    if (text.toLowerCase().includes('consejo') || text.toLowerCase().includes('council')) {
      // POST to /api/council to start a meeting
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const response = await fetch(`${appUrl}/api/council`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: text,
          context: { source: 'whatsapp', from },
        }),
      });

      if (response.ok) {
        const meeting = await response.json();
        console.log(`[WhatsApp] Created council meeting: ${meeting.id}`);
      }
    }
  } catch (error) {
    console.error('WhatsApp message handler error:', error);
  }
}

// Helper: Handle TikTok comments
async function handleTikTokComment(data: any) {
  try {
    const { videoId, authorId, text, commentId } = data;

    console.log(`[TikTok] Comment on ${videoId} by ${authorId}: ${text}`);

    // Filter comments by sentiment (simple keyword check)
    if (text.toLowerCase().includes('amazing') || text.toLowerCase().includes('increíble')) {
      // Record positive sentiment
      console.log(`[TikTok] Positive sentiment detected`);
    }

    // Optionally trigger council if comment is a question
    if (text.includes('?')) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const response = await fetch(`${appUrl}/api/council`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: text,
          context: { source: 'tiktok', videoId, authorId },
        }),
      });

      if (response.ok) {
        console.log(`[TikTok] Created council meeting from comment`);
      }
    }
  } catch (error) {
    console.error('TikTok comment handler error:', error);
  }
}
