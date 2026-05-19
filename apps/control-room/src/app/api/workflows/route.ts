/**
 * /api/workflows — List persisted workflow registry (operator+)
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { difyAvailable, getWorkflowRegistry } from '@/lib/workflows/dify';

export async function GET() {
  try {
    await requireOperatorOrAdmin();
    const workflows = await getWorkflowRegistry();
    return NextResponse.json({ ok: true, available: difyAvailable(), workflows });
  } catch (error) {
    return toErrorResponse(error);
  }
}
