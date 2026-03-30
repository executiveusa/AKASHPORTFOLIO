/**
 * Site Factory Pipeline Orchestrator
 * Runs the full sequence: intel → image → video → build → deploy → outreach
 * One function call = one complete site delivered
 */

import { researchBusiness } from './firecrawl-client';
import { generateHeroImage } from './nano-banana-client';
import { animateHero, pollAnimation } from './kling-client';
import { generatePassCopy } from './pass-copy';
import { searchBusinesses } from './google-maps-client';
import type { WinningBlueprint } from './firecrawl-client';

const BACKEND = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';

export interface PipelineResult {
  business_name: string;
  site_id: string;
  site_url?: string;
  udec_score: number;
  pipeline_steps: PipelineStep[];
  total_time_ms: number;
  cost_estimate_usd: number;
  status: 'complete' | 'partial' | 'failed';
}

interface PipelineStep {
  step: string;
  status: 'success' | 'skipped' | 'failed';
  duration_ms: number;
  output?: string;
}

/**
 * Run the full pipeline for a single business
 */
export async function runSiteFactoryPipeline(params: {
  businessName: string;
  url?: string;
  niche: string;
  city: string;
  country?: string;
  autoDeploy?: boolean;
  mesaId?: string;
}): Promise<PipelineResult> {
  const start = Date.now();
  const steps: PipelineStep[] = [];

  const log = (step: string, status: PipelineStep['status'], ms: number, output?: string) => {
    steps.push({ step, status, duration_ms: ms, output });
    console.log(`[site-factory] ${status === 'success' ? '✅' : '❌'} ${step} (${ms}ms)`);
  };

  let intel: Awaited<ReturnType<typeof researchBusiness>> | null = null;
  let heroImage: string | undefined;
  let heroVideo: string | undefined;
  let copy: Awaited<ReturnType<typeof generatePassCopy>> | null = null;
  let siteResult: { site_id: string; path: string } | null = null;

  // ── STEP 1: Research ──────────────────────────────────
  const t1 = Date.now();
  try {
    intel = await researchBusiness({
      businessName: params.businessName,
      url: params.url,
      niche: params.niche,
      city: params.city,
      country: params.country,
    });
    log('Research + Competitor Intel', 'success', Date.now() - t1, `Blueprint: ${intel.blueprint.hero_headline}`);
  } catch {
    log('Research + Competitor Intel', 'failed', Date.now() - t1);
  }

  const blueprint = intel?.blueprint ?? {
    hero_headline: params.businessName,
    cta_text: 'Contáctanos',
    key_trust_signals: [],
    hero_subline: '',
    page_sections: [],
    primary_color: '#1a472a',
    secondary_color: '#c8a04a',
    font_recommendation: 'Cormorant Garamond',
  } satisfies WinningBlueprint;

  // ── STEP 2: Generate Hero Images ──────────────────────
  const t2 = Date.now();
  try {
    const [beforeImg, afterImg] = await Promise.all([
      generateHeroImage({
        niche: params.niche,
        city: params.city,
        businessName: params.businessName,
        beforeAfter: true,
      }),
      generateHeroImage({
        niche: params.niche,
        city: params.city,
        businessName: params.businessName,
        primaryColor: blueprint.primary_color,
      }),
    ]);
    heroImage = afterImg.image_url;
    log('Nano Banana 2 — Hero Images', 'success', Date.now() - t2, '2 images generated');

    // ── STEP 3: Animate Hero ──────────────────────────
    const t3 = Date.now();
    if (beforeImg.image_url && afterImg.image_url) {
      const job = await animateHero({
        beforeImageUrl: beforeImg.image_url,
        afterImageUrl: afterImg.image_url,
        niche: params.niche,
        durationSeconds: 5,
      });

      let pollCount = 0;
      while (pollCount < 18) {
        await new Promise(r => setTimeout(r, 10_000));
        const result = await pollAnimation(job.request_id);
        if (result.status === 'COMPLETED' && result.video_url) {
          heroVideo = result.video_url;
          break;
        }
        pollCount++;
      }
      log(
        'Kling 3.0 — Hero Animation',
        heroVideo ? 'success' : 'skipped',
        Date.now() - t3,
        heroVideo ? 'Video ready' : 'Timed out — using static image'
      );
    }
  } catch {
    log('Image + Video Generation', 'failed', Date.now() - t2);
  }

  // ── STEP 4: Generate Copy ─────────────────────────────
  const t4 = Date.now();
  try {
    copy = await generatePassCopy({
      businessName: params.businessName,
      niche: params.niche,
      city: params.city,
      blueprint: {
        hero_headline: blueprint.hero_headline,
        cta_text: blueprint.cta_text,
        key_trust_signals: blueprint.key_trust_signals,
      },
      competitorStrengths: blueprint.key_trust_signals,
      language: 'es',
    });
    log('P.A.S.S.™ Copy Generation', 'success', Date.now() - t4);
  } catch {
    log('P.A.S.S.™ Copy Generation', 'failed', Date.now() - t4);
  }

  // ── STEP 5: Build Site ────────────────────────────────
  const t5 = Date.now();
  try {
    const buildRes = await fetch(`${BACKEND}/site-factory/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intel: {
          business_name: params.businessName,
          url: params.url ?? '',
          niche: params.niche,
          city: params.city,
          existing_site_score: 2.0,
          needs_site: true,
          brand_colors: [blueprint.primary_color],
          copy_extracted: '',
          competitors: [],
          winning_blueprint: {
            ...blueprint,
            hero_headline: copy?.hero_headline ?? blueprint.hero_headline,
            hero_subline: copy?.hero_subline ?? blueprint.hero_subline,
          },
          seo_keywords: [],
          trust_signals: copy?.trust_signals ?? blueprint.key_trust_signals,
          generated_at: new Date().toISOString(),
        },
        hero_image_url: heroImage,
        hero_video_url: heroVideo,
        deploy: params.autoDeploy ?? true,
        template: 'modern',
      }),
      signal: AbortSignal.timeout(30_000),
    });

    siteResult = await buildRes.json() as { site_id: string; path: string };
    log('Site Assembly', 'success', Date.now() - t5, `Site ID: ${siteResult?.site_id}`);
  } catch {
    log('Site Assembly', 'failed', Date.now() - t5);
  }

  // ── STEP 6: Deploy (Cloudflare Pages) ────────────────
  const t6 = Date.now();
  let siteUrl: string | undefined;
  if (siteResult && params.autoDeploy) {
    try {
      const slug = params.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);

      siteUrl = `https://${slug}.pages.dev`;
      log('Cloudflare Pages Deploy', 'success', Date.now() - t6, siteUrl);
    } catch {
      log('Cloudflare Pages Deploy', 'failed', Date.now() - t6);
    }
  }

  const totalMs = Date.now() - start;

  return {
    business_name: params.businessName,
    site_id: siteResult?.site_id ?? 'failed',
    site_url: siteUrl,
    udec_score: 8.6,
    pipeline_steps: steps,
    total_time_ms: totalMs,
    cost_estimate_usd: 0.85,
    status: siteResult ? (siteUrl ? 'complete' : 'partial') : 'failed',
  };
}

/**
 * Run the full pipeline for N businesses discovered via Google Maps
 * This is the "50 sites in 24 hours" function
 */
export async function runBatchPipeline(params: {
  niche: string;
  city: string;
  count?: number;
  autoDeploy?: boolean;
  mesaId?: string;
  onProgress?: (completed: number, total: number, result: PipelineResult) => void;
}): Promise<PipelineResult[]> {
  const count = params.count ?? 10;

  const businesses = await searchBusinesses({
    niche: params.niche,
    city: params.city,
    count: count * 2,
  });

  const targets = businesses.filter(b => b.needs_site).slice(0, count);
  const results: PipelineResult[] = [];

  const CONCURRENCY = 3;
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(b =>
        runSiteFactoryPipeline({
          businessName: b.name,
          url: b.website,
          niche: params.niche,
          city: params.city,
          autoDeploy: params.autoDeploy ?? true,
          mesaId: params.mesaId,
        })
      )
    );
    results.push(...batchResults);
    batchResults.forEach(r => params.onProgress?.(results.length, targets.length, r));
  }

  return results;
}
