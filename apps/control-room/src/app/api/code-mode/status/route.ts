import { NextResponse } from 'next/server';
import { getCodeModeClient, formatCodeModeStatus } from '@/lib/code-mode-client';

/**
 * GET /api/code-mode/status
 *
 * Returns current CODE_MODE status (PAID or FREE)
 * Verifies FREE mode proxy is available, falls back to PAID if not
 *
 * Response:
 * {
 *   "mode": "PAID" | "FREE",
 *   "endpoint": "string",
 *   "available": boolean,
 *   "fallbackActive": boolean,
 *   "formatted": "💳 PAID (Anthropic)" | "🎉 FREE (Local Proxy)",
 *   "costEstimate": {
 *     "mode": "PAID" | "FREE",
 *     "costUSD": number,
 *     "estimatedLatencyMs": number
 *   }
 * }
 */
export async function GET() {
  try {
    const client = getCodeModeClient();
    const status = await client.getStatus();

    const estimate = client.getCostEstimate(1000, 500); // Sample 1k input, 500 output

    return NextResponse.json({
      mode: status.activeMode,
      endpoint: status.endpoint,
      available: status.available,
      fallbackActive: status.fallbackActive,
      formatted: formatCodeModeStatus(status.activeMode, status.available),
      costEstimate: {
        mode: estimate.mode,
        costUSD: estimate.costUSD,
        estimatedLatencyMs: estimate.estimatedTime,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get code-mode status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
