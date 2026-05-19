/**
 * /api/integrations/status — Integration health check (operator+).
 * Performs active probe checks in addition to env check.
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { getIntegrationStatusFull } from '@/lib/integrations/status';

export async function GET() {
  try {
    await requireOperatorOrAdmin();
    const integrations = await getIntegrationStatusFull();
    return NextResponse.json({ ok: true, integrations });
  } catch (error) {
    return toErrorResponse(error);
  }
}
