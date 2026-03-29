/**
 * PAULI-CLIP™ API Routes
 * Ceremony orchestration and sphere dissolution endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

interface CeremonyRequest {
  mesa_id?: string;
  esfera_ids: string[];
  topic?: string;
  durationMs?: number;
}

interface CeremonyResponse {
  ceremony_id: string;
  phase: 'gathering' | 'deliberation' | 'dissolution' | 'reflection' | 'dismissed';
  members_count: number;
  start_time: string;
  estimated_end_time: string;
}

/**
 * POST /api/pauli-clip
 * Initiate a new council ceremony
 */
export async function POST(request: NextRequest) {
  try {
    const body: CeremonyRequest = await request.json();

    // Validate input
    if (!body.esfera_ids || body.esfera_ids.length === 0) {
      return NextResponse.json(
        { error: 'esfera_ids required' },
        { status: 400 }
      );
    }

    const durationMs = body.durationMs || 300000; // 5 minutes default
    const ceremonyId = `ceremony-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMs);

    const response: CeremonyResponse = {
      ceremony_id: ceremonyId,
      phase: 'gathering',
      members_count: body.esfera_ids.length,
      start_time: now.toISOString(),
      estimated_end_time: endTime.toISOString(),
    };

    // Optional: Call backend /el-panorama/consejo if mesa_id provided
    if (body.mesa_id) {
      try {
        const backendUrl = process.env.EL_PANORAMA_BACKEND_URL || 'http://localhost:8080';
        await fetch(`${backendUrl}/el-panorama/consejo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mesa_id: body.mesa_id,
            tema: body.topic || 'Ceremony Deliberation',
            duracion_ms: durationMs,
          }),
        });
      } catch (e) {
        console.warn('[PAULI-CLIP] Backend council integration failed:', e);
        // Non-blocking - ceremony proceeds
      }
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[PAULI-CLIP] Ceremony initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate ceremony' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pauli-clip?ceremony_id=xyz
 * Retrieve ceremony status
 */
export async function GET(request: NextRequest) {
  const ceremonyId = request.nextUrl.searchParams.get('ceremony_id');

  if (!ceremonyId) {
    return NextResponse.json(
      { error: 'ceremony_id query parameter required' },
      { status: 400 }
    );
  }

  // Mock ceremony status - in production, would query database
  return NextResponse.json({
    ceremony_id: ceremonyId,
    phase: 'deliberation',
    members_count: 4,
    decisions: [],
    particle_intensity: 0.65,
    elapsed_ms: 45000,
    status: 'active',
  });
}
