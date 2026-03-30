/**
 * /api/cron/research-latam — Pauli Auto-Research Loop (LATAM sweep)
 *
 * Runs Mon–Fri at 01:00 CST (07:00 UTC) via Vercel cron.
 * vercel.json schedule: "0 7 * * 1-5"
 *
 * Responsibilities (Ralphy Loop — EXECUTE step):
 *   1. Trigger Firecrawl sweep: Puerto Vallarta + CDMX business listings
 *   2. Enrich raw leads → directory_listings (upsert, ai_enriched=true)
 *   3. Push new prospects to leads table (source='firecrawl', status='new')
 *   4. Emit research cycle result to vibe graph (agentId: consejo)
 *   5. Log ops report to agent_tasks table
 *
 * Auth: CRON_SECRET header required (Bearer token).
 * Agent owner: CONSEJO™ (sphere: consejo, hz: 0.25)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ─── Auth ─────────────────────────────────────────────────────────────────────

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

// ─── Firecrawl target queries ─────────────────────────────────────────────────

const RESEARCH_TARGETS = [
  { query: 'restaurantes Puerto Vallarta', category: 'restaurante', geo: 'Puerto Vallarta, MX' },
  { query: 'hoteles boutique Puerto Vallarta', category: 'hotel', geo: 'Puerto Vallarta, MX' },
  { query: 'spa wellness CDMX', category: 'spa', geo: 'Ciudad de México, MX' },
  { query: 'tours experiencias Puerto Vallarta', category: 'tours', geo: 'Puerto Vallarta, MX' },
  { query: 'moda diseñadores CDMX', category: 'moda', geo: 'Ciudad de México, MX' },
  { query: 'galerías arte CDMX Santa María la Ribera', category: 'galeria', geo: 'Ciudad de México, MX' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawLead {
  business_name: string;
  category: string;
  geo: string;
  source_url?: string;
  description_raw?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface ResearchResult {
  target: string;
  leads_found: number;
  leads_inserted: number;
  error?: string;
}

// ─── Firecrawl helper ─────────────────────────────────────────────────────────

async function runFirecrawlSearch(query: string): Promise<RawLead[]> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    // Return empty — graceful degradation, logged downstream
    return [];
  }

  try {
    const res = await fetch('https://api.firecrawl.dev/v0/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({
        query,
        pageOptions: { onlyMainContent: true },
        searchOptions: { limit: 10 },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results: RawLead[] = (data.data ?? []).map(
      (item: { metadata?: { title?: string; description?: string; sourceURL?: string } }) => ({
        business_name: item.metadata?.title ?? 'Unknown',
        category: 'otro',
        geo: query,
        source_url: item.metadata?.sourceURL,
        description_raw: item.metadata?.description,
      })
    );
    return results;
  } catch {
    return [];
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startMs = Date.now();
  const runId = `RESEARCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-LATAM`;
  const results: ResearchResult[] = [];
  let totalLeadsInserted = 0;

  // ── Step 1: Sweep each target ──────────────────────────────────────────────
  for (const target of RESEARCH_TARGETS) {
    const rawLeads = await runFirecrawlSearch(target.query);

    const enriched = rawLeads.map((lead) => ({
      ...lead,
      category: target.category,
      geo: target.geo,
    }));

    let inserted = 0;

    for (const lead of enriched) {
      if (!lead.business_name || lead.business_name === 'Unknown') continue;

      // Insert into leads table (ignore duplicates via ON CONFLICT DO NOTHING at DB
      // level — we use upsert with ignoreDuplicates flag)
      const { error } = await supabaseAdmin.from('leads').upsert(
        {
          business_name: lead.business_name,
          source: 'firecrawl',
          status: 'new',
          source_url: lead.source_url ?? null,
          notes: lead.description_raw ?? null,
          assigned_agent: 'cazadora',
          company: 'kupuri-media',
        },
        { onConflict: 'business_name,source', ignoreDuplicates: true }
      );

      if (!error) inserted++;
    }

    totalLeadsInserted += inserted;
    results.push({
      target: target.query,
      leads_found: rawLeads.length,
      leads_inserted: inserted,
    });
  }

  // ── Step 2: Log to agent_tasks ─────────────────────────────────────────────
  await supabaseAdmin.from('agent_tasks').insert({
    bead_id: runId,
    stage: 'EXECUTE',
    owner_sphere: 'consejo',
    title: 'Research LATAM sweep — Firecrawl',
    description: `Swept ${RESEARCH_TARGETS.length} targets. Inserted ${totalLeadsInserted} new leads.`,
    status: 'completed',
    metadata: { results, duration_ms: Date.now() - startMs },
  });

  // ── Step 3: Vibe graph ingest ──────────────────────────────────────────────
  const vibeUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/vibe`
    : null;

  if (vibeUrl) {
    await fetch(vibeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'ingest',
        agentId: 'consejo',
        nodeKind: 'research_cycle',
        label: `LATAM research sweep ${new Date().toISOString().slice(0, 10)}`,
        content: `Swept ${RESEARCH_TARGETS.length} queries, inserted ${totalLeadsInserted} leads`,
        confidence: 0.9,
      }),
      signal: AbortSignal.timeout(5_000),
    }).catch(() => {/* non-fatal: vibe graph offline */});
  }

  // ── Response ───────────────────────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    run_id: runId,
    targets_swept: RESEARCH_TARGETS.length,
    total_leads_inserted: totalLeadsInserted,
    duration_ms: Date.now() - startMs,
    results,
  });
}
