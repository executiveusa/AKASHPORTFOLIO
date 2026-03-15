import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = clientId;

  let record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

// POST: Stream tokens from Claude API
export async function POST(req: NextRequest) {
  try {
    const clientId = req.headers.get('x-client-id') || req.headers.get('x-forwarded-for') || 'anonymous';

    if (!checkRateLimit(clientId, 100, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded (100 requests per minute)' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { prompt, model = 'claude-opus-4-6', maxTokens = 1000 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    // Create token stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Claude API with streaming
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens,
              stream: true,
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!response.ok) {
            controller.enqueue(`data: ${JSON.stringify({ error: 'API call failed' })}\n\n`);
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                if (data) {
                  controller.enqueue(`data: ${data}\n\n`);
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
          controller.close();
        }
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
  } catch (error) {
    console.error('Stream POST error:', error);
    return NextResponse.json({ error: 'Failed to start stream' }, { status: 500 });
  }
}
