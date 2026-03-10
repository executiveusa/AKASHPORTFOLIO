/**
 * LLM Council API — KUPURI MEDIA™
 * POST /api/council       → Convene a council session
 * GET  /api/council       → Get recent sessions
 * GET  /api/council?id=X  → Get specific session
 */
import { NextRequest, NextResponse } from 'next/server';
import { conveneCouncil, getCouncilSessions, getCouncilSession, CouncilAgenda } from '../../../lib/council';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (id) {
    const session = getCouncilSession(id);
    if (!session) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    return NextResponse.json(session);
  }

  return NextResponse.json(getCouncilSessions(limit));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context, options, urgency, requester } = body;

    if (!question || !context) {
      return NextResponse.json({ error: 'Se requieren: question, context' }, { status: 400 });
    }

    const agenda: CouncilAgenda = {
      question,
      context,
      options,
      urgency: urgency || 'today',
      requester: requester || 'synthia-prime',
    };

    const session = await conveneCouncil(agenda);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
