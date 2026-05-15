import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { difyAvailable, localWorkflows } from '@/lib/workflows/dify';

export async function GET() {
  try {
    await requireOperatorOrAdmin();
    return NextResponse.json({ ok: true, available: difyAvailable(), workflows: localWorkflows });
  } catch (error) {
    return toErrorResponse(error);
  }
}
