'use client';

/**
 * bus.ts — CouncilBus: single source of truth for live meeting state.
 *
 * One zustand store owns SSE consumption, voice queue playback, sphere-physics
 * ticks (rAF), and RMS analysis. Renderers (SphereField, Theater3D, HUD) read
 * this store and become dumb views of CouncilField.
 *
 * Bug W1 fix: matches on event.type (the actual wire format) not event.kind.
 *
 * SSR safety: no window/AudioContext/EventSource access at module scope.
 * All browser APIs are accessed inside action closures or lazy initialisers.
 */

import { create } from 'zustand';
import type { CouncilField, } from '@/lib/sphere-physics';
import type {
  CouncilEvent,
  SphereAgentId,
  VoiceEvent,
  AnyCouncilEvent,
  VoiceLang,
} from '@/shared/council-events';

type Connection = 'idle' | 'live' | 'replay' | 'error';

// ---------------------------------------------------------------------------
// Voice queue types (internal)
// ---------------------------------------------------------------------------

interface QueuedClip {
  agentId: SphereAgentId;
  contextId: string;
  chunks: string[];            // base-64 audio fragments
  words: { words: string[]; start: number[]; end: number[] } | null;
  done: boolean;
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
  rms: number;  // 0..1 from Web Audio analyser of the playing clip

  // Actions
  connect: (meetingId: string) => void;
  disconnect: () => void;
  setLang: (l: VoiceLang) => void;
}

// ---------------------------------------------------------------------------
// Module-level mutable state (not in store — avoids React re-renders)
// ---------------------------------------------------------------------------

const voiceQueue: QueuedClip[] = [];
let es: EventSource | null = null;
let rafHandle = 0;
let audioCtx: AudioContext | null = null;
let playing = false;

// Lazily resolved physics module (avoids SSR import issues)
type PhysicsMod = typeof import('@/lib/sphere-physics');
let physics: PhysicsMod | null = null;
async function getPhysics(): Promise<PhysicsMod> {
  if (!physics) physics = await import('@/lib/sphere-physics');
  return physics;
}

// ---------------------------------------------------------------------------
// Store definition
// ---------------------------------------------------------------------------

export const useCouncilBus = create<BusState>((set, get) => ({
  meetingId: null,
  connection: 'idle',
  lang: 'es',
  field: null,
  transcript: [],
  approvalPending: null,
  speaking: null,
  rms: 0,

  setLang: (lang) => {
    set({ lang });
    // Best-effort persist — fire and forget, no await
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
    voiceQueue.length = 0;
    playing = false;
    set({ connection: 'idle', speaking: null, rms: 0 });
  },

  connect: async (meetingId) => {
    // Tear down any existing connection first
    get().disconnect();

    const phy = await getPhysics();
    const field = phy.createCouncilField(meetingId);
    set({ meetingId, field, connection: 'live', transcript: [], approvalPending: null });

    // ------------------------------------------------------------------
    // SSE subscription — match on event.type (W1 fix)
    // ------------------------------------------------------------------
    es = new EventSource(`/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`);

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
          const phy2 = physics; // already loaded; avoid async here
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

        case 'meeting.begin':
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
          pumpVoice(set, get);
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

        // Any future event type we don't know about: silently ignore
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
    // Dev oracle — expose field for Playwright / evidence oracles
    // ------------------------------------------------------------------
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>)['__synthiaField'] = () =>
        useCouncilBus.getState().field;
    }
  },
}));

// ---------------------------------------------------------------------------
// Voice queue helpers
// ---------------------------------------------------------------------------

function getOrCreateClip(agentId: SphereAgentId, contextId: string): QueuedClip {
  let clip = voiceQueue.find((c) => c.contextId === contextId);
  if (!clip) {
    clip = { agentId, contextId, chunks: [], words: null, done: false };
    voiceQueue.push(clip);
  }
  return clip;
}

function enqueueChunk(ev: Extract<VoiceEvent, { type: 'voice.chunk' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  clip.chunks.push(ev.data);
}

function enqueueWords(ev: Extract<VoiceEvent, { type: 'voice.words' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  clip.words = { words: ev.words, start: ev.start, end: ev.end };
}

function enqueueDone(ev: Extract<VoiceEvent, { type: 'voice.done' }>): void {
  const clip = getOrCreateClip(ev.agentId, ev.contextId);
  clip.done = true;
}

// ---------------------------------------------------------------------------
// Voice playback pump — one speaker at a time
// ---------------------------------------------------------------------------

type SetFn = (partial: Partial<BusState>) => void;
type GetFn = () => BusState;

async function pumpVoice(set: SetFn, get: GetFn): Promise<void> {
  if (playing) return;
  const clip = voiceQueue.find((c) => c.done);
  if (!clip) return;
  playing = true;

  try {
    // Lazy AudioContext — only created in browser
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

    const timeDomainData = new Uint8Array(analyser.frequencyBinCount);
    const t0 = audioCtx.currentTime;

    set({ speaking: clip.agentId });

    const phy = await getPhysics();
    // Capture clip reference for closure
    const currentClip = clip;

    const meter = setInterval(() => {
      if (!audioCtx) return;
      analyser.getByteTimeDomainData(timeDomainData);

      // Compute RMS
      let sum = 0;
      for (const v of timeDomainData) {
        const x = (v - 128) / 128;
        sum += x * x;
      }
      const rms = Math.min(1, Math.sqrt(sum / timeDomainData.length) * 3);

      const st = get();
      if (!st.field) return;

      const elapsed = audioCtx.currentTime - t0;
      const w = currentClip.words;
      const inWord =
        !w || w.start.some((s, i) => elapsed >= s && elapsed <= w.end[i]);

      set({ rms, field: phy.setSpeaking(st.field, currentClip.agentId, inWord, rms) });
    }, 16); // ~60 Hz

    src.onended = () => {
      clearInterval(meter);
      const st = get();
      if (st.field) {
        set({ field: phy.setSpeaking(st.field, currentClip.agentId, false, 0) });
      }
      set({ speaking: null, rms: 0 });
      const idx = voiceQueue.indexOf(currentClip);
      if (idx !== -1) voiceQueue.splice(idx, 1);
      playing = false;
      pumpVoice(set, get);
    };

    src.start();
  } catch {
    // Audio decode / playback failed — drop this clip and try the next
    const idx = voiceQueue.indexOf(clip);
    if (idx !== -1) voiceQueue.splice(idx, 1);
    playing = false;
    pumpVoice(set, get);
  }
}
