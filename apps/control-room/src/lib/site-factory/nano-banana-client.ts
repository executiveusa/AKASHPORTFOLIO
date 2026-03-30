/**
 * Nano Banana 2 Client — Gemini Flash Image
 * Hero image generation for site factory
 * Via SYNTHIA™ backend → Gemini API
 */

const BACKEND = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';

export interface GeneratedImage {
  status: string;
  image_url: string;
  format: string;
  prompt: string;
  model: string;
  timestamp: string;
}

/**
 * Generate a hero image for a business niche
 * Uses Nano Banana 2 (Gemini Flash Image) via backend
 */
export async function generateHeroImage(params: {
  niche: string;
  city: string;
  businessName: string;
  primaryColor?: string;
  beforeAfter?: boolean;
  style?: 'photorealistic' | 'illustrated' | 'minimal';
}): Promise<GeneratedImage> {
  const prompt = buildImagePrompt(params);

  const res = await fetch(`${BACKEND}/site-factory/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      style: params.style ?? 'photorealistic',
      resolution: '2K',
      aspect_ratio: '16:9',
      reference_colors: params.primaryColor ? [params.primaryColor] : undefined,
      niche: params.niche,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) throw new Error(`Image generation failed: ${res.status}`);
  return res.json() as Promise<GeneratedImage>;
}

function buildImagePrompt(params: {
  niche: string;
  city: string;
  businessName: string;
  beforeAfter?: boolean;
}): string {
  const NICHE_PROMPTS: Record<string, { clean: string; dirty: string }> = {
    vegan_food: {
      clean: 'Beautiful colorful vegan dish arranged artistically, fresh vegetables, herbs, natural light, restaurant quality presentation, white plate, clean background',
      dirty: 'Wilted vegetables, sad looking food, poor presentation, dim lighting, empty restaurant, neglected produce',
    },
    eco_turismo: {
      clean: 'Lush Mexican jungle waterfall, crystal clear cenote, turquoise water, sunlight filtering through trees, paradise landscape, pristine nature',
      dirty: 'Overgrown neglected trail, murky water, litter visible, faded signage, abandoned tourist area',
    },
    pool_cleaning: {
      clean: 'Sparkling blue pool, crystal clear water, luxury backyard, perfect reflections, modern poolside furniture, bright sunshine',
      dirty: 'Green algae-filled pool, murky brown water, debris floating, neglected poolside, faded tiles',
    },
    salud_bienestar: {
      clean: 'Peaceful yoga studio, natural light, wooden floors, plants, meditation cushions, calm serene atmosphere, wellness space',
      dirty: 'Cluttered wellness space, dim lighting, disorganized equipment, uninviting environment',
    },
    general: {
      clean: `Professional ${params.niche} business in ${params.city}, modern clean space, welcoming atmosphere, high quality, professional service`,
      dirty: `Outdated ${params.niche} business, needs renovation, poor presentation`,
    },
  };

  const prompts = NICHE_PROMPTS[params.niche] ?? NICHE_PROMPTS['general']!;
  const base = params.beforeAfter ? prompts.dirty : prompts.clean;

  return `${base}. White seamless background at edges for web blending. No text. No logos. Photorealistic. 16:9 composition. Professional product photography quality.`;
}
