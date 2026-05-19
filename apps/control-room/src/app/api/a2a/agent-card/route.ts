/**
 * /api/a2a/agent-card — A2A-inspired internal contract.
 * NOT full A2A protocol compliance.
 *
 * GET  — list persisted agent cards (operator+)
 * POST — register/update an agent card (admin)
 */
import { NextResponse } from 'next/server';
import { requireAdmin, requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { db } from '@/lib/db/client';

export async function GET() {
  try {
    await requireOperatorOrAdmin();

    if (db) {
      const { data, error } = await db
        .from('a2a_agent_cards')
        .select('*')
        .order('registered_at', { ascending: false });
      if (error) throw new Error(error.message);
      return NextResponse.json({
        ok: true,
        contract: 'A2A-inspired internal contract',
        cards: data ?? [],
      });
    }

    return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE', cards: [] }, { status: 503 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!body?.id || typeof body.id !== 'string') {
      return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });
    }
    if (!body?.name || typeof body.name !== 'string') {
      return NextResponse.json({ ok: false, error: 'MISSING_NAME' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
    }

    const now = new Date().toISOString();
    const { data, error } = await db
      .from('a2a_agent_cards')
      .upsert({
        id: body.id,
        name: body.name,
        role: body.role ?? null,
        capabilities: body.capabilities ?? [],
        risk_level: body.risk_level ?? 'low',
        active: body.active !== false,
        metadata: body.metadata ?? {},
        updated_at: now,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, card: data }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
