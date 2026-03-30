/**
 * Freelance Scanner — ALEX™ Opportunity Hunter
 * Scans Upwork RSS, Workana, and Fiverr for relevant projects
 * Drafts proposals for Ivette's approval (never auto-submits)
 */

export interface FreelanceOpportunity {
  platform: string;
  title: string;
  description: string;
  budget?: string;
  skills: string[];
  postedAt: string;
  url: string;
  relevanceScore: number; // 0-100
  draftProposal?: string;
}

const TARGET_SKILLS = [
  'ai', 'automation', 'machine learning', 'next.js', 'react', 'typescript',
  'python', 'content writing', 'spanish', 'translation', 'copywriting',
  'seo', 'marketing', 'social media', 'chatbot', 'agent',
];

const BUDGET_MIN_USD = Number(process.env.FREELANCE_MIN_BUDGET_USD ?? '200');

/**
 * Parse Upwork RSS feed for jobs matching target skills
 */
async function scanUpwork(): Promise<FreelanceOpportunity[]> {
  const opportunities: FreelanceOpportunity[] = [];

  const searchTerms = ['AI automation', 'Next.js developer', 'Spanish content writer'];

  for (const term of searchTerms) {
    try {
      const encoded = encodeURIComponent(term);
      const feedUrl = `https://www.upwork.com/ab/feed/jobs/rss?q=${encoded}&sort=recency`;

      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KupuriBot/1.0)',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const xml = await res.text();

      // Parse items from RSS XML
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

      for (const item of items.slice(0, 5)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? '';
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? '';
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';

        const score = scoreOpportunity(title + ' ' + description);
        if (score < 30) continue;

        opportunities.push({
          platform: 'Upwork',
          title: title.slice(0, 100),
          description: description.replace(/<[^>]+>/g, '').slice(0, 300),
          skills: extractSkills(title + ' ' + description),
          postedAt: pubDate,
          url: link,
          relevanceScore: score,
        });
      }
    } catch {
      // Non-critical — skip this term
    }
  }

  return opportunities;
}

/**
 * Scan Workana (LATAM freelance platform) RSS
 */
async function scanWorkana(): Promise<FreelanceOpportunity[]> {
  try {
    const res = await fetch(
      'https://www.workana.com/jobs/rss?lang=es&category=it-programming',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KupuriBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
    const opportunities: FreelanceOpportunity[] = [];

    for (const item of items.slice(0, 5)) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';

      const clean = title + ' ' + description.replace(/<[^>]+>/g, '');
      const score = scoreOpportunity(clean);
      if (score < 20) continue;

      opportunities.push({
        platform: 'Workana',
        title: title.slice(0, 100),
        description: description.replace(/<[^>]+>/g, '').slice(0, 300),
        skills: extractSkills(clean),
        postedAt: pubDate,
        url: link,
        relevanceScore: score,
      });
    }

    return opportunities;
  } catch {
    return [];
  }
}

function scoreOpportunity(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;

  for (const skill of TARGET_SKILLS) {
    if (lower.includes(skill)) score += 10;
  }

  // Bonus for Spanish/LATAM
  if (lower.includes('spanish') || lower.includes('español') || lower.includes('latam')) score += 15;
  // Bonus for AI/automation
  if (lower.includes('autonomous') || lower.includes('agent') || lower.includes('llm')) score += 20;
  // Penalty for ultra-low-budget signals
  if (lower.includes('$5') || lower.includes('$10') || lower.includes('very low budget')) score -= 30;

  return Math.max(0, Math.min(100, score));
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return TARGET_SKILLS.filter((s) => lower.includes(s));
}

/**
 * Run all scanners and return top opportunities sorted by relevance
 */
export async function scanAllPlatforms(): Promise<FreelanceOpportunity[]> {
  const [upwork, workana] = await Promise.all([scanUpwork(), scanWorkana()]);

  return [...upwork, ...workana]
    .filter((o) => o.relevanceScore >= 30)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
}

/**
 * Filter opportunities by minimum budget
 */
export function filterByBudget(
  opportunities: FreelanceOpportunity[],
  minUSD = BUDGET_MIN_USD
): FreelanceOpportunity[] {
  return opportunities.filter((o) => {
    if (!o.budget) return true; // Include if budget unknown
    const match = o.budget.match(/\$?([\d,]+)/);
    if (!match) return true;
    const amount = Number(match[1].replace(',', ''));
    return amount >= minUSD;
  });
}
