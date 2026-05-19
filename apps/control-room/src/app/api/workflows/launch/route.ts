/**
 * /api/workflows/launch — Launch a Dify workflow with approval gate (operator+/admin for high-risk).
 * Requires approved persisted approval for high-risk workflows.
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { emitEvent } from '@/lib/observability/events';
import { launchDifyWorkflow, getWorkflowRegistry } from '@/lib/workflows/dify';
import { db } from '@/lib/db/client';

export async function POST(req: Request) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();
    const workflowId = typeof body?.workflowId === 'string' ? body.workflowId.trim() : '';
    const inputs = body?.inputs && typeof body.inputs === 'object' ? body.inputs : {};

    if (!workflowId) {
      return NextResponse.json({ ok: false, error: 'MISSING_WORKFLOW_ID' }, { status: 400 });
    }

    const registry = await getWorkflowRegistry();
    const workflow = registry.find((item) => item.id === workflowId);
    if (!workflow) {
      return NextResponse.json({ ok: false, error: 'WORKFLOW_NOT_FOUND' }, { status: 404 });
    }

    if (!workflow.active) {
      return NextResponse.json({ ok: false, error: 'WORKFLOW_INACTIVE' }, { status: 403 });
    }

    // High-risk workflows: require admin AND a persisted approved approval
    if (workflow.highRisk) {
      if (session.user.role !== 'admin') {
        return NextResponse.json({ ok: false, error: 'ADMIN_REQUIRED_FOR_HIGH_RISK' }, { status: 403 });
      }

      if (db) {
        const approvalId = typeof body?.approvalId === 'string' ? body.approvalId : null;
        if (!approvalId) {
          return NextResponse.json({ ok: false, error: 'APPROVAL_ID_REQUIRED_FOR_HIGH_RISK' }, { status: 403 });
        }
        const { data: approval, error: approvalErr } = await db
          .from('approvals')
          .select('*')
          .eq('id', approvalId)
          .eq('workflow_id', workflowId)
          .eq('status', 'approved')
          .single();
        if (approvalErr || !approval) {
          return NextResponse.json({ ok: false, error: 'APPROVAL_NOT_FOUND_OR_NOT_APPROVED' }, { status: 403 });
        }
      }
    }

    const result = await launchDifyWorkflow(workflowId, inputs as Record<string, unknown>, session.user.email ?? undefined);

    if (!result.ok) {
      emitEvent('workflow_blocked_by_policy', {
        workflowId,
        reason: result.reason,
        requestedBy: session.user.email,
      });
      return NextResponse.json(
        { ok: false, error: result.reason, detail: 'detail' in result ? result.detail : undefined },
        { status: 503 }
      );
    }

    emitEvent('workflow_launched', {
      workflowId,
      requestedBy: session.user.email,
      highRisk: workflow.highRisk,
    });

    return NextResponse.json({
      ok: true,
      requestedBy: session.user.email,
      workflowId,
      provider: 'dify',
      result: result.data,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
