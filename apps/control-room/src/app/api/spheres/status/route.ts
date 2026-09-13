import { NextRequest, NextResponse } from "next/server";
import { requireUser, toErrorResponse } from "@/lib/auth/guards";
import { getRegistrySnapshot } from "@/lib/council/registry";
import { SPHERE_FREQUENCY_MAP } from "@/shared/sphere-state";
import type { SphereAgentId } from "@/shared/council-events";

/**
 * GET /api/spheres/status — live sphere status feed
 * Returns each sphere merged with SPHERE_FREQUENCY_MAP display metadata.
 * No cache: consumers poll every 5 s.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const snapshot = getRegistrySnapshot();

  const spheres = (Object.keys(SPHERE_FREQUENCY_MAP) as SphereAgentId[]).map(id => {
    const meta = SPHERE_FREQUENCY_MAP[id];
    const live = snapshot.spheres[id];
    return {
      id,
      displayName: meta.displayName,
      role: meta.role,
      locale: meta.locale,
      color: meta.baseColor,
      status: live?.status ?? "standby",
      lastSignalAt: live?.lastSignalAt ?? null,
      turnsToday: live?.turnsToday ?? 0,
      lastTranscript: live?.lastTranscript ?? null,
      meetingId: live?.meetingId ?? null,
    };
  });

  const activeMeetings = snapshot.activeMeetings.map(m => ({
    meetingId: m.meetingId,
    topic: m.topic,
    agentIds: m.agentIds,
    startedAt: m.startedAt,
    lastSpeaker: m.lastSpeaker,
    turns: m.turns,
  }));

  return NextResponse.json(
    {
      ok: true,
      spheres,
      activeMeetings,
      activeCount: snapshot.activeMeetings.length,
      updatedAt: snapshot.updatedAt,
      uptimeSec: snapshot.uptimeSec,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
