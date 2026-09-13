/**
 * GET /api/tasks — list agent tasks from Supabase
 * POST /api/tasks — create a new task
 * Body (POST): { title, agentId?, status?, priority?, dueDate? }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view');
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status');

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });

  try {
    let query = sb.from('agent_tasks').select('*').order('created_at', { ascending: false });
    if (agentId) query = query.eq('agent_id', agentId);
    if (status) query = query.eq('status', status);

    if (view === 'today_count') {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await sb
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: count ?? 0, total: count ?? 0 });
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return NextResponse.json({ ok: true, tasks: data ?? [], total: data?.length ?? 0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { title, agentId, status = 'pending', priority = 'normal', dueDate } = body as {
    title?: string; agentId?: string; status?: string; priority?: string; dueDate?: string;
  };
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });

  try {
    const { data, error } = await sb.from('agent_tasks').insert({
      title,
      agent_id: agentId ?? 'synthia',
      status,
      priority,
      due_date: dueDate ?? null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, task: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
