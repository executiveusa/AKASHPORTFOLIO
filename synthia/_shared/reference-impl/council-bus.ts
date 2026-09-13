/**
 * council-bus.ts — REFERENCE IMPLEMENTATION (copy into apps/control-room/src/lib/council/bus.ts during RUN-001 N3)
 *
 * One boss for live meeting state on the client. Consumes orchestrator SSE (matching on event.type — fixes W1),
 * consumes voice.* events, runs sphere-physics each frame, exposes a CouncilField to any renderer.
 * Renderers (SphereField, Theater3D, HUD, fleet cards) become dumb views.
 *
 * Deps: zustand (add), existing @/lib/sphere-physics, @/shared/sphere-state, @/shared/council-events.
 */
'use client';

import { create } from 'zustand';
import type { CouncilEvent, SphereAgentId } from '@/shared/council-events';
import type { CouncilField } from '@/lib/sphere-physics';

type VoiceLang = 'es' | 'en';
type Connection = 'idle' | 'live' | 'replay' | 'error';

interface QueuedClip { agentId: SphereAgentId; contextId: string; chunks: string[]; words?: { words: string[]; start: number[]; end: number[] }; done: boolean }

interface BusState {
  meetingId: string | null;
  connection: Connection;
  lang: VoiceLang;
  field: CouncilField | null;
  transcript: Array<{ t: number; agentId: SphereAgentId; kind: string; text?: string }>;
  approvalPending: { id: string; reason: string } | null;
  speaking: SphereAgentId | null;
  rms: number;                 // 0..1 from Web Audio analyser of the playing clip
  connect: (meetingId: string) => void;
  disconnect: () => void;
  setLang: (l: VoiceLang) => void;
}

const queue: QueuedClip[] = [];
let es: EventSource | null = null;
let raf = 0;
let audioCtx: AudioContext | null = null;
let physics: typeof import('@/lib/sphere-physics') | null = null;

export const useCouncilBus = create<BusState>((set, get) => ({
  meetingId: null, connection: 'idle', lang: 'es', field: null, transcript: [], approvalPending: null, speaking: null, rms: 0,

  setLang: (lang) => { set({ lang }); fetch('/api/synthia/memory', { method: 'PATCH', body: JSON.stringify({ voice_lang: lang }) }).catch(() => {}); },

  disconnect: () => { es?.close(); es = null; cancelAnimationFrame(raf); queue.length = 0; set({ connection: 'idle', speaking: null, rms: 0 }); },

  connect: async (meetingId) => {
    get().disconnect();
    physics ??= await import('@/lib/sphere-physics');
    const field = physics.createCouncilField(meetingId);
    set({ meetingId, field, connection: 'live', transcript: [] });

    es = new EventSource(`/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`);
    es.onerror = () => set({ connection: 'error' });
    es.onmessage = (m) => {
      let ev: (CouncilEvent | { type: string; [k: string]: unknown });
      try { ev = JSON.parse(m.data); } catch { return; }
      const st = get(); if (!st.field || !physics) return;

      switch (ev.type) {
        case 'sphere.signal': {
          const e = ev as Extract<CouncilEvent, { type: 'sphere.signal' }>;
          set({ field: physics.applyEventToField(st.field, e), transcript: [...st.transcript, { t: e.t, agentId: e.agentId, kind: e.kind, text: e.transcript }] });
          break;
        }
        case 'meeting.focus': case 'meeting.closing': case 'node.spawn': case 'meeting.begin': case 'meeting.end':
          set({ field: physics.applyEventToField(st.field, ev as CouncilEvent) });
          if (ev.type === 'meeting.end') setTimeout(() => get().disconnect(), 4000);
          break;
        case 'approval.required':
          set({ approvalPending: { id: String(ev.id), reason: String(ev.reason) } });
          break;
        case 'voice.chunk': enqueue(ev as never, 'chunk'); break;
        case 'voice.words': enqueue(ev as never, 'words'); break;
        case 'voice.done': enqueue(ev as never, 'done'); pump(set, get); break;
        case 'voice.fallback': set({ transcript: [...st.transcript, { t: Date.now(), agentId: ev.agentId as SphereAgentId, kind: 'FALLBACK', text: String(ev.text) }] }); break;
      }
    };

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = get();
      if (s.field && physics) set({ field: physics.tickCouncilField(s.field, dt) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  },
}));

function enqueue(ev: { agentId: SphereAgentId; contextId: string; data?: string; words?: string[]; start?: number[]; end?: number[] }, kind: 'chunk' | 'words' | 'done') {
  let clip = queue.find((c) => c.contextId === ev.contextId);
  if (!clip) { clip = { agentId: ev.agentId, contextId: ev.contextId, chunks: [], done: false }; queue.push(clip); }
  if (kind === 'chunk' && ev.data) clip.chunks.push(ev.data);
  if (kind === 'words' && ev.words) clip.words = { words: ev.words, start: ev.start ?? [], end: ev.end ?? [] };
  if (kind === 'done') clip.done = true;
}

let playing = false;
async function pump(set: (p: Partial<BusState>) => void, get: () => BusState) {
  if (playing) return;
  const clip = queue.find((c) => c.done); if (!clip) return;
  playing = true;
  try {
    audioCtx ??= new AudioContext();
    const bytes = Uint8Array.from(atob(clip.chunks.join('')), (c) => c.charCodeAt(0));
    const buf = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
    const src = audioCtx.createBufferSource(); src.buffer = buf;
    const analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
    src.connect(analyser); analyser.connect(audioCtx.destination);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const t0 = audioCtx.currentTime;
    set({ speaking: clip.agentId });
    const meter = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0; for (const v of data) { const x = (v - 128) / 128; sum += x * x; }
      const rms = Math.min(1, Math.sqrt(sum / data.length) * 3);
      const st = get(); if (!st.field || !physics) return;
      const elapsed = audioCtx!.currentTime - t0;
      const w = clip.words; const inWord = !w || w.start.some((s, i) => elapsed >= s && elapsed <= w.end[i]);
      set({ rms, field: physics.setSpeaking(st.field, clip.agentId, inWord, rms) });
    }, 16);
    src.onended = () => { clearInterval(meter); const st = get(); if (st.field && physics) set({ field: physics.setSpeaking(st.field, clip.agentId, false, 0) }); set({ speaking: null, rms: 0 }); queue.splice(queue.indexOf(clip), 1); playing = false; pump(set, get); };
    src.start();
  } catch { playing = false; queue.splice(queue.indexOf(clip), 1); pump(set, get); }
}

/* sphere-physics.ts additions required by this bus (RUN-001 N3):
 *   export function setSpeaking(field, agentId, speaking: boolean, rms: number): CouncilField
 *   export function applyEventToField(field, ev: CouncilEvent): CouncilField   // exists in useVapiSphereSync path — make it public
 * Renderer contract: read useCouncilBus((s) => s.field) and map per _shared/design/council-bus-and-graphics.md.
 * Dev oracle: if (process.env.NODE_ENV !== 'production') (window as any).__synthiaField = () => useCouncilBus.getState().field;
 */
