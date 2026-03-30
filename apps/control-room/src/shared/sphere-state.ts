/**
 * SphereState — Meadows system dynamics model for Sphere OS agents.
 * Each sphere is a bounded luminous field with stocks that evolve over time.
 * Stocks: frequency_hz, phase, energy, coherence
 * Color is derived from frequency (not a symbolic palette).
 */

import type { SphereAgentId, SphereLocale } from './council-events';

// ---------------------------------------------------------------------------
// Core physics model
// ---------------------------------------------------------------------------

export interface SphereState {
  agentId: SphereAgentId;
  frequency_hz: number; // stock [0.1..1.0] → mapped to hue
  phase: number;         // oscillator phase [0..2π] for sync visuals
  energy: number;        // [0..1] brightness budget — drains on speech, recovers at rest
  coherence: number;     // [0..1] alignment with the meeting group
  color_rgb: string;     // derived: f(frequency_hz, energy) — hex #rrggbb
  heartActive: boolean;  // true on ALIGN signal events
  lastSignalAt: number;  // epoch ms
  speakingNow: boolean;
}

// ---------------------------------------------------------------------------
// Default sphere frequencies (physics ground state)
// Each frequency maps to a unique hue in the visible spectrum of the UI
// ---------------------------------------------------------------------------

export const SPHERE_FREQUENCY_MAP: Record<SphereAgentId, {
  frequency_hz: number;
  baseColor: string;    // La Maestra color signature
  emissiveColor: string;
  displayName: string;
  role: string;
  locale: SphereLocale;
}> = {
  'synthia': {
    frequency_hz: 0.85,
    baseColor:    '#8b5cf6', // violet/indigo — orchestrator
    emissiveColor:'#4c1d95',
    displayName:  'SYNTHIA™',
    role:         'Chief of Staff — Coordinadora General',
    locale:       'es-MX',
  },
  'alex': {
    frequency_hz: 0.80,
    baseColor:    '#d4af37', // gold — advisor prime
    emissiveColor:'#8b6914',
    displayName:  'ALEX™',
    role:         'Estratega Ejecutivo — Chief Advisor',
    locale:       'es-MX',
  },
  'cazadora': {
    frequency_hz: 0.95,
    baseColor:    '#ef4444', // red — high energy hunter
    emissiveColor:'#7f1d1d',
    displayName:  'CAZADORA™',
    role:         'Cazadora de Oportunidades — Prospect Hunter',
    locale:       'es-CO',
  },
  'forjadora': {
    frequency_hz: 0.45,
    baseColor:    '#22c55e', // green — builder
    emissiveColor:'#14532d',
    displayName:  'FORJADORA™',
    role:         'Arquitecta de Sistemas — Systems Builder',
    locale:       'es-AR',
  },
  'seductora': {
    frequency_hz: 0.65,
    baseColor:    '#eab308', // gold/yellow — closer
    emissiveColor:'#713f12',
    displayName:  'SEDUCTORA™',
    role:         'Closera Maestra — Sales & Persuasion',
    locale:       'es-CU',
  },
  'consejo': {
    frequency_hz: 0.25,
    baseColor:    '#1d4ed8', // deep blue — facilitator
    emissiveColor:'#1e1b4b',
    displayName:  'CONSEJO™',
    role:         'Consejero Mayor — Council Facilitator',
    locale:       'es-CL',
  },
  'dr-economia': {
    frequency_hz: 0.75,
    baseColor:    '#f97316', // orange — arbitrage
    emissiveColor:'#7c2d12',
    displayName:  'DR. ECONOMÍA',
    role:         'Analista Financiero — Arbitrage & Finance',
    locale:       'es-VE',
  },
  'dra-cultura': {
    frequency_hz: 0.55,
    baseColor:    '#f43f5e', // rose — content
    emissiveColor:'#881337',
    displayName:  'DRA. CULTURA',
    role:         'Estratega Cultural — Content & CDMX Community',
    locale:       'es-PE',
  },
  'ing-teknos': {
    frequency_hz: 0.35,
    baseColor:    '#06b6d4', // cyan — systems
    emissiveColor:'#164e63',
    displayName:  'ING. TEKNOS',
    role:         'Ingeniero de Sistemas — Tech Architecture',
    locale:       'es-PR',
  },
  'la-vigilante': {
    frequency_hz: 0.00,
    baseColor:    '#64748b', // slate — guardian
    emissiveColor:'#1e293b',
    displayName:  'LA VIGILANTE™',
    role:         'Guardian del Consejo — Lightning Agent',
    locale:       'es-MX',
  },
};

// ---------------------------------------------------------------------------
// Derived color computation
// frequency_hz [0.1..1.0] maps to hue [240..0] (blue to red spectrum)
// energy [0..1] modulates lightness
// ---------------------------------------------------------------------------

export function frequencyToColor(frequency_hz: number, energy: number = 1): string {
  // Map frequency to hue: low freq → blue (200°), high freq → violet (270°)
  // Using a custom warm palette: 0.1 → 210°, 1.0 → 300°
  const hue = 210 + frequency_hz * 90;
  const saturation = 70 + energy * 30;
  const lightness = 35 + energy * 25;
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

export function createInitialSphereState(agentId: SphereAgentId): SphereState {
  const config = SPHERE_FREQUENCY_MAP[agentId];
  return {
    agentId,
    frequency_hz: config.frequency_hz,
    phase: Math.random() * Math.PI * 2,
    energy: 0.7,
    coherence: 0.5,
    color_rgb: config.baseColor,
    heartActive: false,
    lastSignalAt: 0,
    speakingNow: false,
  };
}

// ---------------------------------------------------------------------------
// Physics update — called each animation frame (dt seconds)
// ---------------------------------------------------------------------------

export function tickSphereState(state: SphereState, dt: number): SphereState {
  const now = Date.now();
  const silentMs = now - state.lastSignalAt;

  // Energy recovery: 0.1 per second at rest
  const energyDelta = state.speakingNow ? -0.3 * dt : 0.1 * dt;
  const energy = Math.max(0.1, Math.min(1.0, state.energy + energyDelta));

  // Phase advances at frequency_hz × 2π per second
  const phase = (state.phase + state.frequency_hz * Math.PI * 2 * dt) % (Math.PI * 2);

  // Coherence decays slowly if not in a meeting (20% per minute)
  const coherence = state.speakingNow
    ? Math.min(1.0, state.coherence + 0.05 * dt)
    : Math.max(0.0, state.coherence - 0.003 * dt);

  // Heart deactivates 2s after last ALIGN
  const heartActive = state.heartActive && silentMs < 2000;

  return {
    ...state,
    energy,
    phase,
    coherence,
    heartActive,
    color_rgb: frequencyToColor(state.frequency_hz, energy),
  };
}

// ---------------------------------------------------------------------------
// ALIGN entrainment — target sphere frequency drifts toward speaker
// ---------------------------------------------------------------------------

export function applyAlignEntrainment(
  target: SphereState,
  speakerFrequency: number,
  strength = 0.15
): SphereState {
  const newFreq = target.frequency_hz + (speakerFrequency - target.frequency_hz) * strength;
  return {
    ...target,
    frequency_hz: Math.max(0.1, Math.min(1.0, newFreq)),
    heartActive: true,
    coherence: Math.min(1.0, target.coherence + 0.2),
  };
}

/** All 9 sphere IDs in council ring order */
export const ALL_SPHERE_IDS: SphereAgentId[] = [
  'synthia', 'alex', 'cazadora', 'forjadora', 'seductora',
  'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos',
];
