import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const threadId = req.nextUrl.searchParams.get('thread_id');

  let query = supabaseAdmin.from('synthia_assets').select('*').order('created_at', { ascending: false });
  if (threadId) query = query.eq('thread_id', threadId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ assets: data ?? [] });
}

export async function POST(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  let body: { thread_id: string; type: string; title: string; url?: string; preview_url?: string; description?: string; tags?: string[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { thread_id, type, title, url, preview_url, description, tags } = body;
  if (!thread_id || !type || !title) {
    return NextResponse.json({ error: 'thread_id, type, and title are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('synthia_assets')
    .insert({ thread_id, type, title, url, preview_url, description, tags })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ asset: data }, { status: 201 });
}
