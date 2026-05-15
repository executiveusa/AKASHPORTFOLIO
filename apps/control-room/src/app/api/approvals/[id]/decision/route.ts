import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();
    const decision = body?.decision === 'rejected' ? 'rejected' : 'approved';
    const riskLevel = body?.riskLevel === 'high' ? 'high' : 'normal';

    if (riskLevel === 'high' && session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'ADMIN_REQUIRED_FOR_HIGH_RISK' }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      id: params.id,
      decision,
      decidedBy: session.user.email,
      decidedAt: new Date().toISOString(),
      sideEffectsAllowed: decision === 'approved',
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
