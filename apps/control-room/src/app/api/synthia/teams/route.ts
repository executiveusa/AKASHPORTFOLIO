import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const { data, error } = await supabaseAdmin
    .from('synthia_team_members')
    .select('*')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: { email: string; role: 'operator' | 'viewer'; name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, role, name } = body;
  if (!email?.trim()) return NextResponse.json({ error: 'email is required' }, { status: 400 });
  if (!['operator', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'role must be operator or viewer' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('synthia_team_members')
    .upsert({ email, role, name: name ?? email.split('@')[0] }, { onConflict: 'email' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data, invited: true }, { status: 201 });
}
