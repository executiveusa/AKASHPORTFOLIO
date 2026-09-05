/**
 * GET /api/models — model catalog for the chat switcher.
 * Returns the curated catalog (free first) + live free models from OpenRouter (cached 1 h).
 */
import { NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { CATALOG, DEFAULT_MODEL } from '@/lib/models';

let liveFree: { at: number; ids: string[] } = { at: 0, ids: [] };

async function fetchLiveFree(): Promise<string[]> {
  if (Date.now() - liveFree.at < 3_600_000 && liveFree.ids.length) return liveFree.ids;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } });
    if (!res.ok) return liveFree.ids;
    const data = (await res.json()) as { data: Array<{ id: string; pricing?: { prompt?: string; completion?: string } }> };
    const ids = data.data
      .filter((m) => m.id.endsWith(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0'))
      .map((m) => m.id)
      .filter((id) => !id.includes('lyria') && !id.includes('content-safety'));
    liveFree = { at: Date.now(), ids };
    return ids;
  } catch {
    return liveFree.ids;
  }
}

export async function GET() {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  const live = await fetchLiveFree();
  const known = new Set(CATALOG.map((m) => m.id));
  const extraFree = live.filter((id) => !known.has(id)).map((id) => ({ id, label: `${id.replace(':free', '')} · gratis`, tier: 'free', free: true, ctx: 0 }));
  return NextResponse.json({
    default: DEFAULT_MODEL,
    paidAllowed: process.env.LLM_ALLOW_PAID === 'true',
    models: [...CATALOG, ...extraFree],
  }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
