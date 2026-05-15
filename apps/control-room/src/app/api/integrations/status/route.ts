import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { getIntegrationStatus } from '@/lib/integrations/status';

export async function GET() {
  try {
    await requireOperatorOrAdmin();
    return NextResponse.json({ ok: true, integrations: getIntegrationStatus() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
