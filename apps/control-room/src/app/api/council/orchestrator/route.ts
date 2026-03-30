/**
 * Council Orchestrator v3 Ã¢â‚¬â€ SYNTHIAÃ¢â€žÂ¢ as Chairman
 *
 * Uses the 3-stage Karpathy council engine:
 *   Stage 1 Ã¢â‚¬â€ Position: each sphere gives their independent take
 *   Stage 2 Ã¢â‚¬â€ Review:   each sphere reviews all others (anonymized)
 *   Stage 3 Ã¢â‚¬â€ Synthesis: SYNTHIA writes the final Memo
 *
 * POST /api/council/orchestrator  Ã¢â‚¬â€ start a meeting
 * GET  /api/council/orchestrator  Ã¢â‚¬â€ SSE stream of CouncilEvents
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runCouncilMeeting,
  DEFAULT_BOARD_IDS,
  DEFAULT_CONSTRAINTS,
  type CouncilBrief,
  type SpherePosition,
  type SphereReview,
  type CouncilMemo,
} from '@/lib/council-engine';
import { SPHERE_FREQUENCY_MAP } from '@/shared/sphere-state';
import type { SphereAgentId, CouncilEvent } from '@/shared/council-events';

// Ã¢â€â‚¬Ã¢â€â‚¬ Input sanitization Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

/** Strip potential prompt injection and XSS payloads from user-supplied strings. */
const INJECTION_PATTERN =
  /(<script|<\/script|javascript:|data:|vbscript:|on\w+=|<iframe|<object|\{\{|\}\}|```)/gi;

function sanitize(value: string, maxLen = 4000): string {
  return value.replace(INJECTION_PATTERN, '').slice(0, maxLen);
}

function sanitizeBrief(brief: CouncilBrief): CouncilBrief {
  return {
    ...brief,
    situation: sanitize(brief.situation),
    stakes: sanitize(brief.stakes),
    constraints: sanitize(brief.constraints),
    key_questions: brief.key_questions.map(q => sanitize(q, 500)).slice(0, 6),
    context_docs: brief.context_docs ? sanitize(brief.context_docs, 8000) : undefined,
  };
}

// ---------------------------------------------------------------------------
// POST Ã¢â‚¬â€ start a new council meeting
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: {
    brief?: Partial<CouncilBrief>;
    /** Legacy: plain topic string (backward compat) */
    topic?: string;
    agentIds?: SphereAgentId[];
    initiatedBy?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Build CouncilBrief from input Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  let rawBrief: CouncilBrief;

  if (body.brief?.situation) {
    rawBrief = {
      id:            body.brief.id ?? crypto.randomUUID(),
      situation:     body.brief.situation,
      stakes:        body.brief.stakes ?? '',
      constraints:   body.brief.constraints ?? 'Sin restricciones definidas',
      key_questions: body.brief.key_questions ?? [],
      context_docs:  body.brief.context_docs,
      initiatedBy:   body.brief.initiatedBy ?? body.initiatedBy ?? 'user',
      requestedAt:   body.brief.requestedAt ?? new Date().toISOString(),
    };
  } else if (body.topic) {
    rawBrief = {
      id:            crypto.randomUUID(),
      situation:     body.topic,
      stakes:        '',
      constraints:   'Sin restricciones definidas',
      key_questions: [],
      initiatedBy:   body.initiatedBy ?? 'user',
      requestedAt:   new Date().toISOString(),
    };
  } else {
    return NextResponse.json(
      { error: 'brief.situation or topic is required' },
      { status: 400 },
    );
  }

  const brief = sanitizeBrief(rawBrief);

  // Only real board members Ã¢â‚¬â€ not the chairman (synthia) or guardian (la-vigilante)
  const boardIds = (body.agentIds ?? DEFAULT_BOARD_IDS).filter(
    (id): id is SphereAgentId => id !== 'synthia' && id !== 'la-vigilante',
  );

  // Emit meeting.begin + node.spawn after a tick so SSE clients can connect first
  setTimeout(() => {
    emitEvent(brief.id, {
      t: Date.now(),
      type: 'meeting.begin',
      meetingId: brief.id,
      title: brief.situation.slice(0, 80),
      goal: brief.key_questions[0] ?? brief.situation.slice(0, 120),
    } satisfies CouncilEvent);

    boardIds.forEach((agentId, idx) => {
      const info = SPHERE_FREQUENCY_MAP[agentId];
      emitEvent(brief.id, {
        t: Date.now(),
        type: 'node.spawn',
        meetingId: brief.id,
        agentId,
        displayName: info?.displayName ?? agentId,
        color: info?.baseColor ?? '#888888',
        seatId: idx,
      } satisfies CouncilEvent);
    });
  }, 50);

  // Fire-and-forget the 3-stage council meeting
  runCouncilMeeting(brief, {
    boardIds,
    constraints: DEFAULT_CONSTRAINTS,
    onEvent: ({ stage, sphereId, data }) =>
      mapToCouncilEvent(brief.id, stage, sphereId, data),
  })
    .then(memo => {
      emitEvent(brief.id, {
        t: Date.now(),
        type: 'meeting.end',
        meetingId: brief.id,
        artifactRef: `/api/council/memo?briefId=${brief.id}`,
        decisions: memo.nextActions.map(a => `${a.owner}: ${a.action}`),
      } satisfies CouncilEvent);
    })
    .catch(err => {
      console.error(`[orchestrator] Meeting ${brief.id} crashed:`, err);
      emitEvent(brief.id, {
        t: Date.now(),
        type: 'meeting.end',
        meetingId: brief.id,
        artifactRef: '',
        decisions: [`ERROR: ${String(err).slice(0, 200)}`],
      } satisfies CouncilEvent);
    });

  return NextResponse.json({
    meetingId: brief.id,
    briefId:   brief.id,
    status:    'started',
    agentCount: boardIds.length,
  });
}

// ---------------------------------------------------------------------------
// GET Ã¢â‚¬â€ SSE stream for a meeting
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const meetingId =
    req.nextUrl.searchParams.get('meetingId') ??
    req.nextUrl.searchParams.get('briefId');

  if (!meetingId) {
    return NextResponse.json(
      { error: 'meetingId or briefId is required' },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const cleanup = subscribeMeeting(meetingId, (event: CouncilEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        if (event.type === 'meeting.end') {
          cleanup();
          controller.close();
        }
      });

      req.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}

// ---------------------------------------------------------------------------
// Map internal council-engine onEvent callbacks Ã¢â€ â€™ typed CouncilEvents
// ---------------------------------------------------------------------------

function mapToCouncilEvent(
  meetingId: string,
  stage: string,
  sphereId: SphereAgentId | undefined,
  data: unknown,
): void {
  if (!sphereId) return;

  const info = SPHERE_FREQUENCY_MAP[sphereId];
  const hz = info?.frequency_hz ?? 0.5;

  if (stage === 'position') {
    const pos = data as SpherePosition;
    emitEvent(meetingId, {
      t: Date.now(),
      type: 'sphere.signal',
      meetingId,
      agentId: sphereId,
      kind: 'ASSERT',
      amplitude: Math.max(0, Math.min(1, pos.confidence ?? 0.7)),
      durationMs: 3000,
      carrierHz: hz,
      transcript: pos.recommendation ?? pos.stance,
    } satisfies CouncilEvent);
    return;
  }

  if (stage === 'review') {
    const rev = data as SphereReview;
    emitEvent(meetingId, {
      t: Date.now(),
      type: 'sphere.signal',
      meetingId,
      agentId: sphereId,
      kind: 'REFLECT',
      amplitude: 0.6,
      durationMs: 2500,
      carrierHz: hz,
      transcript: rev.topInsight,
    } satisfies CouncilEvent);
    return;
  }

  if (stage === 'synthesis' && sphereId === 'synthia') {
    const d = data as Record<string, unknown>;
    if (d.started) {
      emitEvent(meetingId, {
        t: Date.now(),
        type: 'meeting.focus',
        meetingId,
        speakerId: 'synthia',
        intensity: 1.0,
      } satisfies CouncilEvent);
    } else {
      const memo = data as CouncilMemo;
      const acceptVotes = memo.boardStances?.filter(s => s.vote === 'accept').length ?? 0;
      const total = Math.max(memo.boardStances?.length ?? 1, 1);
      emitEvent(meetingId, {
        t: Date.now(),
        type: 'meeting.closing',
        meetingId,
        coherence: acceptVotes / total,
      } satisfies CouncilEvent);
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory pub/sub + event buffer for SSE
// Buffer replays events to late-connecting subscribers (race-condition safe)
// ---------------------------------------------------------------------------

type EventListener = (event: CouncilEvent) => void;
const listeners   = new Map<string, Set<EventListener>>();
const eventBuffer = new Map<string, Array<{ event: CouncilEvent; ts: number }>>();

const BUFFER_MAX    = 200;
const BUFFER_TTL_MS = 15 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emitEvent(meetingId: string, event: any): void {
  if (!eventBuffer.has(meetingId)) eventBuffer.set(meetingId, []);
  const buf = eventBuffer.get(meetingId)!;
  buf.push({ event, ts: Date.now() });
  if (buf.length > BUFFER_MAX) buf.shift();

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
  if (!listeners.has(meetingId)) listeners.set(meetingId, new Set());
  listeners.get(meetingId)!.add(listener);

  // Replay buffered events for late subscribers (e.g. page refresh mid-meeting)
  const buf = eventBuffer.get(meetingId) ?? [];
  Promise.resolve().then(() => {
    for (const { event } of buf) {
      try { listener(event); } catch { /* ignore */ }
    }
  });

  return () => {
    listeners.get(meetingId)?.delete(listener);
    if (listeners.get(meetingId)?.size === 0) listeners.delete(meetingId);
  };
}


