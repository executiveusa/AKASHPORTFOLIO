import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';
import { nimChat } from '@/lib/nvidia-nim';

export const runtime = 'nodejs';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  const { id } = await params;

  const [{ data: thread }, { data: messages }] = await Promise.all([
    supabaseAdmin.from('synthia_threads').select('*').eq('id', id).single(),
    supabaseAdmin.from('synthia_messages').select('*').eq('thread_id', id).order('created_at'),
  ]);

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  return NextResponse.json({ thread, messages: messages ?? [] });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  const { id } = await params;

  let body: { message: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const { data: thread } = await supabaseAdmin
    .from('synthia_threads')
    .select('agent_id, execution_mode')
    .eq('id', id)
    .single();

  await supabaseAdmin.from('synthia_messages').insert({ thread_id: id, role: 'user', content: message });

  const { data: history } = await supabaseAdmin
    .from('synthia_messages')
    .select('role, content')
    .eq('thread_id', id)
    .order('created_at')
    .limit(40);

  const nimMessages = (history ?? []).map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  let assistantContent = '';
  try {
    assistantContent = await nimChat(nimMessages, {
      systemPrompt: `Eres Synthia, una IA de operaciones empresariales. Agente activo: ${thread?.agent_id ?? 'synthia'}. Modo: ${thread?.execution_mode ?? 'auto'}. Responde siempre en español.`,
    });
  } catch {
    assistantContent = 'Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.';
  }

  const { data: assistantMsg } = await supabaseAdmin
    .from('synthia_messages')
    .insert({ thread_id: id, role: 'assistant', content: assistantContent })
    .select()
    .single();

  await supabaseAdmin
    .from('synthia_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', id);

  const { data: allMessages } = await supabaseAdmin
    .from('synthia_messages')
    .select('*')
    .eq('thread_id', id)
    .order('created_at');

  return NextResponse.json({ message: assistantMsg, messages: allMessages ?? [] });
}
