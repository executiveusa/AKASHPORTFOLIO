/**
 * /api/a2a/task-report — A2A-inspired task report submission.
 * NOT full A2A protocol compliance.
 *
 * POST — validate and persist a task report (operator+)
 * GET  — list recent task reports (operator+)
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { db } from '@/lib/db/client';
import { validateTaskReport } from '@synthia/core';

export async function GET() {
  try {
    await requireOperatorOrAdmin();

    if (db) {
      const { data, error } = await db
        .from('a2a_task_reports')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return NextResponse.json({
        ok: true,
        contract: 'A2A-inspired internal contract',
        reports: data ?? [],
      });
    }

    return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE', reports: [] }, { status: 503 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOperatorOrAdmin();
    const body = await req.json();

    // Validate input using synthia-core types
    let validated;
    try {
      validated = validateTaskReport(body);
    } catch (validationErr) {
      return NextResponse.json(
        { ok: false, error: validationErr instanceof Error ? validationErr.message : 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
    }

    const now = new Date().toISOString();
    const { data, error } = await db
      .from('a2a_task_reports')
      .upsert({
        id: validated.id,
        agent_id: validated.agentId,
        task_type: validated.taskType,
        status: validated.status,
        summary: validated.summary,
        result: validated.result ?? null,
        error: validated.error ?? null,
        correlation_id: validated.correlationId ?? null,
        requested_by: validated.requestedBy ?? session.user.email,
        started_at: now,
        completed_at: validated.completedAt ?? null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, report: data }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
