/**
 * POST /api/spheres/voice
 *
 * Body: { agentId: SphereAgentId, text: string, lang?: 'es'|'en', produced?: boolean }
 * Returns: audio/mpeg with headers X-Voice-Provider, X-Voice-Speaker, X-Voice-Model
 *          or JSON { kind:'text', agentId, text, reason, provider } on text fallback
 *
 * Security: requireUser (401 if unauthenticated), rate-limit 30/min/user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { checkRateLimit } from '@/lib/sanitize';
import { synthesizeSphereVoice } from '@/lib/mercury-voice';
import type { SphereAgentId } from '@/shared/council-events';

const VALID_AGENT_IDS = new Set<string>([
  'synthia', 'alex', 'cazadora', 'forjadora', 'seductora',
  'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos', 'la-vigilante',
]);

export async function POST(req: NextRequest) {
  // Auth guard
  let session: Awaited<ReturnType<typeof requireUser>>;
  try {
    session = await requireUser();
  } catch (e) {
    return toErrorResponse(e);
  }

  // Rate limit: 30 requests/min keyed by authenticated user email
  const userKey = `voice:${session.user.email}`;
  const rl = checkRateLimit(userKey, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'RATE_LIMITED', resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  // Parse body
  let body: { agentId?: unknown; text?: unknown; lang?: unknown; produced?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { agentId, text, lang, produced } = body;

  if (typeof agentId !== 'string' || !VALID_AGENT_IDS.has(agentId)) {
    return NextResponse.json(
      { error: `agentId must be one of: ${[...VALID_AGENT_IDS].join(', ')}` },
      { status: 400 },
    );
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required and must be non-empty' }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: 'text exceeds 2000 character limit' }, { status: 400 });
  }

  const langOpt: 'es' | 'en' | undefined =
    lang === 'es' || lang === 'en' ? lang : undefined;

  const result = await synthesizeSphereVoice(agentId as SphereAgentId, text.trim(), {
    lang: langOpt,
    produced: produced === true,
  });

  if (result.ok) {
    const audioBuffer = Buffer.from(result.audio, 'base64');
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Voice-Provider': result.provider,
        'X-Voice-Speaker': result.speaker ?? result.voiceId,
        'X-Voice-Model': result.model,
        'X-Agent-Id': agentId,
      },
    });
  }

  // Text fallback — shape unchanged, plus provider field
  return NextResponse.json({
    kind: 'text',
    agentId,
    text: result.text,
    reason: result.reason,
    provider: result.provider ?? 'text-fallback',
  });
}
