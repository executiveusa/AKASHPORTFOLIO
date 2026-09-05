'use client';

/**
 * bus.ts — CouncilBus: single source of truth for live meeting state.
 *
 * RUN-001 TTFA fix: starts progressive audio playback from the first
 * voice.chunk via MediaSource API (append each chunk's bytes to a SourceBuffer
 * as they arrive). Falls back to decode-after-done on platforms where
 * MediaSource / audio/mpeg is unsupported (Safari iOS).
 *
 * Bug W1 fix: matches on event.type (the actual wire format) not event.kind.
 * SSR safety: no window/AudioContext/EventSource access at module scope.
 */

import { create } from 'zustand';
import type { CouncilField } from '@/lib/sphere-physics';
import type {
  CouncilEvent,
  SphereAgentId,
  VoiceEvent,
  AnyCouncilEvent,
  VoiceLang,
} from '@/shared/council-events';

type Connection = 'idle' | 'live' | 'replay' | 'error';

// ---------------------------------------------------------------------------
// Voice queue types
// ---------------------------------------------------------------------------

interface QueuedClip {
  agentId: SphereAgentId;
  contextId: string;
  /** ms timestamp of first received chunk (0 = no chunks yet) */
  firstChunkAt: number;
  /** base64 chunks — fallback path accumulates all; progressive path also fills for stats */
  chunks: string[];
  /** decoded bytes pending SourceBuffer.appendBuffer — MediaSource path only */
  pendingBytes: Uint8Array[];
  appending: boolean;
  endOfStreamPending: boolean;
  audioEl: HTMLAudioElement | null;
  mediaSource: MediaSource | null;
  sourceBuffer: SourceBuffer | null;
  /** true once play() was initiated (or we began setting it up) */
  started: boolean;
  words: { words: string[]; start: number[]; end: number[] } | null;
  done: boolean;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export interface BusMetrics {
  /** Time from first voice.chunk arriving to play() call, ms */
  ttfaMs?: number;
  /** Time from meeting.begin event to first audio, ms */
  meetingToAudioMs?: number;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface BusState {
  meetingId: string | null;
  connection: Connection;
  lang: VoiceLang;
  field: CouncilField | null;
  transcript: Array<{ t: number; agentId: SphereAgentId; kind: string; text?: string }>;
  approvalPending: { id: string; reason: string } | null;
  speaking: SphereAgentId | null;
  rms: number;
  metrics: BusMetrics;

  // Actions
  connect: (meetingId: string, opts?: { token?: string }) => void;
  disconnect: () => void;
  setLang: (l: VoiceLang) => void;
  resolveApproval: () => void;
}

// ---------------------------------------------------------------------------
// Module-level mutable state (not in store — avoids React re-renders)
// ---------------------------------------------------------------------------

const voiceQueue: QueuedClip[] = [];
let es: EventSource | null = null;
let rafHandle = 0;
let audioCtx: AudioContext | null = null;
let playing = false;

// Progressive-playback bookkeeping
let audioUnlocked = false;
let currentAudioEl: HTMLAudioElement | null = null;
let meetingBeginAt: number | null = null;
let firstAudioFired = false;

// Cached MSE support check (computed lazily, once)
let _mseCache: boolean | null = null;

// Stable set/get captured once at store creation
type SetFn = (partial: Partial<BusState>) => void;
type GetFn = () => BusState;
let busSet: SetFn | null = null;
let busGet: GetFn | null = null;

// Lazily resolved physics module (avoids SSR import issues)
type PhysicsMod = typeof import('@/lib/sphere-physics');
let physics: PhysicsMod | null = null;
async function getPhysics(): Promise<PhysicsMod> {
  if (!physics) physics = await import('@/lib/sphere-physics');
  return physics;
}

// ---------------------------------------------------------------------------
// Public: unlock audio after first user gesture
// Call from the UI on any click / keydown event.
// ---------------------------------------------------------------------------

export function unlockAudio(): void {
  if (audioUnlocked) return;
  audioUnlocked = true;
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume().catch(() => { /* ignore */ });
  }
  // Retry play on any audio element blocked by autoplay policy
  if (currentAudioEl && currentAudioEl.paused) {
    currentAudioEl.play().catch(() => { /* ignore */ });
  }  // Chunks may have arrived before the gesture — start playback now.
  pumpVoice();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mseSupported(): boolean {
  if (_mseCache !== null) return _mseCache;
  if (typeof window === 'undefined') {
    return false; // SSR
  }
  try {
    _mseCache =
      typeof MediaSource !== 'undefined' &&
      typeof MediaSource.isTypeSupported === 'function' &&
      MediaSource.isTypeSupported('audio/mpeg');
  } catch {
    _mseCache = false;
  }
  return _mseCache;
}

function b64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------------------
// Store definition
// ---------------------------------------------------------------------------

export const useCouncilBus = create<BusState>((set, get) => {
  // Capture stable references so module-level helpers can call set/get
  busSet = set;
  busGet = get;

  return {
    meetingId: null,
    connection: 'idle',
    lang: 'es',
    field: null,
    transcript: [],
    approvalPending: null,
    speaking: null,
    rms: 0,
    metrics: {},

    resolveApproval: () => set({ approvalPending: null }),

    setLang: (lang) => {
      set({ lang });
      fetch('/api/synthia/memory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_lang: lang }),
      }).catch(() => { /* ignore network errors */ });
    },

    disconnect: () => {
      es?.close();
      es = null;
      cancelAnimationFrame(rafHandle);
      rafHandle = 0;
      // Clean up any playing audio element and its object URL
      if (currentAudioEl) {
        try {
          currentAudioEl.pause();
          const src = currentAudioEl.src;
          currentAudioEl.src = '';
          if (src.startsWith('blob:')) URL.revokeObjectURL(src);
        } catch { /* ignore */ }
        currentAudioEl = null;
      }
      voiceQueue.length = 0;
      playing = false;
      firstAudioFired = false;
      meetingBeginAt = null;
      set({ connection: 'idle', speaking: null, rms: 0, metrics: {} });
    },

    connect: async (meetingId, opts) => {
      get().disconnect();

      const phy = await getPhysics();
      const field = phy.createCouncilField(meetingId);
      set({ meetingId, field, connection: 'live', transcript: [], approvalPending: null, metrics: {} });

      // ------------------------------------------------------------------
      // SSE subscription — include token for cross-instance HMAC auth
      // ------------------------------------------------------------------
      const sseUrl = opts?.token
        ? `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}&token=${encodeURIComponent(opts.token)}`
        : `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`;
      es = new EventSource(sseUrl);
      es.onerror = () => set({ connection: 'error' });

      es.onmessage = (msg) => {
        let ev: AnyCouncilEvent;
        try {
          ev = JSON.parse(msg.data) as AnyCouncilEvent;
        } catch {
          return;
        }

        const st = get();
        if (!st.field) return;

        switch (ev.type) {
          case 'sphere.signal': {
            const e = ev as Extract<CouncilEvent, { type: 'sphere.signal' }>;
            const phy2 = physics;
            if (!phy2) break;
            set({
              field: phy2.applyEventToField(st.field, e),
              transcript: [
                ...st.transcript,
                { t: e.t, agentId: e.agentId, kind: e.kind, text: e.transcript },
              ],
            });
            break;
          }

          case 'meeting.begin': {
            meetingBeginAt = Date.now();
            const phy3 = physics;
            if (!phy3) break;
            set({ field: phy3.applyEventToField(st.field, ev as CouncilEvent) });
            break;
          }

          case 'meeting.closing':
          case 'meeting.focus':
          case 'meeting.end':
          case 'node.spawn': {
            const phy3 = physics;
            if (!phy3) break;
            set({ field: phy3.applyEventToField(st.field, ev as CouncilEvent) });
            if (ev.type === 'meeting.end') {
              setTimeout(() => get().disconnect(), 4000);
            }
            break;
          }

          case 'approval.required': {
            const e = ev as Extract<VoiceEvent, { type: 'approval.required' }>;
            set({ approvalPending: { id: e.id, reason: e.reason } });
            break;
          }

          case 'voice.chunk': {
            const e = ev as Extract<VoiceEvent, { type: 'voice.chunk' }>;
            enqueueChunk(e);
            break;
          }

          case 'voice.words': {
            const e = ev as Extract<VoiceEvent, { type: 'voice.words' }>;
            enqueueWords(e);
            break;
          }

          case 'voice.done': {
            const e = ev as Extract<VoiceEvent, { type: 'voice.done' }>;
            enqueueDone(e);
            // Fallback: pumpVoice starts decode-after-done playback.
            // MSE: pumpVoice is a no-op if the clip is already started,
            //   but catches clips that were queued behind another.
            pumpVoice();
            break;
          }

          case 'voice.fallback': {
            const e = ev as Extract<VoiceEvent, { type: 'voice.fallback' }>;
            set({
              transcript: [
                ...st.transcript,
                { t: e.t, agentId: e.agentId, kind: 'FALLBACK', text: e.text },
              ],
            });
            break;
          }

          default:
            break;
        }
      };

      // ------------------------------------------------------------------
      // rAF tick — advances sphere physics at display frequency
      // ------------------------------------------------------------------
      let last = performance.now();
      const tick = (now: number): void => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const s = get();
        const phy4 = physics;
        if (s.field && phy4) {
          set({ field: phy4.tickCouncilField(s.field, dt) });
        }
        rafHandle = requestAnimationFrame(tick);
      };
      rafHandle = requestAnimationFrame(tick);

      // ------------------------------------------------------------------
      // Dev oracle: expose field + TTFA metrics on window.__synthiaField
      // ------------------------------------------------------------------
      if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        (window as unknown as Record<string, unknown>)['__synthiaField'] = () => {
          const s = useCouncilBus.getState();
          return { field: s.field, metrics: s.metrics };
        };
      }
    },
  };
});

// ---------------------------------------------------------------------------
// Voice queue helpers
// ---------------------------------------------------------------------------

function getOrCreateClip(agentId: SphereAgentId, contextId: string): QueuedClip {
  let clip = voiceQueue.find((c) => c.contextId === contextId);
  if (!clip) {
    clip = {
      agentId,
      contextId,
      firstChunkAt: 0,
      chunks: [],
      pendingBytes: [],
      appending: false,
      endOfStreamPending: false,
      audioEl: null,
      mediaSource: null,
      sourceBuffer: null,
      started: false,
      words: null,
      done: false,
    };
    voiceQueue.push(clip);
  }
  return clip;
}

function flushSourceBuffer(clip: QueuedClip): void {
  const sb = clip.sourceBuffer;
  if (!sb || clip.appending || clip.pendingBytes.length === 0) return;
  const bytes = clip.pendingBytes.shift()!;
  clip.appending = true;
  try {
    sb.appendBuffer(bytes);
  } catch {
    // appendBuffer failed (quota / updating) — put chunk back and mark clip failed
    // so playing resets and the next clip in the queue can start.
    clip.pendingBytes.unshift(bytes);
    clip.appending = false;
    // Dispatch error to the audio element to trigger the cleanup listener
    if (clip.audioEl) {
      try { clip.audioEl.dispatchEvent(new Event('error')); } catch { /* */ }
    } else {
      // audioEl not yet attached — reset playing directly so pumpVoice can advance
      const idx = voiceQueue.indexOf(clip);
      if (idx !== -1) voiceQueue.splice(idx, 1);
      playing = false;
      if (busSet) busSet({ speaking: null, rms: 0 });
      pumpVoice();
    }
  }
}

function maybeEndStream(clip: QueuedClip): void {
  const ms = clip.mediaSource;
  if (
    ms &&
    ms.readyState === 'open' &&
    clip.endOfStreamPending &&
    !clip.appending &&
    clip.pendingBytes.length === 0
  ) {
    try { ms.endOfStream(); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// Progressive playback via MediaSource (TTFA path)
// ---------------------------------------------------------------------------

function startProgressivePlay(clip: QueuedClip): void {
  if (!busSet || !busGet) return;
  const set = busSet;

  // Only construct AudioContext after a user gesture (audioUnlocked set by unlockAudio())
  if (!audioUnlocked) return;

  try {
    if (!audioCtx) audioCtx = new AudioContext();
  } catch {
    return; // AudioContext unavailable (e.g. strict autoplay context)
  }

  const ms = new MediaSource();
  const audioEl = document.createElement('audio');
  clip.mediaSource = ms;
  clip.audioEl = audioEl;
  clip.started = true;
  playing = true;
  currentAudioEl = audioEl;

  // Record TTFA on the first clip to begin playing across this meeting
  const firstAudioAt = Date.now();
  if (!firstAudioFired) {
    firstAudioFired = true;
    const metrics: BusMetrics = { ttfaMs: firstAudioAt - clip.firstChunkAt };
    if (meetingBeginAt !== null) {
      metrics.meetingToAudioMs = firstAudioAt - meetingBeginAt;
    }
    set({ metrics });
  }

  audioEl.src = URL.createObjectURL(ms);

  // Connect audio element to AudioContext for RMS metering before play()
  let analyser: AnalyserNode | null = null;
  let timeDomainData: Uint8Array | null = null;
  try {
    const srcNode = audioCtx.createMediaElementSource(audioEl);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    srcNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    timeDomainData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
  } catch {
    // createMediaElementSource can fail if the element is already attached elsewhere
  }

  ms.addEventListener(
    'sourceopen',
    () => {
      let sb: SourceBuffer;
      try {
        sb = ms.addSourceBuffer('audio/mpeg');
      } catch {
        // addSourceBuffer failed — revert and let fallback handle it after done
        playing = false;
        clip.started = false;
        currentAudioEl = null;
        try { URL.revokeObjectURL(audioEl.src); } catch { /* ignore */ }
        return;
      }
      clip.sourceBuffer = sb;

      sb.addEventListener('updateend', () => {
        clip.appending = false;
        if (clip.pendingBytes.length > 0) {
          flushSourceBuffer(clip);
        } else {
          maybeEndStream(clip);
        }
      });

      // Flush any bytes that arrived before sourceopen fired
      flushSourceBuffer(clip);
    },
    { once: true },
  );

  const currentClip = clip;

  getPhysics()
    .then((phy) => {
      if (!busSet || !busGet) return;
      const set2 = busSet;
      const get2 = busGet;

      set2({ speaking: currentClip.agentId });

      let meter: ReturnType<typeof setInterval> | null = null;

      if (analyser && timeDomainData) {
        const localAnalyser = analyser;
        const localData = timeDomainData;
        meter = setInterval(() => {
          if (!audioCtx) return;
          localAnalyser.getByteTimeDomainData(localData);
          let sum = 0;
          for (const v of localData) {
            const x = (v - 128) / 128;
            sum += x * x;
          }
          const rms = Math.min(1, Math.sqrt(sum / localData.length) * 3);
          const s = get2();
          if (!s.field) return;
          const elapsed = audioEl.currentTime;
          const w = currentClip.words;
          const inWord =
            !w || w.start.some((sT, i) => elapsed >= sT && elapsed <= w.end[i]);
          set2({ rms, field: phy.setSpeaking(s.field, currentClip.agentId, inWord, rms) });
        }, 16);
      }

      const cleanup = () => {
        if (meter !== null) clearInterval(meter);
        if (currentAudioEl === audioEl) currentAudioEl = null;
        const s = get2();
        if (s.field) {
          set2({ field: phy.setSpeaking(s.field, currentClip.agentId, false, 0) });
        }
        set2({ speaking: null, rms: 0 });
        const idx = voiceQueue.indexOf(currentClip);
        if (idx !== -1) voiceQueue.splice(idx, 1);
        try { URL.revokeObjectURL(audioEl.src); } catch { /* ignore */ }
        playing = false;
        pumpVoice();
      };

      audioEl.addEventListener('ended', cleanup, { once: true });
      audioEl.addEventListener('error', cleanup, { once: true });

      // Attempt playback — may be blocked by autoplay policy
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx
          .resume()
          .then(() => audioEl.play())
          .catch(() => { /* unlockAudio() will retry */ });
      } else {
        audioEl.play().catch(() => { /* unlockAudio() will retry via currentAudioEl */ });
      }
    })
    .catch(() => {
      playing = false;
      clip.started = false;
      if (currentAudioEl === audioEl) currentAudioEl = null;
    });
}

// ---------------------------------------------------------------------------
// Fallback playback: decode full audio after voice.done (Safari iOS etc.)
// ---------------------------------------------------------------------------

async function playClipFallback(clip: QueuedClip): Promise<void> {
  if (!busSet || !busGet) return;
  const set = busSet;
  const get = busGet;

  // Only construct AudioContext after a user gesture
  if (!audioUnlocked) {
    const idx = voiceQueue.indexOf(clip);
    if (idx !== -1) voiceQueue.splice(idx, 1);
    playing = false;
    return;
  }

  playing = true;

  try {
    if (!audioCtx) audioCtx = new AudioContext();

    const bytes = Uint8Array.from(
      atob(clip.chunks.join('')),
      (ch) => ch.charCodeAt(0),
    );
    const audioBuf = await audioCtx.decodeAudioData(bytes.buffer.slice(0));

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuf;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(audioCtx.destination);

    const timeDomainData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    const t0 = audioCtx.currentTime;
    const phy = await getPhysics();
    const currentClip = clip;

    set({ speaking: currentClip.agentId });

    const meter = setInterval(() => {
      if (!audioCtx) return;
      analyser.getByteTimeDomainData(timeDomainData);
      let sum = 0;
      for (const v of timeDomainData) {
        const x = (v - 128) / 128;
        sum += x * x;
      }
      const rms = Math.min(1, Math.sqrt(sum / timeDomainData.length) * 3);
      const s = get();
      if (!s.field) return;
      const elapsed = audioCtx.currentTime - t0;
      const w = currentClip.words;
      const inWord =
        !w || w.start.some((sT, i) => elapsed >= sT && elapsed <= w.end[i]);
      set({ rms, field: phy.setSpeaking(s.field, currentClip.agentId, inWord, rms) });
    }, 16);

    src.onended = () => {
      clearInterval(meter);
      const s = get();
      if (s.field) {
        set({ field: phy.setSpeaking(s.field, currentClip.agentId, false, 0) });
      }
      set({ speaking: null, rms: 0 });
      const idx = voiceQueue.indexOf(currentClip);
      if (idx !== -1) voiceQueue.splice(idx, 1);
      playing = false;
      pumpVoice();
    };

    src.start();
  } catch {
    // Decode or playback failed — drop clip and try next
    const idx = voiceQueue.indexOf(clip);
    if (idx !== -1) voiceQueue.splice(idx, 1);
    playing = false;
    pumpVoice();
  }
}

// ---------------------------------------------------------------------------
// Queue pump — one speaker at a time
// ---------------------------------------------------------------------------

function pumpVoice(): void {
  if (playing || voiceQueue.length === 0) return;
  const clip = voiceQueue[0];

  if (mseSupported()) {
    // Progressive path: start as soon as first chunk arrived (firstChunkAt > 0)
    if (!clip.started && clip.firstChunkAt > 0) {
      startProgressivePlay(clip);
    }
    // If clip.started is true, playback is in progress — nothing to do
  } else {
    // Fallback path: play only once all chunks are received
    if (clip.done) {
      playClipFallback(clip);
    }
  }
}

// ---------------------------------------------------------------------------
// SSE event handlers (called from es.onmessage)
// ---------------------------------------------------------------------------

function enqueueChunk(ev: Extract<VoiceEvent, { type: 'voice.chunk' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  const isFirst = clip.chunks.length === 0;
  if (isFirst) clip.firstChunkAt = Date.now();

  clip.chunks.push(ev.data);

  if (mseSupported()) {
    const bytes = b64ToUint8(ev.data);
    clip.pendingBytes.push(bytes);

    if (clip.sourceBuffer) {
      // SourceBuffer already attached — append directly
      flushSourceBuffer(clip);
    } else if (!clip.started && !playing && voiceQueue[0] === clip) {
      // Clip is first in queue and no audio is playing — start progressive play
      startProgressivePlay(clip);
    }
    // Else: clip is behind another; bytes accumulate and will be flushed
    // by startProgressivePlay → sourceopen when this clip's turn comes.
  }
  // Non-MSE: chunks accumulate; playClipFallback joins them after done
}

function enqueueWords(ev: Extract<VoiceEvent, { type: 'voice.words' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  clip.words = { words: ev.words, start: ev.start, end: ev.end };
}

function enqueueDone(ev: Extract<VoiceEvent, { type: 'voice.done' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  clip.done = true;

  if (mseSupported()) {
    clip.endOfStreamPending = true;
    // If sourceBuffer is idle and all pending bytes are flushed, end the stream now
    maybeEndStream(clip);
    // If sourceBuffer is still appending, maybeEndStream will be called from updateend
    // If sourceBuffer hasn't been created yet (sourceopen is pending), it will be
    // called after the last updateend in the sourceopen handler's chain
  }
  // Fallback path: pumpVoice() is called from onmessage after enqueueDone()
}
