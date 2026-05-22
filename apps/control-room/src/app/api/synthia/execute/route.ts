import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';
import { nimChat } from '@/lib/nvidia-nim';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: {
    thread_id: string;
    task: string;
    agent_id?: string;
    execution_mode?: string;
    tools?: string[];
  };

  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { thread_id, task, agent_id = 'synthia', execution_mode = 'auto', tools = [] } = body;
  if (!thread_id || !task?.trim()) {
    return NextResponse.json({ error: 'thread_id and task are required' }, { status: 400 });
  }

  const systemPrompt = [
    `Eres ${agent_id}, una IA de operaciones empresariales de Synthia™ 3.0.`,
    `Modo de ejecución: ${execution_mode}.`,
    tools.length > 0 ? `Herramientas disponibles: ${tools.join(', ')}.` : '',
    'Responde siempre en español. Sé conciso y orientado a resultados.',
  ].filter(Boolean).join('\n');

  let result = '';
  try {
    result = await nimChat(
      [{ role: 'user', content: task }],
      { systemPrompt },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `NIM error: ${msg}` }, { status: 502 });
  }

  await supabaseAdmin.from('synthia_messages').insert([
    { thread_id, role: 'user',      content: task   },
    { thread_id, role: 'assistant', content: result },
  ]);

  await supabaseAdmin
    .from('synthia_threads')
    .update({ last_message_at: new Date().toISOString(), status: 'active' })
    .eq('id', thread_id);

  return NextResponse.json({ result, agent_id, execution_mode });
}
