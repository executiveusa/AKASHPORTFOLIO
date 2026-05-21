import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const agentId = req.nextUrl.searchParams.get('agent_id');
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let tokenQuery = supabaseAdmin
    .from('budget_agent_daily')
    .select('total_tokens, total_cost_usd')
    .gte('date', monthStart.slice(0, 10));

  if (agentId) tokenQuery = tokenQuery.eq('agent_id', agentId);

  const [{ data: tokenRows }, { count: msgCount }, { count: assetCount }] = await Promise.all([
    tokenQuery,
    supabaseAdmin.from('synthia_messages').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabaseAdmin.from('synthia_assets').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
  ]);

  const totalTokens = tokenRows?.reduce((s: number, r: { total_tokens?: number; total_cost_usd?: number }) => s + (r.total_tokens ?? 0), 0) ?? 0;

  const stats = [
    { label: 'Mensajes este mes',   used: msgCount ?? 0,   limit: 1000,   unit: 'msgs'  },
    { label: 'Tokens consumidos',   used: totalTokens,      limit: 500000, unit: 'tok'   },
    { label: 'Activos generados',   used: assetCount ?? 0,  limit: 50,     unit: 'files' },
  ];

  return NextResponse.json({ plan: 'Pro', stats });
}
