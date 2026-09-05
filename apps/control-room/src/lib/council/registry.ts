/**
 * Council Registry — in-memory live state for sphere meetings.
 * Module-level singleton; survives across requests in a single server process.
 *
 * No external deps at import time: Supabase write is fire-and-forget inside closeMeeting.
 */

import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SphereStatus = 'speaking' | 'active' | 'idle' | 'standby';

export interface SphereEntry {
  status: SphereStatus;
  lastSignalAt: number | null;
  turnsToday: number;
  lastTranscript?: string;
  meetingId?: string;
}

export interface ActiveMeetingEntry {
  meetingId: string;
  topic: string;
  agentIds: SphereAgentId[];
  startedAt: number;
  lastSpeaker: SphereAgentId | null;
  turns: number;
}

export interface ClosedMeetingEntry {
  meetingId: string;
  topic: string;
  agentIds: SphereAgentId[];
  startedAt: number;
  endedAt: number;
  coherence?: number;
  decisions?: string[];
}

export interface RegistrySnapshot {
  activeMeetings: ActiveMeetingEntry[];
  spheres: Record<SphereAgentId, SphereEntry>;
  updatedAt: number;
  uptimeSec: number;
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

const BOOT_TIME = Date.now();
const MAX_CLOSED = 20;

/** All known SphereAgentIds derived from shared type — used to seed sphere map */
const ALL_SPHERE_IDS: SphereAgentId[] = [
  'synthia', 'alex', 'cazadora', 'forjadora', 'seductora',
  'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos', 'la-vigilante',
];

const activeMeetings = new Map<string, ActiveMeetingEntry>();
const closedMeetings: ClosedMeetingEntry[] = [];

const spheres: Map<SphereAgentId, SphereEntry> = new Map(
  ALL_SPHERE_IDS.map(id => [id, {
    status: 'standby' as SphereStatus,
    lastSignalAt: null,
    turnsToday: 0,
  }]),
);

let updatedAt = Date.now();

function touch() { updatedAt = Date.now(); }

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function registerMeeting(
  meetingId: string,
  topic: string,
  agentIds: SphereAgentId[],
  startedAt: number,
): void {
  activeMeetings.set(meetingId, {
    meetingId, topic, agentIds, startedAt, lastSpeaker: null, turns: 0,
  });
  // Mark participating spheres as active
  for (const id of agentIds) {
    const entry = spheres.get(id);
    if (entry && entry.status === 'standby') {
      spheres.set(id, { ...entry, status: 'active', meetingId });
    } else if (entry) {
      spheres.set(id, { ...entry, meetingId });
    }
  }
  touch();
}

export function noteSignal(
  meetingId: string,
  agentId: SphereAgentId,
  kind: string,
  t: number,
  transcript?: string,
): void {
  const meeting = activeMeetings.get(meetingId);
  if (meeting) {
    activeMeetings.set(meetingId, {
      ...meeting,
      lastSpeaker: agentId,
      turns: meeting.turns + 1,
    });
  }
  const entry = spheres.get(agentId) ?? { status: 'standby' as SphereStatus, lastSignalAt: null, turnsToday: 0 };
  spheres.set(agentId, {
    ...entry,
    status: 'active',
    lastSignalAt: t,
    turnsToday: entry.turnsToday + 1,
    ...(transcript ? { lastTranscript: transcript.slice(0, 300) } : {}),
    meetingId,
  });
  touch();
}

export function noteVoice(meetingId: string, agentId: SphereAgentId): void {
  const entry = spheres.get(agentId);
  if (entry) {
    spheres.set(agentId, { ...entry, status: 'speaking', meetingId });
  }
  touch();
}

export function closeMeeting(
  meetingId: string,
  coherence?: number,
  decisions?: string[],
): void {
  const meeting = activeMeetings.get(meetingId);
  if (!meeting) return;

  activeMeetings.delete(meetingId);

  const closed: ClosedMeetingEntry = {
    meetingId,
    topic: meeting.topic,
    agentIds: meeting.agentIds,
    startedAt: meeting.startedAt,
    endedAt: Date.now(),
    coherence,
    decisions,
  };

  closedMeetings.push(closed);
  // Keep only last 20
  if (closedMeetings.length > MAX_CLOSED) closedMeetings.splice(0, closedMeetings.length - MAX_CLOSED);

  // Revert spheres that belonged to this meeting back to idle/standby
  for (const id of meeting.agentIds) {
    const entry = spheres.get(id);
    if (entry && entry.meetingId === meetingId) {
      spheres.set(id, { ...entry, status: 'idle', meetingId: undefined });
    }
  }
  touch();

  // Fire-and-forget: persist to Supabase (table may not exist — swallow errors)
  import('@/lib/supabase-client').then(({ supabaseAdmin }) => {
    supabaseAdmin
      .from('sphere_meetings')
      .insert({
        meeting_id: meetingId,
        topic: meeting.topic,
        agent_ids: meeting.agentIds,
        started_at: new Date(meeting.startedAt).toISOString(),
        ended_at: new Date(closed.endedAt).toISOString(),
        coherence: coherence ?? null,
        decisions: decisions ?? null,
      })
      .then(({ error }) => {
        if (error) console.warn('[registry] sphere_meetings insert skipped:', error.message);
      });
  }).catch(() => { /* supabase unavailable */ });
}

export function getRegistrySnapshot(): RegistrySnapshot {
  const sphereRecord: Record<SphereAgentId, SphereEntry> = {} as Record<SphereAgentId, SphereEntry>;
  for (const [id, entry] of spheres.entries()) {
    sphereRecord[id] = entry;
  }
  return {
    activeMeetings: Array.from(activeMeetings.values()),
    spheres: sphereRecord,
    updatedAt,
    uptimeSec: Math.floor((Date.now() - BOOT_TIME) / 1000),
  };
}

export function getMeetingHistory(limit = 20): ClosedMeetingEntry[] {
  return closedMeetings.slice(-limit).reverse();
}
