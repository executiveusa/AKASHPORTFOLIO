/**
 * Pauli Hermes Bridge — SYNTHIA™ → Pauli Hermes Research Agent adapter
 *
 * Pauli Hermes (github.com/executiveusa/pauli-hermes-agent) is a research-specialist
 * agent that can deep-search topics, synthesize findings, and return structured reports.
 *
 * Role in the Council: Research & Intelligence backbone.
 * SYNTHIA calls Pauli Hermes BEFORE council meetings to enrich the Brief with
 * current facts, competitor data, or market intelligence.
 *
 * Integration points:
 *   - Pre-Brief enrichment: /api/research/enrich
 *   - Council preparation: /api/research/council-prep
 *   - On-demand queries from individual spheres
 */

import type { CouncilBrief } from './council-engine';

// ─── Configuration ────────────────────────────────────────────────────────────

const PAULI_HERMES_BASE_URL = process.env.PAULI_HERMES_URL ?? 'http://localhost:4000';
const PAULI_HERMES_API_KEY  = process.env.PAULI_HERMES_API_KEY ?? '';
const TIMEOUT_MS            = parseInt(process.env.PAULI_HERMES_TIMEOUT_MS ?? '45000', 10);

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResearchDepth = 'quick' | 'standard' | 'deep';

export interface ResearchQuery {
  query: string;
  depth?: ResearchDepth;
  context?: string;              // additional framing for the query
  maxSources?: number;
  focusRegion?: 'latam' | 'global' | 'mx' | 'us';
  requiredBy?: string;           // ISO timestamp — urgency hint
}

export interface ResearchFinding {
  query: string;
  summary: string;
  keyFacts: string[];
  sources: Array<{
    title: string;
    url: string;
    excerpt: string;
    reliability: 'high' | 'medium' | 'low';
  }>;
  confidence: number;            // 0..1
  caveats?: string;
  completedAt: string;
}

export interface CouncilIntelligencePackage {
  briefId: string;
  situationAnalysis: string;
  competitorLandscape: string;
  marketData: string;
  risks: string[];
  opportunities: string[];
  sources: ResearchFinding['sources'];
  preparedAt: string;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function pauliHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (PAULI_HERMES_API_KEY) headers['X-Api-Key'] = PAULI_HERMES_API_KEY;
  return headers;
}

async function pauliFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; ok: true } | { data: null; ok: false; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${PAULI_HERMES_BASE_URL}${path}`, {
      ...init,
      headers: { ...pauliHeaders(), ...(init.headers ?? {}) },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => 'no body');
      return { data: null, ok: false, error: `HTTP ${res.status}: ${text}` };
    }

    return { data: (await res.json()) as T, ok: true };
  } catch (err) {
    clearTimeout(timer);
    return {
      data: null,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function pauliHermesHealthCheck(): Promise<{ ok: boolean; version?: string }> {
  const result = await pauliFetch<{ status?: string; version?: string }>('/health');
  return { ok: result.ok, version: result.ok ? result.data.version : undefined };
}

// ─── Research queries ─────────────────────────────────────────────────────────

/**
 * Run a single research query.
 * Returns an empty result (not a throw) if Pauli Hermes is unavailable —
 * the council can proceed without research enrichment.
 */
export async function researchQuery(query: ResearchQuery): Promise<ResearchFinding | null> {
  const result = await pauliFetch<ResearchFinding>('/research', {
    method: 'POST',
    body: JSON.stringify({
      query: query.query,
      depth: query.depth ?? 'standard',
      context: query.context,
      max_sources: query.maxSources ?? 5,
      focus_region: query.focusRegion ?? 'latam',
    }),
  });

  if (!result.ok) {
    console.warn(`[pauli-hermes] Research query failed: ${result.error}`);
    return null;
  }

  return result.data;
}

/**
 * Prepare a council intelligence package for a given Brief.
 * Called by SYNTHIA before Stage 1 to enrich context docs.
 * Graceful degradation: returns null if service is down.
 */
export async function prepareCouncilIntelligence(
  brief: CouncilBrief,
): Promise<CouncilIntelligencePackage | null> {
  const result = await pauliFetch<CouncilIntelligencePackage>('/council-prep', {
    method: 'POST',
    body: JSON.stringify({
      brief_id: brief.id,
      situation: brief.situation,
      stakes: brief.stakes,
      key_questions: brief.key_questions,
      context_docs: brief.context_docs,
    }),
  });

  if (!result.ok) {
    console.warn(`[pauli-hermes] Council prep failed: ${result.error}`);
    return null;
  }

  return result.data;
}

/**
 * Enrich a Brief's context_docs field with Pauli Hermes research.
 * Returns the enhanced context_docs string, or the original if unavailable.
 */
export async function enrichBrief(brief: CouncilBrief): Promise<string> {
  const intel = await prepareCouncilIntelligence(brief);
  if (!intel) return brief.context_docs ?? '';

  return [
    brief.context_docs,
    '--- INTELLIGENCE PACKAGE (Pauli Hermes) ---',
    `Situation Analysis:\n${intel.situationAnalysis}`,
    `Market Data:\n${intel.marketData}`,
    `Competitor Landscape:\n${intel.competitorLandscape}`,
    `Risks: ${intel.risks.join('; ')}`,
    `Opportunities: ${intel.opportunities.join('; ')}`,
  ].filter(Boolean).join('\n\n');
}
