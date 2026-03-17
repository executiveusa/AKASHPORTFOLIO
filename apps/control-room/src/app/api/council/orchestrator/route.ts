/**
 * Council Orchestrator — spawns and manages Sphere OS council meetings
 *
 * POST /api/council/orchestrator   — start a new meeting
 * GET  /api/council/orchestrator   — stream meeting events (SSE)
 *
 * Meeting flow:
 *  1. Synthia opens (meeting.begin event)
 *  2. Each invited sphere reads its Vibe context + memory
 *  3. Each sphere generates its contribution via LiteLLM gateway
 *  4. Contributions broadcasted as sphere.signal events
 *  5. Synthia closes (meeting.closing → meeting.end)
 *  6. Story Toolkit synthesizes the meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/litellm-gateway';
import { getVibeContext } from '@/lib/vibe-graph';
import { buildAgentContext } from '@/lib/agent-memory';
import { synthesizeMeeting } from '@/lib/story-toolkit';
import { SPHERE_FREQUENCY_MAP } from '@/shared/sphere-state';
import type { SphereAgentId, CouncilEvent } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// POST — start a new meeting (async, returns meetingId immediately)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: {
    topic?: string;
    agentIds?: SphereAgentId[];
    initiatedBy?: string;
    maxTurns?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  const meetingId = crypto.randomUUID();
  const agentIds = body.agentIds ?? (['synthia', 'alex', 'cazadora'] as SphereAgentId[]);
  const maxTurns = Math.min(body.maxTurns ?? 6, 12); // cap at 12 for budget safety

  // Fire-and-forget the meeting loop — caller polls SSE stream
  runMeetingLoop(meetingId, body.topic, agentIds, maxTurns).catch(err => {
    console.error(`[orchestrator] Meeting ${meetingId} crashed:`, err);
  });

  return NextResponse.json({ meetingId, status: 'started', agentCount: agentIds.length });
}

// ---------------------------------------------------------------------------
// GET — SSE stream for a meeting
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get('meetingId');
  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const cleanup = subscribeMeeting(meetingId, (event: CouncilEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
        if (event.type === 'meeting.end') {
          cleanup();
          controller.close();
        }
      });

      // Clean up on disconnect
      req.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ---------------------------------------------------------------------------
// Meeting Loop — runs each sphere sequentially with context injection
// ---------------------------------------------------------------------------

async function runMeetingLoop(
  meetingId: string,
  topic: string,
  agentIds: SphereAgentId[],
  maxTurns: number,
): Promise<void> {
  const startedAt = new Date().toISOString();
  const turns: Array<{ agentId: SphereAgentId | 'ivette'; text: string; timestamp: string }> = [];

  // Opening
  emitEvent(meetingId, {
    type: 'meeting.begin',
    meetingId,
    topic,
    agentIds,
    timestamp: new Date().toISOString(),
  });

  // Each agent speaks once (one round-trip)
  for (const agentId of agentIds.slice(0, maxTurns)) {
    const [vibeCtx, memCtx] = await Promise.all([
      getVibeContext(agentId),
      buildAgentContext(agentId),
    ]);

    const sphereInfo = SPHERE_FREQUENCY_MAP[agentId];
    const systemPrompt = buildSphereSystemPrompt(agentId, sphereInfo, vibeCtx.ecosystemSummary, memCtx, topic, turns);

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema de la reunión: "${topic}". Es tu turno de hablar.` },
      ],
      { maxTokens: 400, temperature: 0.7 },
    );

    const text = result.content;

    turns.push({ agentId, text, timestamp: new Date().toISOString() });

    emitEvent(meetingId, {
      type: 'sphere.signal',
      meetingId,
      agentId,
      kind: 'ASSERT',
      text,
      timestamp: new Date().toISOString(),
    });

    // Brief pause between speakers
    await new Promise(r => setTimeout(r, 200));
  }

  const closedAt = new Date().toISOString();

  emitEvent(meetingId, {
    type: 'meeting.closing',
    meetingId,
    closingStatement: 'El consejo ha completado su ronda. Synthia preparará la síntesis.',
    timestamp: closedAt,
  });

  // Story toolkit synthesis (async, non-blocking for SSE)
  synthesizeMeeting({
    meetingId,
    topic,
    startedAt,
    closedAt,
    turns,
  }).then(() => {
    emitEvent(meetingId, {
      type: 'meeting.end',
      meetingId,
      summaryAvailable: true,
      timestamp: new Date().toISOString(),
    });
  }).catch(err => {
    console.error('[orchestrator] Story toolkit failed:', err);
    emitEvent(meetingId, {
      type: 'meeting.end',
      meetingId,
      summaryAvailable: false,
      timestamp: new Date().toISOString(),
    });
  });
}

// ---------------------------------------------------------------------------
// System prompt builder per sphere
// ---------------------------------------------------------------------------

function buildSphereSystemPrompt(
  agentId: SphereAgentId,
  sphereInfo: { displayName: string; role: string; locale: string },
  vibeContext: string,
  memoryContext: string,
  topic: string,
  turns: Array<{ agentId: SphereAgentId | 'ivette'; text: string }>,
): string {
  const conversation = turns.length > 0
    ? turns.map(t => `${t.agentId.toUpperCase()}: ${t.text}`).join('\n')
    : '(Ningún agente ha hablado aún)';

  return `Eres ${sphereInfo.displayName}, de Synthia™ Sphere OS.
Tu rol: ${sphereInfo.role}
Tu idioma: español con acento ${sphereInfo.locale}

${memoryContext}

${vibeContext}

CONVERSACIÓN HASTA AHORA:
${conversation}

INSTRUCCIONES:
- Responde en español con tu acento característico de ${sphereInfo.locale}
- Máximo 3 oraciones. Sé concreto y útil para Ivette.
- Aplica tu especialidad al tema: "${topic}"
- No repitas lo que ya dijeron otros agentes
- Si otro agente dijo algo que necesita corrección o complemento, dilo directamente`.trim();
}

// ---------------------------------------------------------------------------
// Simple in-memory pub/sub + event buffer for SSE (fixes race condition)
// Buffer replays recent events to late-connecting SSE subscribers.
// ---------------------------------------------------------------------------

type EventListener = (event: CouncilEvent) => void;
const listeners = new Map<string, Set<EventListener>>();

// Per-meeting event buffer — holds up to 200 events for 15 min after meeting ends
const eventBuffer = new Map<string, Array<{ event: CouncilEvent; ts: number }>>();
const BUFFER_MAX = 200;
const BUFFER_TTL_MS = 15 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emitEvent(meetingId: string, event: any): void {
  // Buffer the event
  if (!eventBuffer.has(meetingId)) eventBuffer.set(meetingId, []);
  const buf = eventBuffer.get(meetingId)!;
  buf.push({ event, ts: Date.now() });
  if (buf.length > BUFFER_MAX) buf.shift();

  // Schedule cleanup after meeting ends
  if (event.type === 'meeting.end') {
    setTimeout(() => eventBuffer.delete(meetingId), BUFFER_TTL_MS);
  }

  const subs = listeners.get(meetingId);
  if (subs) {
    for (const fn of subs) {
      try { fn(event); } catch { /* ignore listener errors */ }
    }
  }
}

function subscribeMeeting(meetingId: string, listener: EventListener): () => void {
  if (!listeners.has(meetingId)) {
    listeners.set(meetingId, new Set());
  }
  listeners.get(meetingId)!.add(listener);

  // Replay buffered events so late subscribers don't miss meeting.begin etc.
  const buf = eventBuffer.get(meetingId) ?? [];
  Promise.resolve().then(() => {
    for (const { event } of buf) {
      try { listener(event); } catch { /* ignore */ }
    }
  });

  return () => {
    listeners.get(meetingId)?.delete(listener);
    if (listeners.get(meetingId)?.size === 0) {
      listeners.delete(meetingId);
    }
  };
}
