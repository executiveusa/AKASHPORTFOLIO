import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

type Approval = {
  id: string;
  workflowId: string;
  riskLevel: 'normal' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
};

const approvals = new Map<string, Approval>();

export async function GET() {
  try {
    await requireOperatorOrAdmin();
    return NextResponse.json({ ok: true, approvals: Array.from(approvals.values()) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();
    const approval: Approval = {
      id: crypto.randomUUID(),
      workflowId: String(body?.workflowId || 'unknown'),
      riskLevel: body?.riskLevel === 'high' ? 'high' : 'normal',
      status: 'pending',
      requestedBy: session.user.email || 'unknown',
      requestedAt: new Date().toISOString(),
    };
    approvals.set(approval.id, approval);
    return NextResponse.json({ ok: true, approval }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
