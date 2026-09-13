/**
 * rime-voice.ts — REFERENCE IMPLEMENTATION (copy into apps/control-room/src/lib/voice/ during RUN-001 N2)
 *
 * Rime-first sphere voice: es-MX default, English as a switch, word timestamps for the Council Bus.
 * Verified against the live API 2026-09-05: REST users.rime.ai/v1/rime-tts, WS users-ws.rime.ai/ws3.
 * Secrets: RIME_API_TOKEN from env (Infisical-synced). Never log it. Never ship it to the client.
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

export function pickSpeaker(agentId: SphereAgentId, lang: VoiceLang, opts?: { produced?: boolean }): RimeSpeakerChoice {
  const envSpeaker = process.env[`SPHERE_${agentId.toUpperCase().replace(/-/g, '_')}_VOICE_ID`];
  const envModel = process.env[`SPHERE_${agentId.toUpperCase().replace(/-/g, '_')}_VOICE_MODEL`] as RimeModel | undefined;
  const base = (lang === 'en' ? LIVE_EN : LIVE_ES)[agentId];
  const choice = { ...base };
  if (envSpeaker) choice.speaker = envSpeaker;
  if (envModel) choice.modelId = envModel;
  if (opts?.produced && choice.modelId === 'mistv3') choice.modelId = 'coda'; // produced clips favor quality
  return choice;
}

const RIME_REST = 'https://users.rime.ai/v1/rime-tts';
const RIME_WS = process.env.RIME_WS_URL || 'wss://users-ws.rime.ai/ws3';

export interface SynthResult {
  ok: true; audio: Buffer; contentType: 'audio/mpeg'; provider: 'rime'; speaker: string; modelId: RimeModel; ttfbMs: number;
}
export interface SynthFallback { ok: false; text: string; reason: string }

/** One-shot clip (REST). Use for chat replies, briefs, notifications. */
export async function rimeSynthesize(agentId: SphereAgentId, text: string, lang: VoiceLang = 'es', opts?: { produced?: boolean; signal?: AbortSignal }): Promise<SynthResult | SynthFallback> {
  const token = process.env.RIME_API_TOKEN;
  if (!token) return { ok: false, text, reason: 'RIME_API_TOKEN missing' };
  if (text.length > 2000) text = text.slice(0, 2000);
  const choice = pickSpeaker(agentId, lang, opts);
  const t0 = Date.now();
  try {
    const res = await fetch(RIME_REST, {
      method: 'POST',
      headers: { Accept: 'audio/mp3', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker: choice.speaker, modelId: choice.modelId, lang: choice.lang }),
      signal: opts?.signal ?? AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { ok: false, text, reason: `rime ${res.status}` };
    const audio = Buffer.from(await res.arrayBuffer());
    return { ok: true, audio, contentType: 'audio/mpeg', provider: 'rime', speaker: choice.speaker, modelId: choice.modelId, ttfbMs: Date.now() - t0 };
  } catch (e) {
    return { ok: false, text, reason: e instanceof Error ? e.message : 'rime error' };
  }
}

/** Events the Council Bus consumes (server re-emits these over the orchestrator SSE). */
export type VoiceEvent =
  | { type: 'voice.chunk'; agentId: SphereAgentId; seq: number; data: string /* base64 mp3 */; contextId: string }
  | { type: 'voice.words'; agentId: SphereAgentId; words: string[]; start: number[]; end: number[]; contextId: string }
  | { type: 'voice.done'; agentId: SphereAgentId; contextId: string }
  | { type: 'voice.fallback'; agentId: SphereAgentId; text: string; reason: string; contextId: string };

/**
 * Streaming turn over Rime JSON WebSocket (/ws3): emits base64 chunks + word-level timestamps.
 * Node 22+ has global WebSocket. On platforms without long-lived sockets, use rimeSynthesize + estimateWordTiming().
 */
export async function rimeStreamTurn(
  agentId: SphereAgentId,
  text: string,
  lang: VoiceLang,
  emit: (ev: VoiceEvent) => void,
  contextId: string = crypto.randomUUID(),
): Promise<void> {
  const token = process.env.RIME_API_TOKEN;
  if (!token) { emit({ type: 'voice.fallback', agentId, text, reason: 'RIME_API_TOKEN missing', contextId }); return; }
  const choice = pickSpeaker(agentId, lang);
  const qs = new URLSearchParams({ speaker: choice.speaker, modelId: choice.modelId, lang: choice.lang, audioFormat: 'mp3' });
  await new Promise<void>((resolve) => {
    let seq = 0;
    let ws: WebSocket;
    try {
      // @ts-expect-error — Node's WebSocket accepts headers via protocols/options in undici; adapt per runtime.
      ws = new WebSocket(`${RIME_WS}?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      emit({ type: 'voice.fallback', agentId, text, reason: 'ws unavailable', contextId }); resolve(); return;
    }
    const timer = setTimeout(() => { try { ws.close(); } catch {} ; emit({ type: 'voice.fallback', agentId, text, reason: 'ws timeout', contextId }); resolve(); }, 30_000);
    ws.onopen = () => { ws.send(JSON.stringify({ text, contextId })); ws.send(JSON.stringify({ operation: 'eos' })); };
    ws.onmessage = (m) => {
      try {
        const ev = JSON.parse(String(m.data));
        if (ev.type === 'chunk') emit({ type: 'voice.chunk', agentId, seq: seq++, data: ev.data, contextId });
        else if (ev.type === 'timestamps') emit({ type: 'voice.words', agentId, words: ev.word_timestamps.words, start: ev.word_timestamps.start, end: ev.word_timestamps.end, contextId });
        else if (ev.type === 'done') { emit({ type: 'voice.done', agentId, contextId }); clearTimeout(timer); ws.close(); resolve(); }
        else if (ev.type === 'error') { emit({ type: 'voice.fallback', agentId, text, reason: ev.message ?? 'rime error', contextId }); clearTimeout(timer); ws.close(); resolve(); }
      } catch { /* ignore malformed */ }
    };
    ws.onerror = () => { clearTimeout(timer); emit({ type: 'voice.fallback', agentId, text, reason: 'ws error', contextId }); resolve(); };
  });
}

/** REST fallback timing: ~140 wpm es-MX, ~160 wpm en. Good enough to drive speakingNow. */
export function estimateWordTiming(text: string, lang: VoiceLang): { words: string[]; start: number[]; end: number[] } {
  const words = text.split(/\s+/).filter(Boolean);
  const wps = (lang === 'es' ? 140 : 160) / 60;
  const start: number[] = []; const end: number[] = [];
  let t = 0.12;
  for (const w of words) {
    const dur = Math.max(0.18, (w.length / 5) / wps);
    start.push(t); end.push(t + dur); t += dur + (/[.,;:!?]$/.test(w) ? 0.25 : 0.04);
  }
  return { words, start, end };
}
