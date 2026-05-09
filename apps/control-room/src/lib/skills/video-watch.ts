/**
 * Video Watch Skill — SYNTHIA™ Sphere OS
 * Any sphere agent can call watchVideo() to analyze a YouTube URL.
 * DRA. CULTURA (content), CAZADORA (competitor), ING. TEKNOS (technical), MORPHO (summarize)
 */

export interface VideoWatchOptions {
  url: string;
  question?: string;
  startTime?: string;
  endTime?: string;
  maxFrames?: number;
  resolution?: 512 | 1024;
  noWhisper?: boolean;
  sphereId?: string;
}

export interface VideoWatchResult {
  success: boolean;
  url: string;
  question: string | null;
  frames: Array<{
    path: string;
    timestamp: string;
    data: string;
  }>;
  transcript: string | null;
  stats: {
    totalFrames: number;
    framesInResponse: number;
    hasTranscript: boolean;
    processingMs: number;
  };
  error?: string;
}

export async function watchVideo(options: VideoWatchOptions): Promise<VideoWatchResult> {
  const isVercel = process.env.VERCEL === '1';
  const backendUrl = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND_URL;

  let endpoint: string;
  if (isVercel && backendUrl) {
    endpoint = `${backendUrl}/video/watch`;
  } else {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    endpoint = `${appUrl}/api/video/watch`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    return {
      success: false,
      url: options.url,
      question: options.question || null,
      frames: [],
      transcript: null,
      stats: { totalFrames: 0, framesInResponse: 0, hasTranscript: false, processingMs: 0 },
      error: errorData.error || `Request failed: ${res.status}`,
    };
  }

  return res.json();
}

export const videoWatchSkill = {
  id: 'video-watch',
  name_es: 'Analizar Video de YouTube',
  name_en: 'Analyze YouTube Video',
  category: 'research' as const,
  owner_sphere: 'dra-cultura' as const,
  pain_point_es: 'Los agentes no pueden ver videos — pierden contexto visual de contenido viral, demos de competidores, y tutoriales técnicos.',
  solution_es: 'Descarga el video, extrae frames con timestamps, transcribe con Whisper, y entrega análisis completo.',
  wow_demo: 'Pega una URL de YouTube: SYNTHIA™ analiza qué hizo viral ese video en los primeros 3 segundos.',
  prompt_template: `Analiza este video usando la habilidad /watch:

URL: {{url}}
{{#if question}}Pregunta específica: {{question}}{{/if}}
{{#if startTime}}Enfócate en: {{startTime}} → {{endTime}}{{/if}}

Pasos:
1. Llama a watchVideo({ url: "{{url}}", question: "{{question}}", sphereId: "dra-cultura" })
2. Lee los frames en orden cronológico
3. Combina frames + transcript para responder
4. Cita timestamps específicos`,
  inputs: [
    { name: 'url', type: 'url' as const, required: true, placeholder: 'https://youtube.com/watch?v=...' },
    { name: 'question', type: 'text' as const, required: false, placeholder: '¿Qué hook usaron?' },
    { name: 'startTime', type: 'text' as const, required: false, placeholder: '0:30' },
    { name: 'endTime', type: 'text' as const, required: false, placeholder: '1:00' },
  ],
  outputs: [
    { name: 'analysis', format: 'markdown' as const, description: 'Análisis con referencias a frames y transcript' },
    { name: 'frames', format: 'json' as const, description: 'Array de frames con base64 JPEG y timestamp' },
    { name: 'transcript', format: 'text' as const, description: 'Transcripción con timestamps' },
  ],
  tier_required: 'starter' as const,
};

export const videoPresets = {
  contentAnalysis: (url: string) => watchVideo({
    url,
    question: '¿Cuál es la estructura del hook? ¿Qué hace viral este contenido?',
    maxFrames: 60,
    sphereId: 'dra-cultura',
  }),

  competitorResearch: (url: string) => watchVideo({
    url,
    question: '¿Qué propuesta de valor comunican? ¿Cómo posicionan su producto?',
    maxFrames: 80,
    sphereId: 'cazadora',
  }),

  technicalReview: (url: string) => watchVideo({
    url,
    question: '¿Qué tecnología usan? ¿Hay patrones de arquitectura o código visibles?',
    maxFrames: 100,
    resolution: 1024,
    sphereId: 'ing-teknos',
  }),

  summarize: (url: string) => watchVideo({
    url,
    question: 'Resume los puntos principales, estructura y momentos clave.',
    maxFrames: 60,
    sphereId: 'morpho',
  }),
};
