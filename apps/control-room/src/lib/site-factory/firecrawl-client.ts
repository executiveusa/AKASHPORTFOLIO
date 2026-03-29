/**
 * FireCrawl Client — Site Factory Intelligence Layer
 * Scrapes businesses + competitors for the site factory pipeline
 * Powers: research-esfera competitive intel
 */

const BACKEND = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';

export interface ScrapeResult {
  status: string;
  url: string;
  data?: {
    markdown?: string;
    extract?: Record<string, unknown>;
    links?: string[];
  };
  timestamp: string;
}

export interface CompetitorIntel {
  status: string;
  business_name: string;
  niche: string;
  city: string;
  needs_site: boolean;
  competitors_found: number;
  blueprint: WinningBlueprint;
  generated_at: string;
}

export interface WinningBlueprint {
  hero_headline: string;
  hero_subline: string;
  page_sections: string[];
  cta_text: string;
  primary_color: string;
  secondary_color: string;
  font_recommendation: string;
  key_trust_signals: string[];
}

/**
 * Scrape a single URL — returns markdown + extracted data
 */
export async function scrapeUrl(
  url: string,
  options: {
    competitorMode?: boolean;
    niche?: string;
    city?: string;
  } = {}
): Promise<ScrapeResult> {
  const res = await fetch(`${BACKEND}/firecrawl/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      competitor_mode: options.competitorMode ?? false,
      niche: options.niche,
      city: options.city,
      extract: ['copy', 'colors', 'seo', 'reviews'],
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!res.ok) throw new Error(`FireCrawl scrape failed: ${res.status}`);
  return res.json() as Promise<ScrapeResult>;
}

/**
 * Full competitor research pipeline for a business
 * Returns blueprint for winning website
 */
export async function researchBusiness(params: {
  businessName?: string;
  url?: string;
  niche: string;
  city: string;
  country?: string;
}): Promise<CompetitorIntel> {
  const res = await fetch(`${BACKEND}/kupuri/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_name: params.businessName,
      url: params.url,
      niche: params.niche,
      city: params.city,
      country: params.country ?? 'MX',
      language: 'es',
    }),
    signal: AbortSignal.timeout(40_000),
  });

  if (!res.ok) throw new Error(`Research failed: ${res.status}`);
  return res.json() as Promise<CompetitorIntel>;
}

/**
 * Batch discovery via Google Maps — find businesses that need sites
 */
export async function discoverBusinesses(params: {
  niche: string;
  city: string;
  country?: string;
  count?: number;
}): Promise<Array<{ name: string; address: string; website?: string; rating: number }>> {
  const { searchBusinesses } = await import('./google-maps-client');
  return searchBusinesses(params);
}
