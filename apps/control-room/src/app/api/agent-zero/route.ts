/**
 * Agent Zero Bridge API
 * POST /api/agent-zero - Delegate complex tasks to Agent Zero sidecar
 * Agent Zero runs at port 42617 (Rust + Docker)
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AgentZeroTask {
  task: string;
  context?: Record<string, unknown>;
  user_id?: string;
  stream?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: AgentZeroTask = await req.json();

    if (!body.task) {
      return NextResponse.json(
        { error: 'Missing required field: task' },
        { status: 400 }
      );
    }

    const agentZeroUrl = process.env.AGENT_ZERO_URL || 'http://localhost:42617';

    // If streaming is requested, return SSE stream
    if (body.stream) {
      return streamAgentZeroResponse(agentZeroUrl, body);
    }

    // Otherwise, make regular HTTP POST
    const response = await fetch(`${agentZeroUrl}/api/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: body.task,
        context: body.context || {},
        user_id: body.user_id,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Agent Zero request failed', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      result: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Agent Zero Bridge Error:', error);

    return NextResponse.json(
      {
        error: 'Error communicating with Agent Zero',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Stream Agent Zero response via Server-Sent Events (SSE)
 */
function streamAgentZeroResponse(agentZeroUrl: string, task: AgentZeroTask) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Connect to Agent Zero streaming endpoint
        const response = await fetch(`${agentZeroUrl}/api/task/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            task: task.task,
            context: task.context || {},
            user_id: task.user_id,
          }),
        });

        if (!response.ok) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Agent Zero stream failed' })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Forward Agent Zero's SSE stream to client
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream connection failed' })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * GET - Health check for Agent Zero bridge
 */
export async function GET() {
  try {
    const agentZeroUrl = process.env.AGENT_ZERO_URL || 'http://localhost:42617';

    // Check if Agent Zero is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let response: Response | null = null;
    try {
      response = await fetch(`${agentZeroUrl}/api/health`, {
        signal: controller.signal,
      });
    } catch {
      response = null;
    } finally {
      clearTimeout(timeoutId);
    }

    const agentZeroStatus = response?.ok ? 'connected' : 'disconnected';

    return NextResponse.json({
      status: 'ok',
      bridge: 'Agent Zero Bridge API',
      agent_zero_status: agentZeroStatus,
      agent_zero_url: agentZeroUrl,
      message: 'Bridge to Agent Zero (port 42617) is ready',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Agent Zero Bridge health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
