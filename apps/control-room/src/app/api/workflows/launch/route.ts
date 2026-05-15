import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { emitEvent } from '@/lib/observability/events';
import { launchDifyWorkflow, localWorkflows } from '@/lib/workflows/dify';

export async function POST(req: Request) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();
    const workflowId = String(body?.workflowId || '');
    const inputs = (body?.inputs && typeof body.inputs === 'object') ? body.inputs : {};

    const workflow = localWorkflows.find((item) => item.id === workflowId);
    if (!workflow) {
      return NextResponse.json({ ok: false, error: 'WORKFLOW_NOT_FOUND' }, { status: 404 });
    }

    if (workflow.highRisk && session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'APPROVAL_REQUIRED_ADMIN' }, { status: 403 });
    }

    const result = await launchDifyWorkflow(workflowId, inputs as Record<string, unknown>);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason, detail: 'detail' in result ? result.detail : undefined }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      requestedBy: session.user.email,
      workflowId,
      event: emitEvent('workflow_launched', { workflowId, requestedBy: session.user.email }),
      provider: 'dify',
      result: result.data,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
