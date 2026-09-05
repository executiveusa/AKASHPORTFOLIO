/**
 * Council Orchestrator v3 — SYNTHIA™ as Chairman
 *
 * Uses the 3-stage Karpathy council engine:
 *   Stage 1 — Position: each sphere gives their independent take
 *   Stage 2 — Review:   each sphere reviews all others (anonymized)
 *   Stage 3 — Synthesis: SYNTHIA writes the final Memo
 *
 * POST /api/council/orchestrator  — start a meeting
 * GET  /api/council/orchestrator  — SSE stream of CouncilEvents + VoiceEvents
 *
 * Voice integration (RUN-001 N3):
 *   sphere.signal events with a transcript trigger speakTurn(), which opens
 *   a Rime WS stream (or REST fallback) and publishes voice.* events on the
 *   same SSE channel. Turns are serialised per meeting so speakers don't overlap.
 *   voice.chunk events are NOT stored in the replay buffer (too large);
 *   voice.words / voice.done / voice.fallback ARE buffered for late subscribers.
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
import type { SphereAgentId, CouncilEvent, VoiceEvent, VoiceLang } from '@/shared/council-events';
import { requireAdmin, toErrorResponse } from '@/lib/auth/guards';
import { speakTurn, releaseMeetingVoiceBudget } from '@/lib/voice/council-voice';
import {
  registerMeeting,
  noteSignal,
  noteVoice,
  closeMeeting,
} from '@/lib/council/registry';

// ── Input sanitization ─────────────────────────────────────────────────────

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
// POST — start a new council meeting
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: {
    brief?: Partial<CouncilBrief>;
    /** Legacy: plain topic string (backward compat) */
    topic?: string;
    agentIds?: SphereAgentId[];
    initiatedBy?: string;
    /** Voice synthesis language. Default 'es'. Not threaded into council-engine
     *  (CouncilMeetingOpts has no lang field); applied to speakTurn calls only. */
    lang?: VoiceLang;
    /** Enable voice synthesis. Default true. Set false for text-only mode. */
    voice?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Build CouncilBrief from input ──────────────────────────────────────────
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

  // Voice config for this meeting
  const meetingLang: VoiceLang = body.lang ?? 'es';
  const voiceEnabled: boolean  = body.voice !== false; // default true

  // Only real board members — not the chairman (synthia) or guardian (la-vigilante)
  const boardIds = (body.agentIds ?? DEFAULT_BOARD_IDS).filter(
    (id): id is SphereAgentId => id !== 'synthia' && id !== 'la-vigilante',
  );

  // Emit meeting.begin + node.spawn after a tick so SSE clients can connect first
  setTimeout(() => {
    const beginT = Date.now();
    registerMeeting(brief.id, brief.situation.slice(0, 120), boardIds, beginT);
    emitEvent(brief.id, {
      t: beginT,
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
      mapToCouncilEvent(brief.id, stage, sphereId, data, meetingLang, voiceEnabled),
  })
    .then(memo => {
      const decisions = memo.nextActions.map(a => `${a.owner}: ${a.action}`);
      const acceptVotes = memo.boardStances?.filter((s: { vote: string }) => s.vote === 'accept').length ?? 0;
      const total = Math.max(memo.boardStances?.length ?? 1, 1);
      closeMeeting(brief.id, acceptVotes / total, decisions);
      emitEvent(brief.id, {
        t: Date.now(),
        type: 'meeting.end',
        meetingId: brief.id,
        artifactRef: `/api/council/memo?briefId=${brief.id}`,
        decisions,
      } satisfies CouncilEvent);
    })
    .catch(err => {
      console.error(`[orchestrator] Meeting ${brief.id} crashed:`, err);
      closeMeeting(brief.id, undefined, [`ERROR: ${String(err).slice(0, 200)}`]);
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
// GET — SSE stream for a meeting
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (e) { return toErrorResponse(e); }
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
      const cleanup = subscribeMeeting(meetingId, (event: CouncilEvent | VoiceEvent) => {
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
// Map internal council-engine onEvent callbacks → typed CouncilEvents,
// then enqueue a voice turn for sphere.signal events that carry a transcript.
// ---------------------------------------------------------------------------

function mapToCouncilEvent(
  meetingId: string,
  stage: string,
  sphereId: SphereAgentId | undefined,
  data: unknown,
  lang: VoiceLang = 'es',
  voiceEnabled = true,
): void {
  if (!sphereId) return;

  const info = SPHERE_FREQUENCY_MAP[sphereId];
  const hz = info?.frequency_hz ?? 0.5;

  if (stage === 'position') {
    const pos = data as SpherePosition;
    const transcript = pos.recommendation ?? pos.stance;
    const posT = Date.now();
    noteSignal(meetingId, sphereId, 'ASSERT', posT, transcript);
    emitEvent(meetingId, {
      t: posT,
      type: 'sphere.signal',
      meetingId,
      agentId: sphereId,
      kind: 'ASSERT',
      amplitude: Math.max(0, Math.min(1, pos.confidence ?? 0.7)),
      durationMs: 3000,
      carrierHz: hz,
      transcript,
    } satisfies CouncilEvent);

    if (voiceEnabled && transcript) {
      enqueueVoiceTurn(meetingId, sphereId, transcript, lang);
    }
    return;
  }

  if (stage === 'review') {
    const rev = data as SphereReview;
    const transcript = rev.topInsight;
    const revT = Date.now();
    noteSignal(meetingId, sphereId, 'REFLECT', revT, transcript);
    emitEvent(meetingId, {
      t: revT,
      type: 'sphere.signal',
      meetingId,
      agentId: sphereId,
      kind: 'REFLECT',
      amplitude: 0.6,
      durationMs: 2500,
      carrierHz: hz,
      transcript,
    } satisfies CouncilEvent);

    if (voiceEnabled && transcript) {
      enqueueVoiceTurn(meetingId, sphereId, transcript, lang);
    }
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
// Voice turn queue — one sequential Promise chain per meeting
// Ensures speakers don't overlap within the same meeting.
// ---------------------------------------------------------------------------

const voiceQueues = new Map<string, Promise<void>>();

function enqueueVoiceTurn(
  meetingId: string,
  agentId: SphereAgentId,
  transcript: string,
  lang: VoiceLang,
): void {
  const prior = voiceQueues.get(meetingId) ?? Promise.resolve();
  const next = prior
    .then(() =>
      speakTurn(meetingId, agentId, transcript, lang, (voiceEv: VoiceEvent) => {
        // voice.chunk is large — publish to subscribers but skip the replay buffer.
        // voice.words / voice.done / voice.fallback go into the buffer for late subscribers.
        const skipBuffer = voiceEv.type === 'voice.chunk';
        if (voiceEv.type === 'voice.done') noteVoice(meetingId, agentId);
        emitEvent(meetingId, voiceEv, { skipBuffer });
      }),
    )
    .catch((err: unknown) => {
      console.error(`[orchestrator] speakTurn error for ${agentId} in ${meetingId}:`, err);
    });
  voiceQueues.set(meetingId, next);
}

// ---------------------------------------------------------------------------
// In-memory pub/sub + event buffer for SSE
// Buffer replays events to late-connecting subscribers (race-condition safe)
// ---------------------------------------------------------------------------

type AnySSEEvent = CouncilEvent | VoiceEvent;
type EventListener = (event: AnySSEEvent) => void;
const listeners   = new Map<string, Set<EventListener>>();
const eventBuffer = new Map<string, Array<{ event: AnySSEEvent; ts: number }>>();

const BUFFER_MAX    = 200;
const BUFFER_TTL_MS = 15 * 60 * 1000;

function emitEvent(
  meetingId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any,
  opts?: { skipBuffer?: boolean },
): void {
  if (!opts?.skipBuffer) {
    if (!eventBuffer.has(meetingId)) eventBuffer.set(meetingId, []);
    const buf = eventBuffer.get(meetingId)!;
    buf.push({ event, ts: Date.now() });
    if (buf.length > BUFFER_MAX) buf.shift();
  }

  if (event.type === 'meeting.end') {
    setTimeout(() => {
      eventBuffer.delete(meetingId);
      voiceQueues.delete(meetingId);
      releaseMeetingVoiceBudget(meetingId);
    }, BUFFER_TTL_MS);
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
