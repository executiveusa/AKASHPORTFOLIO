/**
 * Google Maps Business Discovery — Site Factory
 * Finds businesses in any city/niche that need websites
 * Generalizes the existing CDMX-locked google-maps.ts
 */

export interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  review_count: number;
  place_id: string;
  needs_site: boolean;
  priority_score: number;
}

const NICHE_KEYWORDS: Record<string, string[]> = {
  vegan_food: ['restaurante vegano', 'comida plant-based', 'vegan restaurant', 'cocina vegana'],
  eco_turismo: ['ecoturismo', 'tour naturaleza', 'aventura ecológica', 'cenote tours'],
  salud_bienestar: ['yoga', 'wellness', 'meditación', 'terapia holística', 'spa natural'],
  pool_cleaning: ['limpieza alberca', 'pool service', 'mantenimiento piscina'],
  general: ['negocio local', 'servicio'],
};

export async function searchBusinesses(params: {
  niche: string;
  city: string;
  country?: string;
  count?: number;
}): Promise<BusinessResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[google-maps-client] GOOGLE_MAPS_API_KEY not set — returning mock data');
    return getMockBusinesses(params);
  }

  const keywords = NICHE_KEYWORDS[params.niche] ?? NICHE_KEYWORDS['general']!;
  const query = `${keywords[0]} en ${params.city}`;
  const count = params.count ?? 10;

  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('language', 'es');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Google Maps API error: ${res.status}`);

  const data = await res.json() as {
    results?: Array<{
      name: string;
      formatted_address: string;
      rating?: number;
      user_ratings_total?: number;
      place_id: string;
      website?: string;
    }>;
  };

  return (data.results ?? [])
    .slice(0, count)
    .map(place => ({
      name: place.name,
      address: place.formatted_address,
      website: place.website,
      rating: place.rating ?? 0,
      review_count: place.user_ratings_total ?? 0,
      place_id: place.place_id,
      needs_site: !place.website,
      priority_score: calculatePriorityScore(place),
    }))
    .sort((a, b) => b.priority_score - a.priority_score);
}

function calculatePriorityScore(place: {
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}): number {
  let score = 0;
  if (!place.website) score += 50;
  if ((place.rating ?? 0) >= 4.0) score += 20;
  if ((place.user_ratings_total ?? 0) >= 10) score += 20;
  if ((place.user_ratings_total ?? 0) >= 50) score += 10;
  return Math.min(score, 100);
}

function getMockBusinesses(params: { niche: string; city: string; count?: number }): BusinessResult[] {
  const count = params.count ?? 10;
  return Array.from({ length: count }, (_, i) => ({
    name: `${params.niche.replace(/_/g, ' ')} ${params.city} #${i + 1}`,
    address: `Calle ${i + 1}, ${params.city}`,
    rating: 3.5 + Math.random() * 1.5,
    review_count: Math.floor(Math.random() * 100) + 5,
    place_id: `mock_${i}`,
    needs_site: i % 3 !== 0,
    priority_score: Math.floor(Math.random() * 60) + 40,
  }));
}
