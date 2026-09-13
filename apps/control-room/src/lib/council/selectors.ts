'use client';

/**
 * selectors.ts — Typed convenience hooks over useCouncilBus.
 *
 * Each hook subscribes to exactly the slice it needs so components only
 * re-render when their specific data changes.  Renderers should import
 * from here, not from bus.ts directly, to decouple the store shape from
 * the view layer.
 */

import { useCouncilBus } from './bus';
import type { CouncilField } from '@/lib/sphere-physics';
import type { SphereAgentId, VoiceLang } from '@/shared/council-events';
import type { SphereState } from '@/shared/sphere-state';

// ---------------------------------------------------------------------------
// useSphere(id) — subscribe to one sphere's physics state
// ---------------------------------------------------------------------------

/**
 * Returns the live SphereState for `id`, or `null` when no meeting is active.
 * Re-renders only when this sphere's data changes.
 */
export function useSphere(id: SphereAgentId): SphereState | null {
  return useCouncilBus((s) => s.field?.spheres.get(id) ?? null);
}

// ---------------------------------------------------------------------------
// useField() — full CouncilField snapshot
// ---------------------------------------------------------------------------

/**
 * Returns the entire CouncilField (group coherence, entropy, meeting health,
 * interference map, etc.).  Use this in renderers that need group-level data.
 * Prefer `useSphere` for per-sphere subscriptions to avoid unnecessary renders.
 */
export function useField(): CouncilField | null {
  return useCouncilBus((s) => s.field);
}

// ---------------------------------------------------------------------------
// useSpeaker() — currently playing sphere + RMS level
// ---------------------------------------------------------------------------

interface SpeakerState {
  /** agentId of the sphere whose audio is currently playing, or null */
  speaking: SphereAgentId | null;
  /** RMS amplitude 0..1 from Web Audio analyser (updates ~60 Hz) */
  rms: number;
}

/**
 * Returns speaking identity and real-time RMS. Drives the mouth-pulse and
 * bloom boost visuals without the caller needing to know about Web Audio.
 * Uses two primitive selectors to avoid creating a new object on every tick.
 */
export function useSpeaker(): SpeakerState {
  const speaking = useCouncilBus((s) => s.speaking);
  const rms = useCouncilBus((s) => s.rms);
  return { speaking, rms };
}

// ---------------------------------------------------------------------------
// useCouncilLang() — UI / voice language preference
// ---------------------------------------------------------------------------

/**
 * Returns the current VoiceLang ('es' | 'en') and a setter that persists
 * the preference via PATCH /api/synthia/memory.
 */
export function useCouncilLang(): [VoiceLang, (l: VoiceLang) => void] {
  const lang = useCouncilBus((s) => s.lang);
  const setLang = useCouncilBus((s) => s.setLang);
  return [lang, setLang];
}
