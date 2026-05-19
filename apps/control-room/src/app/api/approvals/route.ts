/**
 * /api/approvals — Persisted approval requests.
 * GET: list pending approvals (operator+)
 * POST: create new approval request (operator+)
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { db } from '@/lib/db/client';
import { emitEvent } from '@/lib/observability/events';

export async function GET() {
  try {
    await requireOperatorOrAdmin();

    if (db) {
      const { data, error } = await db
        .from('approvals')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, approvals: data ?? [] });
    }

    // Fallback when DB not configured (explicit signal — not silently swallowed)
    return NextResponse.json({
      ok: false,
      error: 'DB_UNAVAILABLE',
      approvals: [],
    }, { status: 503 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();

    const workflowId = typeof body?.workflowId === 'string' ? body.workflowId.trim() : '';
    if (!workflowId) {
      return NextResponse.json({ ok: false, error: 'MISSING_WORKFLOW_ID' }, { status: 400 });
    }

    const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
      ['low', 'medium', 'high', 'critical'].includes(body?.riskLevel)
        ? body.riskLevel
        : 'low';

    const requestedBy = session.user.email ?? 'unknown';
    const now = new Date().toISOString();

    if (db) {
      const { data, error } = await db
        .from('approvals')
        .insert({
          workflow_id: workflowId,
          risk_level: riskLevel,
          status: 'pending',
          requested_by: requestedBy,
          requested_at: now,
          metadata: body?.metadata ?? {},
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      emitEvent('approval_requested', {
        id: data.id,
        workflowId,
        riskLevel,
        requestedBy,
      });

      return NextResponse.json({ ok: true, approval: data }, { status: 201 });
    }

    return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
