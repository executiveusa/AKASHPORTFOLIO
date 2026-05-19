/**
 * /api/approvals/[id]/decision — Persisted approval decision.
 * POST: approve or reject (admin required for high-risk)
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { db } from '@/lib/db/client';
import { emitEvent } from '@/lib/observability/events';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOperatorOrAdmin();
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });
    }

    const body = await req.json();
    const decision: 'approved' | 'rejected' =
      body?.decision === 'rejected' ? 'rejected' : 'approved';

    if (!db) {
      return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
    }

    // Fetch current approval
    const { data: existing, error: fetchErr } = await db
      .from('approvals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ ok: false, error: 'APPROVAL_NOT_FOUND' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ ok: false, error: 'APPROVAL_ALREADY_DECIDED' }, { status: 409 });
    }

    // High-risk decisions require admin
    if (existing.risk_level === 'high' || existing.risk_level === 'critical') {
      if (session.user.role !== 'admin') {
        return NextResponse.json({ ok: false, error: 'ADMIN_REQUIRED_FOR_HIGH_RISK' }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await db
      .from('approvals')
      .update({
        status: decision,
        decided_by: session.user.email,
        decided_at: now,
        decision_note: body?.note ?? null,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    emitEvent('approval_decided', {
      id,
      decision,
      workflowId: existing.workflow_id,
      decidedBy: session.user.email,
      riskLevel: existing.risk_level,
    });

    return NextResponse.json({ ok: true, approval: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
