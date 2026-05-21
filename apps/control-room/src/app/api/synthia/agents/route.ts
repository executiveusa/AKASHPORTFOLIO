import { NextRequest, NextResponse } from 'next/server';
import { requireUser, requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const { data, error } = await supabaseAdmin
    .from('synthia_agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agents: data ?? [] });
}

export async function POST(req: NextRequest) {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: {
    name: string;
    description?: string;
    theme?: string;
    model?: string;
    extended_thinking?: boolean;
    budget_per_query?: number;
    tools?: string[];
    system_prompt?: string;
    invocations?: string[];
  };

  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, description, theme, model, extended_thinking, budget_per_query, tools, system_prompt, invocations } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('synthia_agents')
    .insert({
      name,
      description,
      theme: theme ?? 'slate',
      model: model ?? 'claude-sonnet-4-6',
      extended_thinking: extended_thinking ?? false,
      budget_per_query: budget_per_query ?? 5,
      tools: tools ?? [],
      system_prompt,
      invocations: invocations ?? ['thread'],
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agent: data }, { status: 201 });
}
