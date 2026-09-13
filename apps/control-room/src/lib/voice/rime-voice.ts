/**
 * rime-voice.ts — adapted from synthia/_shared/reference-impl/rime-voice.ts
 *
 * Rime-first sphere voice: es-MX default, English as a switch, word timestamps for the Council Bus.
 * Verified against the live API 2026-09-05: REST users.rime.ai/v1/rime-tts, WS users-ws.rime.ai/ws3.
 * Secrets: RIME_API_TOKEN from env (Infisical-synced). Never log it. Never ship it to the client.
 *
 * Node 24 WebSocket does not accept headers in the constructor.
 * Strategy: attempt dynamic import of `ws` (which accepts headers), fall back to
 * rimeSynthesize + estimateWordTiming if `ws` is not installed or the socket fails.
 */

import type { SphereAgentId } from '@/shared/council-events';

export type VoiceLang = 'es' | 'en';
export type RimeModel = 'mistv3' | 'coda' | 'mistv2';

export interface RimeSpeakerChoice {
  speaker: string;
  modelId: RimeModel;
  lang: 'spa' | 'spa-mx' | 'eng';
}

/** Single home of sphere→voice mapping is synthia/_shared/registry/spheres.md; this mirrors it. */
const LIVE_ES: Record<SphereAgentId, RimeSpeakerChoice> = {
  synthia:        { speaker: 'isa',       modelId: 'mistv3', lang: 'spa-mx' },
  alex:           { speaker: 'thea',      modelId: 'coda',   lang: 'spa-mx' },
  cazadora:       { speaker: 'seraphina', modelId: 'mistv3', lang: 'spa' },
  forjadora:      { speaker: 'abril',     modelId: 'coda',   lang: 'spa' },
  seductora:      { speaker: 'frieda',    modelId: 'coda',   lang: 'spa' },
  consejo:        { speaker: 'azulado',   modelId: 'coda',   lang: 'spa' },
  'dr-economia':  { speaker: 'alba',      modelId: 'coda',   lang: 'spa' },
  'dra-cultura':  { speaker: 'claridad',  modelId: 'coda',   lang: 'spa' },
  'ing-teknos':   { speaker: 'xavier',    modelId: 'coda',   lang: 'spa' },
  'la-vigilante': { speaker: 'rosalie',   modelId: 'coda',   lang: 'spa-mx' },
};

const LIVE_EN: Record<SphereAgentId, RimeSpeakerChoice> = {
  synthia:        { speaker: 'astra',      modelId: 'mistv3', lang: 'eng' },
  alex:           { speaker: 'lyra',       modelId: 'coda',   lang: 'eng' },
  cazadora:       { speaker: 'clementine', modelId: 'coda',   lang: 'eng' },
  forjadora:      { speaker: 'lintel',     modelId: 'coda',   lang: 'eng' },
  seductora:      { speaker: 'luna',       modelId: 'mistv3', lang: 'eng' },
  consejo:        { speaker: 'bancroft',   modelId: 'coda',   lang: 'eng' },
  'dr-economia':  { speaker: 'masonry',    modelId: 'coda',   lang: 'eng' },
  'dra-cultura':  { speaker: 'eyre',       modelId: 'coda',   lang: 'eng' },
  'ing-teknos':   { speaker: 'albion',     modelId: 'coda',   lang: 'eng' },
  'la-vigilante': { speaker: 'eyre',       modelId: 'coda',   lang: 'eng' },
};

export function pickSpeaker(
  agentId: SphereAgentId,
  lang: VoiceLang,
  opts?: { produced?: boolean },
): RimeSpeakerChoice {
  const envSpeaker =
    process.env[`SPHERE_${agentId.toUpperCase().replace(/-/g, '_')}_VOICE_ID`];
  const envModel =
    process.env[`SPHERE_${agentId.toUpperCase().replace(/-/g, '_')}_VOICE_MODEL`] as
      | RimeModel
      | undefined;
  const base = (lang === 'en' ? LIVE_EN : LIVE_ES)[agentId];
  const choice: RimeSpeakerChoice = { ...base };
  if (envSpeaker) choice.speaker = envSpeaker;
  if (envModel) choice.modelId = envModel;
  if (opts?.produced && choice.modelId === 'mistv3') choice.modelId = 'coda';
  return choice;
}

const RIME_REST = 'https://users.rime.ai/v1/rime-tts';
const RIME_WS_URL = () => process.env.RIME_WS_URL ?? 'wss://users-ws.rime.ai/ws3';

export interface SynthResult {
  ok: true;
  audio: Buffer;
  contentType: 'audio/mpeg';
  provider: 'rime';
  speaker: string;
  modelId: RimeModel;
  ttfbMs: number;
}

export interface SynthFallback {
  ok: false;
  text: string;
  reason: string;
}

/** One-shot clip via Rime REST API. */
export async function rimeSynthesize(
  agentId: SphereAgentId,
  text: string,
  lang: VoiceLang = 'es',
  opts?: { produced?: boolean; signal?: AbortSignal },
): Promise<SynthResult | SynthFallback> {
  const token = process.env.RIME_API_TOKEN;
  if (!token) return { ok: false, text, reason: 'RIME_API_TOKEN missing' };
  const safeText = text.slice(0, 2000);
  const choice = pickSpeaker(agentId, lang, opts);
  const t0 = Date.now();
  try {
    const res = await fetch(RIME_REST, {
      method: 'POST',
      headers: {
        Accept: 'audio/mp3',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: safeText,
        speaker: choice.speaker,
        modelId: choice.modelId,
        lang: choice.lang,
      }),
      signal: opts?.signal ?? AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { ok: false, text: safeText, reason: `rime ${res.status}` };
    const audio = Buffer.from(await res.arrayBuffer());
    return {
      ok: true,
      audio,
      contentType: 'audio/mpeg',
      provider: 'rime',
      speaker: choice.speaker,
      modelId: choice.modelId,
      ttfbMs: Date.now() - t0,
    };
  } catch (e) {
    return {
      ok: false,
      text: safeText,
      reason: e instanceof Error ? e.message : 'rime error',
    };
  }
}

/** Events the Council Bus consumes (server re-emits these over the orchestrator SSE). */
export type VoiceEvent =
  | { type: 'voice.chunk'; agentId: SphereAgentId; seq: number; data: string; contextId: string }
  | { type: 'voice.words'; agentId: SphereAgentId; words: string[]; start: number[]; end: number[]; contextId: string }
  | { type: 'voice.done'; agentId: SphereAgentId; contextId: string }
  | { type: 'voice.fallback'; agentId: SphereAgentId; text: string; reason: string; contextId: string };

/** Parsed message frame from the Rime WS JSON protocol. */
interface RimeWsChunkFrame {
  type: 'chunk';
  data: string;
}
interface RimeWsTimestampsFrame {
  type: 'timestamps';
  word_timestamps: { words: string[]; start: number[]; end: number[] };
}
interface RimeWsDoneFrame {
  type: 'done';
}
interface RimeWsErrorFrame {
  type: 'error';
  message?: string;
}
type RimeWsFrame = RimeWsChunkFrame | RimeWsTimestampsFrame | RimeWsDoneFrame | RimeWsErrorFrame;

function isRimeFrame(v: unknown): v is RimeWsFrame {
  return typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).type === 'string';
}

/**
 * Streaming turn via Rime WebSocket (/ws3).
 *
 * Node 24 global WebSocket does not accept headers in the constructor, so we
 * try to dynamically import the `ws` package (which does accept `{ headers }`).
 * If `ws` is not installed, we fall back to rimeSynthesize + estimateWordTiming,
 * emitting a single voice.chunk + voice.words + voice.done.
 */
export async function rimeStreamTurn(
  agentId: SphereAgentId,
  text: string,
  lang: VoiceLang,
  emit: (ev: VoiceEvent) => void,
  contextId: string = crypto.randomUUID(),
): Promise<void> {
  const token = process.env.RIME_API_TOKEN;
  if (!token) {
    emit({ type: 'voice.fallback', agentId, text, reason: 'RIME_API_TOKEN missing', contextId });
    return;
  }

  const choice = pickSpeaker(agentId, lang);
  const qs = new URLSearchParams({
    speaker: choice.speaker,
    modelId: choice.modelId,
    lang: choice.lang,
    audioFormat: 'mp3',
  });
  const wsUrl = `${RIME_WS_URL()}?${qs.toString()}`;

  // Try `ws` package first (supports custom headers, works server-side everywhere).
  let wsUsed = false;
  try {
    // Dynamic import — guarded so missing dep degrades gracefully.
    // Bundler-opaque specifier so Turbopack/webpack don't try to resolve an optional dep.
    const wsSpecifier: string = 'ws';
    const wsModule = (await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ wsSpecifier).catch(() => null)) as
      | { default?: unknown; WebSocket?: unknown }
      | null;
    if (wsModule) {
      interface WsLike {
        on(event: 'open' | 'error' | 'close', cb: () => void): void;
        on(event: 'message', cb: (raw: Buffer | string) => void): void;
        send(data: string): void;
        close(): void;
      }
      type WsCtor = new (url: string, opts: { headers: Record<string, string> }) => WsLike;
      const WsClass = (wsModule.default ?? wsModule.WebSocket) as WsCtor | undefined;
      if (typeof WsClass === 'function') {
        wsUsed = true;
        await new Promise<void>((resolve) => {
          let seq = 0;
          const ws = new WsClass(wsUrl, { headers: { Authorization: `Bearer ${token}` } });
          const timer = setTimeout(() => {
            try { ws.close(); } catch { /* ignore */ }
            emit({ type: 'voice.fallback', agentId, text, reason: 'ws timeout', contextId });
            resolve();
          }, 30_000);

          ws.on('open', () => {
            ws.send(JSON.stringify({ text }));
            ws.send(JSON.stringify({ operation: 'eos' }));
          });

          ws.on('message', (raw: Buffer | string) => {
            try {
              const parsed: unknown = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf8'));
              if (!isRimeFrame(parsed)) return;
              const frame = parsed;
              if (frame.type === 'chunk') {
                emit({ type: 'voice.chunk', agentId, seq: seq++, data: frame.data, contextId });
              } else if (frame.type === 'timestamps') {
                const { words, start, end } = frame.word_timestamps;
                emit({ type: 'voice.words', agentId, words, start, end, contextId });
              } else if (frame.type === 'done') {
                clearTimeout(timer);
                ws.close();
                emit({ type: 'voice.done', agentId, contextId });
                resolve();
              } else if (frame.type === 'error') {
                clearTimeout(timer);
                ws.close();
                emit({
                  type: 'voice.fallback',
                  agentId,
                  text,
                  reason: frame.message ?? 'rime ws error',
                  contextId,
                });
                resolve();
              }
            } catch { /* ignore malformed */ }
          });

          ws.on('error', () => {
            clearTimeout(timer);
            emit({ type: 'voice.fallback', agentId, text, reason: 'ws error', contextId });
            resolve();
          });
        });
        return;
      }
    }
  } catch { /* ws not available */ }

  if (!wsUsed) {
    // REST fallback: synthesize + estimated timing, emit single chunk sequence.
    const result = await rimeSynthesize(agentId, text, lang);
    if (!result.ok) {
      emit({ type: 'voice.fallback', agentId, text, reason: result.reason, contextId });
      return;
    }
    const b64 = result.audio.toString('base64');
    emit({ type: 'voice.chunk', agentId, seq: 0, data: b64, contextId });
    const timing = estimateWordTiming(text, lang);
    emit({ type: 'voice.words', agentId, ...timing, contextId });
    emit({ type: 'voice.done', agentId, contextId });
  }
}

/** REST fallback timing: ~140 wpm es-MX, ~160 wpm en. Good enough to drive speakingNow. */
export function estimateWordTiming(
  text: string,
  lang: VoiceLang,
): { words: string[]; start: number[]; end: number[] } {
  const words = text.split(/\s+/).filter(Boolean);
  const wps = (lang === 'es' ? 140 : 160) / 60;
  const start: number[] = [];
  const end: number[] = [];
  let t = 0.12;
  for (const w of words) {
    const dur = Math.max(0.18, w.length / 5 / wps);
    start.push(t);
    end.push(t + dur);
    t += dur + (/[.,;:!?]$/.test(w) ? 0.25 : 0.04);
  }
  return { words, start, end };
}
