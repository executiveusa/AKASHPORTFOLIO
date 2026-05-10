import { NextRequest, NextResponse } from 'next/server';
import { getCodeModeClient } from '@/lib/code-mode-client';

/**
 * POST /api/code-mode/toggle
 *
 * Toggle between PAID and FREE modes
 *
 * Request body (optional):
 * {
 *   "mode": "PAID" | "FREE"  // Explicit mode, or auto-toggle if omitted
 * }
 *
 * Response:
 * {
 *   "previousMode": "PAID" | "FREE",
 *   "newMode": "PAID" | "FREE",
 *   "endpoint": "string",
 *   "available": boolean,
 *   "message": "string"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const client = getCodeModeClient();
    const previousMode = client.getMode();

    // Parse request body
    let targetMode: 'PAID' | 'FREE' | null = null;
    try {
      const body = await request.json();
      targetMode = body.mode;
    } catch {
      // No body provided, auto-toggle
    }

    // Determine target mode
    if (!targetMode) {
      // Auto-toggle
      targetMode = previousMode === 'PAID' ? 'FREE' : 'PAID';
    }

    // Verify FREE mode is available before switching
    if (targetMode === 'FREE') {
      const status = await client.getStatus();
      if (!status.available) {
        return NextResponse.json(
          {
            error: 'FREE mode proxy is unavailable',
            message:
              'free-claude-code proxy not responding on port 8082. Start it with: cd free-claude-code && ./start-proxy.sh',
            availableModes: ['PAID'],
          },
          { status: 503 }
        );
      }
    }

    // Switch mode
    client.setMode(targetMode);

    const newStatus = await client.getStatus();

    return NextResponse.json({
      previousMode,
      newMode: targetMode,
      endpoint: client.getEndpoint(),
      available: newStatus.available,
      fallbackActive: newStatus.fallbackActive,
      message: `Switched from ${previousMode} to ${targetMode} mode`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to toggle code-mode',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
