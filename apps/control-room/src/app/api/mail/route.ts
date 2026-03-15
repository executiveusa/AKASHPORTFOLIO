/**
 * Agent Mail API — KUPURI MEDIA™
 * GET  /api/mail?agentId=X           → get inbox
 * GET  /api/mail?agentId=X&sent=true → get sent
 * POST /api/mail                     → send a mail
 * PUT  /api/mail                     → mark as read
 */
import { NextRequest, NextResponse } from 'next/server';
import { agentMail } from '../../../lib/agent-mail';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const sent = searchParams.get('sent') === 'true';
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const type = searchParams.get('type') as Parameters<typeof agentMail.getInbox>[1]['type'] | undefined;
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!agentId) {
    // Return system-wide mail summary for Synthia
    const summary = agentMail.getStandupSummary();
    const urgent = agentMail.getUrgentMails();
    return NextResponse.json({ summary, urgent });
  }

  if (sent) {
    return NextResponse.json(agentMail.getSent(agentId, limit));
  }

  const inbox = agentMail.getInbox(agentId, { unreadOnly, type, limit });
  const unreadCount = agentMail.getUnreadCount(agentId);
  return NextResponse.json({ inbox, unreadCount });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, cc, subject, body: mailBody, type, priority, metadata, replyTo } = body;

    if (!from || !to || !subject || !mailBody) {
      return NextResponse.json({ error: 'Campos requeridos: from, to, subject, body' }, { status: 400 });
    }

    const mail = agentMail.send({ from, to: Array.isArray(to) ? to : [to], cc, subject, body: mailBody, type: type || 'task', priority: priority || 'normal', metadata, replyTo });
    return NextResponse.json(mail, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { mailId, agentId } = await req.json();
    if (!mailId || !agentId) {
      return NextResponse.json({ error: 'Se requiere mailId y agentId' }, { status: 400 });
    }
    agentMail.markRead(mailId, agentId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
