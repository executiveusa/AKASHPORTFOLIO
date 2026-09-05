/**
 * Typed CouncilEvent protocol — Synthia™ Sphere OS
 * All events emitted during sphere council meetings.
 * Source of truth for Theater3D pulse visuals + orchestrator routing.
 */

// Signal kinds map to La Maestra communication archetypes
export type SignalKind = 'ASSERT' | 'INQUIRE' | 'ALIGN' | 'REFLECT';

export type CouncilEvent =
  | {
      t: number; // epoch ms
      type: 'meeting.begin';
      meetingId: string;
      title: string;
      goal: string;
      location?: string;
    }
  | {
      t: number;
      type: 'node.spawn';
      meetingId: string;
      agentId: SphereAgentId;
      displayName: string;
      color: string; // hex #rrggbb
      seatId?: number; // 0-8 position in ring
    }
  | {
      t: number;
      type: 'sphere.signal';
      meetingId: string;
      agentId: SphereAgentId;
      kind: SignalKind;
      amplitude: number; // 0..1
      durationMs: number;
      carrierHz: number; // 0.1..1.0 frequency of the speaker
      targetIds?: SphereAgentId[]; // for ALIGN, spheres being entrained
      transcript?: string; // spoken text if available
    }
  | {
      t: number;
      type: 'agent_contribute';
      agentId: SphereAgentId;
      timestamp: number;
      data?: Record<string, unknown>;
    }
  | {
      t: number;
      type: 'meeting.focus';
      meetingId: string;
      speakerId: SphereAgentId;
      intensity: number; // 0..1 — spotlight brightness
    }
  | {
      t: number;
      type: 'meeting.closing';
      meetingId: string;
      coherence: number; // 0..1 — how aligned the group is
    }
  | {
      t: number;
      type: 'meeting.end';
      meetingId: string;
      artifactRef: string; // URL to StoryToolkit summary
      decisions: string[];
    };

/** Speech event emitted per avatar utterance */
export interface AvatarSpeechEvent {
  agentId: SphereAgentId;
  text: string;
  audioBase64?: string;
  visemes?: VisemeFrame[];
  durationMs: number;
  locale: SphereLocale;
}

/** Oculus 15-viseme set (Ready Player Me compatible) */
export interface VisemeFrame {
  time: number; // ms from start
  viseme: OculusViseme;
  weight: number; // 0..1
}

export type OculusViseme =
  | 'viseme_PP' | 'viseme_FF' | 'viseme_TH' | 'viseme_DD'
  | 'viseme_kk' | 'viseme_CH' | 'viseme_SS' | 'viseme_nn'
  | 'viseme_RR' | 'viseme_aa' | 'viseme_E' | 'viseme_I'
  | 'viseme_O' | 'viseme_U' | 'viseme_sil';

/** All sphere agent IDs */
export type SphereAgentId =
  | 'synthia'
  | 'alex'
  | 'cazadora'
  | 'forjadora'
  | 'seductora'
  | 'consejo'
  | 'dr-economia'
  | 'dra-cultura'
  | 'ing-teknos'
  | 'la-vigilante';

/** LATAM Spanish locale tags */
export type SphereLocale =
  | 'es-MX' // Mexico City
  | 'es-CO' // Colombia
  | 'es-AR' // Argentina
  | 'es-CU' // Cuba
  | 'es-CL' // Chile
  | 'es-VE' // Venezuela
  | 'es-PE' // Peru
  | 'es-PR'; // Puerto Rico

/**
 * Visual behavior per signal kind — drives Theater3D animations.
 * ASSERT  → sharp rings, forward filament, heart dim
 * INQUIRE → soft shimmer halo, high bandwidth, heart dim
 * ALIGN   → phase-lock, neighboring sphere color drifts, heart brightens
 * REFLECT → aurora-sheet drift around speaker, others dim, heart dim
 */
export const SIGNAL_VISUAL_MAP: Record<SignalKind, {
  ringSharp: boolean;
  glowRadius: number;
  heartBrightens: boolean;
  neighborEntrainment: boolean;
  auroraDrift: boolean;
}> = {
  ASSERT:  { ringSharp: true,  glowRadius: 0.6, heartBrightens: false, neighborEntrainment: false, auroraDrift: false },
  INQUIRE: { ringSharp: false, glowRadius: 1.2, heartBrightens: false, neighborEntrainment: false, auroraDrift: false },
  ALIGN:   { ringSharp: false, glowRadius: 0.8, heartBrightens: true,  neighborEntrainment: true,  auroraDrift: false },
  REFLECT: { ringSharp: false, glowRadius: 0.4, heartBrightens: false, neighborEntrainment: false, auroraDrift: true  },
};

/** Runtime validation — ensures event has required fields */
export function isValidCouncilEvent(e: unknown): e is CouncilEvent {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return typeof ev.t === 'number' && typeof ev.type === 'string' && typeof ev.meetingId === 'string';
}

// ---------------------------------------------------------------------------
// Voice & approval events — added in RUN-001 N3 for CouncilBus integration
// ---------------------------------------------------------------------------

/** UI language for voice synthesis and display */
export type VoiceLang = 'es' | 'en';

export type VoiceEvent =
  | {
      t: number;
      type: 'voice.chunk';
      meetingId: string;
      agentId: SphereAgentId;
      /** Client-side correlation key grouping chunks for one utterance */
      contextId: string;
      /** Base-64 encoded audio fragment */
      data: string;
    }
  | {
      t: number;
      type: 'voice.words';
      meetingId: string;
      agentId: SphereAgentId;
      contextId: string;
      words: string[];
      /** Start times in seconds (relative to utterance start) */
      start: number[];
      /** End times in seconds (relative to utterance start) */
      end: number[];
    }
  | {
      t: number;
      type: 'voice.done';
      meetingId: string;
      agentId: SphereAgentId;
      contextId: string;
    }
  | {
      t: number;
      type: 'voice.fallback';
      meetingId: string;
      agentId: SphereAgentId;
      /** Plain-text fallback when audio synthesis fails */
      text: string;
      /** Why audio was not produced (e.g. 'voice_budget', 'RIME_API_TOKEN missing', 'ws timeout') */
      reason?: string;
    }
  | {
      t: number;
      type: 'approval.required';
      meetingId: string;
      /** Unique request ID — used by the approval badge */
      id: string;
      reason: string;
      /** La Vigilante emits this when a gate fires; optional for other agents */
      agentId?: SphereAgentId;
    };

/**
 * Expanded union: all events that can arrive on the orchestrator SSE stream.
 * Consumers should match on `event.type`; unknown type strings must be
 * ignored gracefully (future-proofing).
 */
export type AnyCouncilEvent = CouncilEvent | VoiceEvent;
