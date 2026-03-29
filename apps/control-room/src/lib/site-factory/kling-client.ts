/**
 * Kling 3.0 Client — Before/After Hero Animation
 * Image-to-video via Fal.ai for scroll-triggered hero sections
 */

const BACKEND = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';

export interface AnimationJob {
  status: 'submitted' | 'processing' | 'complete' | 'error';
  request_id: string;
  poll_url?: string;
  video_url?: string;
  timestamp: string;
}

/**
 * Submit before/after animation job
 * Returns immediately with request_id for polling
 */
export async function animateHero(params: {
  beforeImageUrl: string;
  afterImageUrl: string;
  niche: string;
  durationSeconds?: number;
}): Promise<AnimationJob> {
  const prompt = buildTransitionPrompt(params.niche);

  const res = await fetch(`${BACKEND}/site-factory/animate-hero`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      before_image_url: params.beforeImageUrl,
      after_image_url: params.afterImageUrl,
      transition_prompt: prompt,
      duration_seconds: params.durationSeconds ?? 5,
      quality: 'high',
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`Animation submit failed: ${res.status}`);
  return res.json() as Promise<AnimationJob>;
}

/**
 * Poll for animation completion
 * Call every 10s until status = COMPLETED
 */
export async function pollAnimation(requestId: string): Promise<{
  status: string;
  video_url?: string;
}> {
  const falKey = process.env.FAL_API_KEY ?? '';
  if (!falKey) throw new Error('FAL_API_KEY not configured');

  const res = await fetch(
    `https://queue.fal.run/fal-ai/kling-video/v3/requests/${requestId}`,
    {
      headers: { Authorization: `Key ${falKey}` },
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!res.ok) return { status: 'polling_error' };

  const data = await res.json() as {
    status?: string;
    video?: { url: string };
  };

  return {
    status: data.status ?? 'unknown',
    video_url: data.video?.url,
  };
}

function buildTransitionPrompt(niche: string): string {
  const PROMPTS: Record<string, string> = {
    vegan_food: 'Smooth transformation from sad wilted vegetables to vibrant colorful gourmet vegan dish. Natural flowing motion, ingredients assembling beautifully. Cinematic food photography movement.',
    eco_turismo: 'Seamless transition from neglected overgrown landscape to pristine paradise nature scene. Light blooms, water clears, nature awakens. Cinematic nature documentary feel.',
    pool_cleaning: 'Pool transforms from green murky algae water to crystal clear sparkling blue. Water clears from center outward. Satisfying cleaning transformation. Cinematic slow motion.',
    salud_bienestar: 'Space transforms from cluttered chaotic room to serene peaceful wellness studio. Light fills in, clutter disappears, calm emerges. Meditative pacing.',
    general: 'Smooth professional transformation revealing the best version of the business. Clean modern reveal. Satisfying before-to-after. Cinematic quality.',
  };

  return PROMPTS[niche] ?? PROMPTS['general']!;
}
