/**
 * Google Maps + Places integration for ALEX™
 * Provides neighborhood intelligence for Santa María la Ribera, CDMX
 */

export const SANTA_MARIA_CENTER = {
  lat: 19.4412,
  lng: -99.1547,
};

export interface PlaceResult {
  name: string;
  address: string;
  rating?: number;
  placeId?: string;
  types?: string[];
  openNow?: boolean;
}

/**
 * Search nearby places in Santa María la Ribera
 * Uses Google Places Nearby Search API
 */
export async function searchNearby(
  keyword: string,
  options: {
    radius?: number;
    type?: string;
    maxResults?: number;
  } = {}
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const { radius = 1500, type, maxResults = 5 } = options;

  const params = new URLSearchParams({
    location: `${SANTA_MARIA_CENTER.lat},${SANTA_MARIA_CENTER.lng}`,
    radius: String(radius),
    keyword,
    key: apiKey,
    language: 'es',
    ...(type ? { type } : {}),
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
    );
    if (!res.ok) return [];

    const data = await res.json() as {
      results?: Array<{
        name?: string;
        vicinity?: string;
        rating?: number;
        place_id?: string;
        types?: string[];
        opening_hours?: { open_now?: boolean };
      }>;
    };

    return (data.results ?? []).slice(0, maxResults).map((p) => ({
      name: p.name ?? '',
      address: p.vicinity ?? '',
      rating: p.rating,
      placeId: p.place_id,
      types: p.types,
      openNow: p.opening_hours?.open_now,
    }));
  } catch {
    return [];
  }
}

/**
 * Get Google Maps embed URL for Santa María la Ribera
 * Use in <iframe src={url} /> components
 */
export function getMapEmbedUrl(options: {
  zoom?: number;
  query?: string;
  mapType?: 'roadmap' | 'satellite';
} = {}): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return '';

  const { zoom = 15, query = 'Santa María la Ribera, Ciudad de México', mapType = 'roadmap' } = options;

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    zoom: String(zoom),
    maptype: mapType,
    language: 'es',
  });

  return `https://www.google.com/maps/embed/v1/place?${params}`;
}

/**
 * Static map image URL for use in <img> tags
 * Shows Santa María la Ribera neighborhood
 */
export function getStaticMapUrl(options: {
  width?: number;
  height?: number;
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
} = {}): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return '';

  const { width = 600, height = 400, zoom = 15, markers = [] } = options;

  const params = new URLSearchParams({
    center: `${SANTA_MARIA_CENTER.lat},${SANTA_MARIA_CENTER.lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    maptype: 'roadmap',
    language: 'es',
    key: apiKey,
  });

  // Add markers
  markers.forEach((m) => {
    const label = m.label ? `label:${m.label}|` : '';
    params.append('markers', `${label}${m.lat},${m.lng}`);
  });

  // Default marker at kiosco morisco
  if (markers.length === 0) {
    params.append(
      'markers',
      `color:red|label:K|${SANTA_MARIA_CENTER.lat},${SANTA_MARIA_CENTER.lng}`
    );
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params}`;
}

/**
 * Answer "where can I eat near me?" type questions for CDMX Santa María la Ribera
 * Returns formatted Spanish-language text response
 */
export async function answerLocationQuery(query: string): Promise<string> {
  const results = await searchNearby(query, { maxResults: 3 });

  if (results.length === 0) {
    return `No encontré resultados para "${query}" cerca de Santa María la Ribera. Prueba buscando en Google Maps directamente.`;
  }

  const lines = results.map((r, i) => {
    const stars = r.rating ? ` (${r.rating}★)` : '';
    const open = r.openNow === true ? ' — abierto ahora' : r.openNow === false ? ' — cerrado ahora' : '';
    return `${i + 1}. **${r.name}**${stars} — ${r.address}${open}`;
  });

  return `Aquí tienes opciones cerca de la Ribera:\n${lines.join('\n')}`;
}
