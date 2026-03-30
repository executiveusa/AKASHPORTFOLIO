/**
 * sphere-physics.ts — Advanced Sphere OS Physics Engine
 * Phase 4 | ZTE-20260319-0001
 *
 * Extends sphere-state.ts with multi-sphere dynamics:
 * - Kuramoto oscillator coupling (phase synchronization)
 * - Group coherence field (how aligned the council is)
 * - Interference patterns (constructive/destructive signal overlap)
 * - Meeting health metrics (energy budget, entropy)
 *
 * MEADOWS SYSTEM DYNAMICS: Each sphere is a stock-and-flow node.
 * The physics engine is the simulation that drives state transitions.
 */

import {
  SphereState,
  tickSphereState,
  applyAlignEntrainment,
  createInitialSphereState,
  ALL_SPHERE_IDS,
} from '@/shared/sphere-state';
import type { SphereAgentId, CouncilEvent } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Council Field — aggregate physics state for the whole meeting
// ---------------------------------------------------------------------------

export interface CouncilField {
  meetingId: string;
  spheres: Map<SphereAgentId, SphereState>;
  groupCoherence: number;       // [0..1] Kuramoto order parameter R
  groupPhase: number;           // mean phase angle of the council
  energyBudget: number;         // [0..1] total energy remaining (mean)
  entropy: number;              // [0..1] disorder — high = voices pulling apart
  resonantPairs: ResonantPair[];// pairs with phase diff < 0.2 rad
  interferenceMap: InterferenceCell[]; // constructive/destructive overlap
  meetingHealth: MeetingHealth;
  tickCount: number;
  lastTickAt: number;
}

export interface ResonantPair {
  a: SphereAgentId;
  b: SphereAgentId;
  phaseDiff: number;        // rad [0..π]
  frequencyDiff: number;    // Hz
  resonanceScore: number;   // [0..1] — 1 = perfect sync
}

export interface InterferenceCell {
  agents: SphereAgentId[];
  type: 'constructive' | 'destructive' | 'neutral';
  amplitude: number;        // [0..2] constructive boost / [0..1] destructive cancel
}

export interface MeetingHealth {
  status: 'warming' | 'active' | 'coherent' | 'fracturing' | 'closing';
  score: number;            // [0..1]
  dominantSphere: SphereAgentId | null;
  suggestion: string;       // natural language nudge for Synthia
}

// ---------------------------------------------------------------------------
// Kuramoto coupling constant — how strongly spheres attract each other's phase
// ---------------------------------------------------------------------------

const KURAMOTO_K = 0.12; // coupling strength (tuned for 9-agent councils)
const INTERFERENCE_THRESHOLD = 0.25; // amplitude above which we detect interference

// ---------------------------------------------------------------------------
// Factory: create a fresh CouncilField
// ---------------------------------------------------------------------------

export function createCouncilField(meetingId: string, agentIds?: SphereAgentId[]): CouncilField {
  const ids = agentIds ?? ALL_SPHERE_IDS;
  const spheres = new Map<SphereAgentId, SphereState>(
    ids.map(id => [id, createInitialSphereState(id)])
  );

  return {
    meetingId,
    spheres,
    groupCoherence: 0.5,
    groupPhase: 0,
    energyBudget: 0.7,
    entropy: 0.5,
    resonantPairs: [],
    interferenceMap: [],
    meetingHealth: { status: 'warming', score: 0.5, dominantSphere: null, suggestion: 'El consejo está calentando.' },
    tickCount: 0,
    lastTickAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Tick: advance the council field by dt seconds
// ---------------------------------------------------------------------------

export function tickCouncilField(field: CouncilField, dt: number): CouncilField {
  const sphereIds = Array.from(field.spheres.keys());

  // 1. Apply Kuramoto coupling to each sphere's frequency
  const newSpheres = new Map<SphereAgentId, SphereState>();

  for (const id of sphereIds) {
    const s = field.spheres.get(id)!;

    // Kuramoto: dθ/dt += (K/N) * sum_j sin(θ_j - θ_i)
    // We approximate by adjusting frequency instead of phase directly
    let phaseForce = 0;
    for (const otherId of sphereIds) {
      if (otherId === id) continue;
      const other = field.spheres.get(otherId)!;
      const phaseDiff = other.phase - s.phase;
      // Only couple to active spheres (energy > 0.3)
      const coupling = other.energy > 0.3 ? other.coherence : 0;
      phaseForce += coupling * Math.sin(phaseDiff);
    }
    phaseForce = (KURAMOTO_K / sphereIds.length) * phaseForce;

    // Nudge frequency toward group mean (very gently — 1% per tick)
    const nudgedState: SphereState = {
      ...s,
      frequency_hz: Math.max(0.1, Math.min(1.0, s.frequency_hz + phaseForce * dt * 0.01)),
    };

    // Standard tick
    newSpheres.set(id, tickSphereState(nudgedState, dt));
  }

  // 2. Compute group coherence (Kuramoto order parameter R)
  // R = |1/N * sum exp(i * phase)|
  let sumCos = 0;
  let sumSin = 0;
  for (const s of newSpheres.values()) {
    sumCos += Math.cos(s.phase) * s.energy;
    sumSin += Math.sin(s.phase) * s.energy;
  }
  const R = Math.sqrt(sumCos ** 2 + sumSin ** 2) / sphereIds.length;
  const groupPhase = Math.atan2(sumSin, sumCos);

  // 3. Energy budget (mean energy)
  const energyBudget = Array.from(newSpheres.values()).reduce((sum, s) => sum + s.energy, 0) / sphereIds.length;

  // 4. Entropy (normalized variance of frequencies)
  const freqs = Array.from(newSpheres.values()).map(s => s.frequency_hz);
  const meanFreq = freqs.reduce((a, b) => a + b, 0) / freqs.length;
  const variance = freqs.reduce((sum, f) => sum + (f - meanFreq) ** 2, 0) / freqs.length;
  const entropy = Math.min(1, Math.sqrt(variance) * 4);  // normalize to [0..1]

  // 5. Resonant pairs
  const resonantPairs: ResonantPair[] = [];
  for (let i = 0; i < sphereIds.length; i++) {
    for (let j = i + 1; j < sphereIds.length; j++) {
      const a = newSpheres.get(sphereIds[i])!;
      const b = newSpheres.get(sphereIds[j])!;
      const phaseDiff = Math.abs(a.phase - b.phase) % Math.PI;
      const freqDiff = Math.abs(a.frequency_hz - b.frequency_hz);
      const normalizedPhaseDiff = Math.min(phaseDiff, Math.PI - phaseDiff);
      if (normalizedPhaseDiff < 0.3) {
        resonantPairs.push({
          a: sphereIds[i],
          b: sphereIds[j],
          phaseDiff: normalizedPhaseDiff,
          frequencyDiff: freqDiff,
          resonanceScore: (1 - normalizedPhaseDiff / 0.3) * (1 - freqDiff),
        });
      }
    }
  }

  // 6. Interference map (simplified: detect constructive/destructive groups)
  const interferenceMap = computeInterference(newSpheres, sphereIds);

  // 7. Meeting health
  const meetingHealth = computeMeetingHealth(newSpheres, R, entropy, energyBudget, sphereIds);

  return {
    ...field,
    spheres: newSpheres,
    groupCoherence: R,
    groupPhase,
    energyBudget,
    entropy,
    resonantPairs,
    interferenceMap,
    meetingHealth,
    tickCount: field.tickCount + 1,
    lastTickAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Apply a CouncilEvent to the field
// ---------------------------------------------------------------------------

export function applyEventToField(field: CouncilField, event: CouncilEvent): CouncilField {
  const newField = { ...field, spheres: new Map(field.spheres) };

  if (event.type === 'sphere.signal') {
    const { agentId, amplitude, kind, targetIds, durationMs } = event;
    const sphere = newField.spheres.get(agentId);
    if (!sphere) return field;

    // Boost energy and mark as speaking
    newField.spheres.set(agentId, {
      ...sphere,
      speakingNow: true,
      energy: Math.min(1.0, sphere.energy + amplitude * 0.2),
      lastSignalAt: Date.now(),
      heartActive: kind === 'ALIGN',
    });

    // ALIGN: entrain target spheres
    if (kind === 'ALIGN' && targetIds) {
      for (const targetId of targetIds) {
        const target = newField.spheres.get(targetId);
        if (target) {
          newField.spheres.set(
            targetId,
            applyAlignEntrainment(target, sphere.frequency_hz, amplitude * 0.2)
          );
        }
      }
    }

    // Schedule speaking-off after durationMs (caller manages the timer)
    // We just record the signal here
  }

  if (event.type === 'meeting.begin') {
    // Reset coherence for all spheres
    for (const [id, s] of newField.spheres) {
      newField.spheres.set(id, { ...s, coherence: 0.4, energy: 0.8 });
    }
  }

  if (event.type === 'meeting.closing') {
    // Set coherence to the reported value
    for (const [id, s] of newField.spheres) {
      newField.spheres.set(id, { ...s, coherence: Math.max(s.coherence, event.coherence) });
    }
  }

  return newField;
}

// ---------------------------------------------------------------------------
// Mark a sphere as done speaking
// ---------------------------------------------------------------------------

export function markSpeakingDone(field: CouncilField, agentId: SphereAgentId): CouncilField {
  const sphere = field.spheres.get(agentId);
  if (!sphere) return field;
  const newSpheres = new Map(field.spheres);
  newSpheres.set(agentId, { ...sphere, speakingNow: false });
  return { ...field, spheres: newSpheres };
}

// ---------------------------------------------------------------------------
// Compute interference patterns
// ---------------------------------------------------------------------------

function computeInterference(
  spheres: Map<SphereAgentId, SphereState>,
  ids: SphereAgentId[]
): InterferenceCell[] {
  const cells: InterferenceCell[] = [];
  const activeSpheres = ids.filter(id => (spheres.get(id)?.energy ?? 0) > INTERFERENCE_THRESHOLD);

  if (activeSpheres.length < 2) return cells;

  // Check groups of 2-3 spheres for constructive/destructive interference
  for (let i = 0; i < activeSpheres.length; i++) {
    for (let j = i + 1; j < activeSpheres.length; j++) {
      const a = spheres.get(activeSpheres[i])!;
      const b = spheres.get(activeSpheres[j])!;
      const phaseDiff = Math.abs(a.phase - b.phase) % (Math.PI * 2);
      const normalized = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);

      const combinedAmplitude = (a.energy + b.energy) / 2;

      if (normalized < Math.PI / 4) {
        // In phase → constructive
        cells.push({
          agents: [activeSpheres[i], activeSpheres[j]],
          type: 'constructive',
          amplitude: combinedAmplitude * (1 + Math.cos(normalized)),
        });
      } else if (normalized > (3 * Math.PI) / 4) {
        // Out of phase → destructive
        cells.push({
          agents: [activeSpheres[i], activeSpheres[j]],
          type: 'destructive',
          amplitude: combinedAmplitude * Math.abs(Math.cos(normalized)),
        });
      }
    }
  }

  return cells.slice(0, 8); // limit output size
}

// ---------------------------------------------------------------------------
// Compute meeting health
// ---------------------------------------------------------------------------

function computeMeetingHealth(
  spheres: Map<SphereAgentId, SphereState>,
  R: number,
  entropy: number,
  energy: number,
  ids: SphereAgentId[]
): MeetingHealth {
  const score = (R * 0.5 + (1 - entropy) * 0.3 + energy * 0.2);

  let status: MeetingHealth['status'];
  if (score < 0.2) status = 'fracturing';
  else if (score < 0.4) status = 'warming';
  else if (score < 0.6) status = 'active';
  else if (score < 0.8) status = 'active';
  else status = 'coherent';

  // Dominant sphere = most energy while speaking
  const speakers = ids.filter(id => spheres.get(id)?.speakingNow);
  let dominantSphere: SphereAgentId | null = null;
  if (speakers.length > 0) {
    dominantSphere = speakers.reduce((best, id) => {
      return (spheres.get(id)?.energy ?? 0) > (spheres.get(best)?.energy ?? 0) ? id : best;
    }, speakers[0]);
  }

  const suggestions: Record<MeetingHealth['status'], string> = {
    warming:    'El consejo está calentando. Las Esferas están sincronizando frecuencias.',
    active:     'El consejo está en plena discusión. Las perspectivas están divergiendo — sano.',
    coherent:   '¡Alta coherencia! El consejo está alineado. Momento ideal para síntesis.',
    fracturing: 'Alerta: el consejo se está fragmentando. Considera llamar a CONSEJO para facilitar.',
    closing:    'El consejo está cerrando. Recopilando decisiones finales.',
  };

  return {
    status,
    score,
    dominantSphere,
    suggestion: suggestions[status],
  };
}

// ---------------------------------------------------------------------------
// Utility: get a summarized field state (for API responses / token efficiency)
// ---------------------------------------------------------------------------

export function summarizeField(field: CouncilField): object {
  return {
    meetingId: field.meetingId,
    tickCount: field.tickCount,
    groupCoherence: Math.round(field.groupCoherence * 100) / 100,
    energyBudget: Math.round(field.energyBudget * 100) / 100,
    entropy: Math.round(field.entropy * 100) / 100,
    health: field.meetingHealth,
    activeSpheres: Array.from(field.spheres.values())
      .filter(s => s.speakingNow)
      .map(s => s.agentId),
    resonantPairCount: field.resonantPairs.length,
    topResonantPair: field.resonantPairs.length > 0
      ? { a: field.resonantPairs[0].a, b: field.resonantPairs[0].b, score: Math.round(field.resonantPairs[0].resonanceScore * 100) / 100 }
      : null,
  };
}
