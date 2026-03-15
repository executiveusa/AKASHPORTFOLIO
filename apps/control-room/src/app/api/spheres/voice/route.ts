/**
 * Multi-sphere voice synthesis API
 * 
 * POST /api/spheres/voice
 * Body: { agentId: SphereAgentId, text: string }
 * Returns: audio/mpeg stream or JSON { kind: 'text', text }
 * 
 * Replaces /api/alex/voice — routes all 9 spheres through mercury-voice.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSphereVoice } from '@/lib/mercury-voice';
import type { SphereAgentId } from '@/shared/council-events';

const VALID_AGENT_IDS = new Set<string>([
  'synthia', 'alex', 'cazadora', 'forjadora', 'seductora',
  'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos',
]);

export async function POST(req: NextRequest) {
  let body: { agentId?: string; text?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { agentId, text } = body;

  if (!agentId || !VALID_AGENT_IDS.has(agentId)) {
    return NextResponse.json(
      { error: `agentId must be one of: ${[...VALID_AGENT_IDS].join(', ')}` },
      { status: 400 },
    );
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required and must be non-empty' }, { status: 400 });
  }

  if (text.length > 4096) {
    return NextResponse.json({ error: 'text exceeds 4096 character limit' }, { status: 400 });
  }

  const result = await synthesizeSphereVoice(agentId as SphereAgentId, text.trim());

  if (result.kind === 'audio') {
    return new NextResponse(result.audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'X-Voice-Provider': result.provider,
        'X-Agent-Id': agentId,
        'Cache-Control': 'no-store',
      },
    });
  }

  // Fallback: text-only response
  return NextResponse.json({
    kind: 'text',
    agentId,
    text: result.text,
    reason: result.reason,
  });
}
