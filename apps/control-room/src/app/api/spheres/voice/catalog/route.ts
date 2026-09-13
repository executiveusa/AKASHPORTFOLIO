/**
 * GET /api/spheres/voice/catalog
 *
 * Returns Rime voice details for speakers referenced in the sphere registry,
 * filtered to Spanish (spa) and English (eng) speakers with demographics.
 * Cached 24h in module memory.
 *
 * Security: requireUser (401 if unauthenticated). No API key needed for Rime MCP.
 */

import { NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';

// ---------------------------------------------------------------------------
// Registry-referenced speakers (source of truth: synthia/_shared/registry/spheres.md)
// ---------------------------------------------------------------------------

const REGISTRY_SPEAKERS = new Set<string>([
  // es speakers
  'isa', 'thea', 'rosalie', 'seraphina', 'abril', 'cielo', 'frieda', 'mari',
  'azulado', 'resplandor', 'alba', 'cristhian', 'claridad', 'luciana',
  'xavier', 'renato', 'nova',
  // en speakers
  'astra', 'celeste', 'lyra', 'clementine', 'lintel', 'luna', 'bancroft',
  'masonry', 'eyre', 'albion',
]);

// ---------------------------------------------------------------------------
// Module-level 24-hour cache
// ---------------------------------------------------------------------------

interface CatalogEntry {
  speaker: string;
  language: string;
  demographics?: Record<string, unknown>;
  [key: string]: unknown;
}

interface CachedCatalog {
  fetchedAt: number;
  speakers: CatalogEntry[];
}

let cache: CachedCatalog | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const RIME_MCP_URL = 'https://mcp.rime.ai';

async function fetchRimeVoiceDetails(language: 'spa' | 'eng'): Promise<CatalogEntry[]> {
  const res = await fetch(RIME_MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_voice_details',
        arguments: { language },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Rime MCP ${res.status}`);
  const json = (await res.json()) as {
    result?: { content?: Array<{ type: string; text?: string }> };
    error?: { message?: string };
  };
  if (json.error) throw new Error(json.error.message ?? 'Rime MCP error');

  // The MCP response embeds the result as a text content block containing JSON.
  const textBlock = json.result?.content?.find((c) => c.type === 'text');
  if (!textBlock?.text) return [];

  const parsed: unknown = JSON.parse(textBlock.text);
  if (!Array.isArray(parsed)) return [];
  return parsed as CatalogEntry[];
}

async function loadCatalog(): Promise<CatalogEntry[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.speakers;
  }

  const [spaEntries, engEntries] = await Promise.all([
    fetchRimeVoiceDetails('spa').catch(() => [] as CatalogEntry[]),
    fetchRimeVoiceDetails('eng').catch(() => [] as CatalogEntry[]),
  ]);

  const all = [...spaEntries, ...engEntries];

  // Filter to only speakers used in the sphere registry
  const filtered = all.filter(
    (entry) => typeof entry.speaker === 'string' && REGISTRY_SPEAKERS.has(entry.speaker),
  );

  cache = { fetchedAt: now, speakers: filtered };
  return filtered;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    await requireUser();
  } catch (e) {
    return toErrorResponse(e);
  }

  try {
    const speakers = await loadCatalog();
    return NextResponse.json(
      { ok: true, speakers, cachedAt: cache?.fetchedAt },
      {
        headers: {
          'Cache-Control': 'private, max-age=86400',
        },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'catalog fetch failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
