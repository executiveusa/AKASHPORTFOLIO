import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export const runtime = 'nodejs';

interface AgentMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

// ---------------------------------------------------------------------------
// Supabase-backed agent mailbox
// Falls back to in-memory Map when DB is unavailable (dev / cold starts)
// ---------------------------------------------------------------------------

const fallbackStore = new Map<string, AgentMessage[]>();

async function dbInsert(msg: AgentMessage): Promise<void> {
  const { error } = await supabaseClient.from('agent_messages').insert({
    id: msg.id,
    from_agent: msg.from,
    to_agent: msg.to,
    subject: msg.subject,
    body: msg.body,
    read: msg.read,
    created_at: msg.timestamp,
  });
  if (error) throw error;
}

async function dbFetch(agentId: string): Promise<AgentMessage[]> {
  const { data, error } = await supabaseClient
    .from('agent_messages')
    .select('*')
    .eq('to_agent', agentId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    from: r.from_agent as string,
    to: r.to_agent as string,
    subject: r.subject as string,
    body: r.body as string,
    timestamp: r.created_at as string,
    read: r.read as boolean,
  }));
}

async function dbMarkRead(agentId: string, messageId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('agent_messages')
    .update({ read: true })
    .eq('id', messageId)
    .eq('to_agent', agentId);
  if (error) throw error;
}

async function dbDelete(agentId: string, messageId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('agent_messages')
    .delete()
    .eq('id', messageId)
    .eq('to_agent', agentId);
  if (error) throw error;
}

// POST: Send message between agents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, body: messageBody } = body;

    if (!from || !to || !subject || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message: AgentMessage = {
      id: `msg-${crypto.randomUUID()}`,
      from,
      to,
      subject,
      body: messageBody,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      await dbInsert(message);
    } catch {
      // Fallback: in-memory when Supabase unavailable
      const inbox = fallbackStore.get(to) || [];
      inbox.push(message);
      fallbackStore.set(to, inbox);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Agent mail POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// GET: Fetch agent inbox
export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    let inbox: AgentMessage[];
    try {
      inbox = await dbFetch(agentId);
    } catch {
      inbox = fallbackStore.get(agentId) || [];
    }

    return NextResponse.json(inbox);
  } catch (error) {
    console.error('Agent mail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }
}

// PATCH: Mark message as read
export async function PATCH(req: NextRequest) {
  try {
    const { agentId, messageId } = await req.json();
    if (!agentId || !messageId) {
      return NextResponse.json({ error: 'agentId and messageId required' }, { status: 400 });
    }

    try {
      await dbMarkRead(agentId, messageId);
    } catch {
      const inbox = fallbackStore.get(agentId) || [];
      const msg = inbox.find(m => m.id === messageId);
      if (msg) msg.read = true;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent mail PATCH error:', error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}

// DELETE: Archive/delete message
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, messageId } = body;

    if (!agentId || !messageId) {
      return NextResponse.json({ error: 'agentId and messageId required' }, { status: 400 });
    }

    try {
      await dbDelete(agentId, messageId);
    } catch {
      const inbox = fallbackStore.get(agentId) || [];
      fallbackStore.set(agentId, inbox.filter(msg => msg.id !== messageId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent mail DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
