import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');
  const project = req.nextUrl.searchParams.get('project');

  let query = supabaseAdmin
    .from('synthia_threads')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (project) query = query.eq('project_id', project);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ threads: data ?? [] });
}

export async function POST(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  let body: {
    message: string;
    agent_id?: string;
    execution_mode?: string;
    project_id?: string;
  };

  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message, agent_id = 'synthia', execution_mode = 'auto', project_id } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const { data: thread, error: threadErr } = await supabaseAdmin
    .from('synthia_threads')
    .insert({
      title: message.slice(0, 80),
      agent_id,
      execution_mode,
      project_id,
      status: 'active',
      message_count: 1,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (threadErr) return NextResponse.json({ error: threadErr.message }, { status: 500 });

  await supabaseAdmin.from('synthia_messages').insert({
    thread_id: thread.id,
    role: 'user',
    content: message,
  });

  return NextResponse.json({ thread }, { status: 201 });
}
