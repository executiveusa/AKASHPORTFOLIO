/**
 * /api/a2a/registry — A2A-inspired internal registry.
 * NOT full A2A protocol compliance.
 *
 * GET — returns persisted registry state (operator+)
 */
import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { db } from '@/lib/db/client';

export async function GET() {
  try {
    await requireOperatorOrAdmin();

    if (db) {
      const { data: cards, error } = await db
        .from('a2a_agent_cards')
        .select('id, name, role, capabilities, risk_level, active, registered_at, updated_at')
        .order('registered_at', { ascending: false });
      if (error) throw new Error(error.message);

      const entries = (cards ?? []).map((c) => ({
        agentId: c.id,
        status: c.active ? 'active' : 'inactive',
        registeredAt: c.registered_at,
      }));

      return NextResponse.json({
        ok: true,
        contract: 'A2A-inspired internal contract',
        registry: {
          entries,
          totalAgents: entries.length,
          activeAgents: entries.filter((e) => e.status === 'active').length,
          snapshotAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE', registry: null }, { status: 503 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
