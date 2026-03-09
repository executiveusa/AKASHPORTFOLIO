import { NextRequest, NextResponse } from 'next/server';

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

const messageStore = new Map<string, AgentMessage[]>();

// POST: Send message between agents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, body: messageBody } = body;

    if (!from || !to || !subject || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message: AgentMessage = {
      id: `msg-${Date.now()}`,
      from,
      to,
      subject,
      body: messageBody,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Store message
    const inbox = messageStore.get(to) || [];
    inbox.push(message);
    messageStore.set(to, inbox);

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

    const inbox = messageStore.get(agentId) || [];
    return NextResponse.json(inbox);
  } catch (error) {
    console.error('Agent mail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
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

    const inbox = messageStore.get(agentId) || [];
    const filtered = inbox.filter(msg => msg.id !== messageId);
    messageStore.set(agentId, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent mail DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
