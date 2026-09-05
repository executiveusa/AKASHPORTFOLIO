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
 * Auth rules:
 *   POST initiatedBy='bienvenida'  → requireUser (any signed-in operator)
 *                                    agentIds forced ⊆ ['synthia','alex','cazadora']
 *   POST all other                 → requireAdmin
 *   GET  meetingId registered as bienvenida → requireUser
 *   GET  all other                           → requireAdmin
 *
 * Voice integration (RUN-001 N3):
 *   sphere.signal events with a transcript trigger speakTurn(), which opens
 *   a Rime WS stream (or REST fallback) and publishes voice.* events on the
 *   same SSE channel. Turns are serialised per meeting so speakers don't overlap.
 *   voice.chunk events are NOT stored in the replay buffer (too large);
 *   voice.words / voice.done / voice.fallback ARE buffered for late subscribers.
 */

import { createHmac } from 'node:crypto';
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
import { requireAdmin, requireUser, toErrorResponse } from '@/lib/auth/guards';
import { speakTurn, releaseMeetingVoiceBudget } from '@/lib/voice/council-voice';
import {
  registerMeeting,
  noteSignal,
  noteVoice,
  closeMeeting,
} from '@/lib/council/registry';

// ── HMAC token helpers ─────────────────────────────────────────────────────
// Signed token for cross-instance SSE auth (bienvenida flow).
// POST returns the token; GET verifies it without relying on module-level Set.

const HMAC_SECRET = (): string =>
  process.env.NEXTAUTH_SECRET ?? process.env.CRON_SECRET ?? 'dev';

function signMeetingToken(meetingId: string): string {
  return createHmac('sha256', HMAC_SECRET())
    .update(meetingId)
    .digest('hex');
}

function verifyMeetingToken(meetingId: string, token: string): boolean {
  const expected = signMeetingToken(meetingId);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

// ── Spend-keyword detection ────────────────────────────────────────────────
const SPEND_PATTERN =
  /\b(pagar|gastar|contratar|enviar|publicar|comprar|invertir|firmar|\$|MXN|EUR|USD)\b/i;

// ── Bienvenida meeting tracking ────────────────────────────────────────────
// Tracks meetingIds that were started via the bienvenida first-run flow so the
// GET SSE endpoint can allow requireUser (rather than requireAdmin) for those.
const bienvenidaMeetings = new Set<string>();
const BIENVENIDA_AGENTS: SphereAgentId[] = ['synthia', 'alex', 'cazadora'];

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
  let body: {
    brief?: Partial<CouncilBrief>;
    /** Legacy: plain topic string (backward compat) */
    topic?: string;
    agentIds?: SphereAgentId[];
    initiatedBy?: string;
    /** Voice synthesis language. Default 'es'. Applied to speakTurn calls only. */
    lang?: VoiceLang;
    /** Enable voice synthesis. Default true. Set false for text-only mode. */
    voice?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const isBienvenida = body.initiatedBy === 'bienvenida';

  // Auth: bienvenida → any signed-in operator; all other → admin only
  if (isBienvenida) {
    try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  } else {
    try { await requireAdmin(); } catch (e) { return toErrorResponse(e); }
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

  // For bienvenida: force agentIds ⊆ BIENVENIDA_AGENTS; drop others.
  // For normal meetings: filter synthia/la-vigilante as chairman/guardian.
  let boardIds: SphereAgentId[];
  if (isBienvenida) {
    const requested = body.agentIds ?? BIENVENIDA_AGENTS;
    boardIds = requested.filter(
      (id): id is SphereAgentId => BIENVENIDA_AGENTS.includes(id as SphereAgentId),
    );
    if (boardIds.length === 0) boardIds = [...BIENVENIDA_AGENTS];
    // Register this meeting as a bienvenida meeting (fast-path for same-instance GET)
    bienvenidaMeetings.add(brief.id);
    // Auto-clean after 2 h to avoid unbounded growth
    setTimeout(() => bienvenidaMeetings.delete(brief.id), 2 * 60 * 60 * 1000);
  } else {
    boardIds = (body.agentIds ?? DEFAULT_BOARD_IDS).filter(
      (id): id is SphereAgentId => id !== 'synthia' && id !== 'la-vigilante',
    );
  }

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
      const coherence = acceptVotes / total;
      closeMeeting(brief.id, coherence, decisions);
      emitEvent(brief.id, {
        t: Date.now(),
        type: 'meeting.end',
        meetingId: brief.id,
        artifactRef: `/api/council/memo?briefId=${brief.id}`,
        decisions,
      } satisfies CouncilEvent);

      // ── Approval gate (autonomy guardrail ≥ 0.85) ──────────────────────────
      // needsApproval when confidence < 0.85 OR any decision contains spend keywords.
      const memoConfidence: number =
        typeof (memo as Record<string, unknown>).confidence === 'number'
          ? (memo as Record<string, unknown>).confidence as number
          : coherence;
      const decisionsText = decisions.join(' ');
      const needsApproval =
        memoConfidence < 0.85 || SPEND_PATTERN.test(decisionsText);

      if (needsApproval) {
        const reason = memoConfidence < 0.85
          ? `El consejo alcanzó confianza ${Math.round(memoConfidence * 100)}% (umbral 85%); el operador debe revisar antes de ejecutar.`
          : `Una o más decisiones implican una acción de gasto o compromiso que requiere autorización del operador.`;

        import('@/lib/supabase-client')
          .then(({ supabaseAdmin }) =>
            supabaseAdmin
              .from('approvals')
              .insert({
                workflow_id:   brief.id,
                risk_level:    memoConfidence < 0.85 ? 'medium' : 'high',
                status:        'pending',
                requested_by:  'la-vigilante',
                requested_at:  new Date().toISOString(),
                metadata:      { meetingId: brief.id, confidence: memoConfidence, decisions },
              })
              .select('id')
              .single(),
          )
          .then(({ data, error }) => {
            if (error) console.warn('[orchestrator] approval insert skipped:', error.message);
            const approvalId = (data as { id?: string } | null)?.id ?? brief.id;
            const t = Date.now();
            // Emit approval.required into the SSE buffer (buffered so late joiners see it)
            emitEvent(brief.id, {
              t,
              type: 'approval.required',
              meetingId: brief.id,
              id: approvalId,
              reason,
              agentId: 'la-vigilante',
            });
            // Emit a sphere.signal for la-vigilante so she lights up amber
            emitEvent(brief.id, {
              t: t + 1,
              type: 'sphere.signal',
              meetingId: brief.id,
              agentId: 'la-vigilante',
              kind: 'ASSERT',
              amplitude: 1.0,
              durationMs: 5000,
              carrierHz: 0,
              transcript: reason,
            } satisfies CouncilEvent);
          })
          .catch((err: unknown) => {
            console.warn('[orchestrator] approval flow failed:', err);
            // Still emit the event even if DB insert failed
            const t = Date.now();
            emitEvent(brief.id, {
              t,
              type: 'approval.required',
              meetingId: brief.id,
              id: brief.id,
              reason,
              agentId: 'la-vigilante',
            });
          });
      }

      // Best-effort: persist memo as a synthia_asset so /library can list it.
      // Wrapped in try/catch — table may not exist yet; never block the meeting flow.
      import('@/lib/supabase-client')
        .then(({ supabaseAdmin }) => {
          const descriptionLines: string[] = [
            ...decisions.map((d: string) => `- ${d}`),
            '',
            `Coherencia del consejo: ${Math.round(coherence * 100)}%`,
          ];
          return supabaseAdmin
            .from('synthia_assets')
            .insert({
              thread_id: brief.id,
              type: 'memo',
              title: brief.situation.slice(0, 80),
              url: `/api/council/memo?briefId=${brief.id}`,
              description: descriptionLines.join('\n'),
            });
        })
        .then(({ error }) => {
          if (error) console.warn('[orchestrator] memo→asset insert skipped:', error.message);
        })
        .catch((err: unknown) => {
          console.warn('[orchestrator] memo→asset failed:', err);
        });
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

  const responseBody: Record<string, unknown> = {
    meetingId:  brief.id,
    briefId:    brief.id,
    status:     'started',
    agentCount: boardIds.length,
  };
  // Bienvenida meetings get a signed token so the GET SSE endpoint can verify
  // cross-instance (token replaces reliance on module-level Set alone).
  if (isBienvenida) {
    responseBody.token = signMeetingToken(brief.id);
  }
  return NextResponse.json(responseBody);
}

// ---------------------------------------------------------------------------
// GET — SSE stream for a meeting
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

  // Auth: bienvenida meetings allow any signed-in user; others require admin.
  // Fast-path: same-instance module-level Set. Cross-instance: verify HMAC token.
  const suppliedToken = req.nextUrl.searchParams.get('token');
  const isBienvenidaGet =
    bienvenidaMeetings.has(meetingId) ||
    (suppliedToken !== null && verifyMeetingToken(meetingId, suppliedToken));

  if (isBienvenidaGet) {
    try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  } else {
    try { await requireAdmin(); } catch (e) { return toErrorResponse(e); }
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
// lang is threaded from POST body into all speakTurn calls.
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
