/**
 * Mercury Voice Gateway — Synthia™ Sphere OS
 * 
 * Routes voice synthesis per sphere agent with authentic LATAM Spanish accents.
 * Primary:   Mercury 2 Inception API (streaming + duplex)
 * Secondary: ElevenLabs multilingual_v2 (REST, non-streaming)
 * Fallback:  Text-only { fallback: true, text }
 * 
 * Each sphere has its own voice ID and regional accent settings.
 * Configure via ENV vars — see SPHERE_VOICE_CONFIG below.
 */

import type { SphereAgentId, SphereLocale } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Per-sphere voice configuration
// Set ENV vars to override defaults with real Spanish-accent voice IDs
// from ElevenLabs Voice Library: https://elevenlabs.io/voice-library
// ---------------------------------------------------------------------------

interface VoiceConfig {
  elevenLabsVoiceId: string; // from ElevenLabs Voice Library
  locale: SphereLocale;
  stability: number;       // 0..1, higher = more consistent
  similarityBoost: number; // 0..1, higher = closer to reference
  style: number;           // 0..1, higher = more expressive
  useSpeakerBoost: boolean;
  gender: 'female' | 'male';
  accentDescription: string; // for docs/debugging
}

const SPHERE_VOICE_CONFIG: Record<SphereAgentId, VoiceConfig> = {
  // ╔═══════════════════════════════════╗
  // ║  MEXICO CITY — es-MX              ║
  // ╚═══════════════════════════════════╝
  'synthia': {
    elevenLabsVoiceId: process.env.SPHERE_SYNTHIA_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    locale: 'es-MX',
    stability: 0.75,
    similarityBoost: 0.88,
    style: 0.45,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Ciudad de México — clara, cálida, ejecutiva',
  },
  'alex': {
    elevenLabsVoiceId: process.env.SPHERE_ALEX_VOICE_ID || 'ErXwobaYiN019PkySvjV',
    locale: 'es-MX',
    stability: 0.72,
    similarityBoost: 0.85,
    style: 0.40,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Ciudad de México — cálida, directa, acento chilango auténtico',
  },
  // ╔═══════════════════════════════════╗
  // ║  COLOMBIA — es-CO (Bogotá)        ║
  // ╚═══════════════════════════════════╝
  'cazadora': {
    elevenLabsVoiceId: process.env.SPHERE_CAZADORA_VOICE_ID || 'AZnzlk1XvdvUeBnXmlld',
    locale: 'es-CO',
    stability: 0.62,
    similarityBoost: 0.82,
    style: 0.65,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Bogotá, Colombia — energética, directa, acento rolo',
  },
  // ╔═══════════════════════════════════╗
  // ║  ARGENTINA — es-AR (Buenos Aires) ║
  // ╚═══════════════════════════════════╝
  'forjadora': {
    elevenLabsVoiceId: process.env.SPHERE_FORJADORA_VOICE_ID || 'MF3mGyEYCl7XYWbV9V6O',
    locale: 'es-AR',
    stability: 0.70,
    similarityBoost: 0.84,
    style: 0.50,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Buenos Aires, Argentina — porteña, técnica, seseo invertido',
  },
  // ╔═══════════════════════════════════╗
  // ║  CUBA — es-CU (Havana)            ║
  // ╚═══════════════════════════════════╝
  'seductora': {
    elevenLabsVoiceId: process.env.SPHERE_SEDUCTORA_VOICE_ID || 'jsCqWAovK2LkecY7zXl4',
    locale: 'es-CU',
    stability: 0.52,
    similarityBoost: 0.78,
    style: 0.72,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'La Habana, Cuba — musical, seductora, ritmo caribeño',
  },
  // ╔═══════════════════════════════════╗
  // ║  CHILE — es-CL (Santiago)         ║
  // ╚═══════════════════════════════════╝
  'consejo': {
    elevenLabsVoiceId: process.env.SPHERE_CONSEJO_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX',
    locale: 'es-CL',
    stability: 0.68,
    similarityBoost: 0.80,
    style: 0.38,
    useSpeakerBoost: false,
    gender: 'male',
    accentDescription: 'Santiago, Chile — sereno, sabio, aspiración suave',
  },
  // ╔═══════════════════════════════════╗
  // ║  VENEZUELA — es-VE (Caracas)      ║
  // ╚═══════════════════════════════════╝
  'dr-economia': {
    elevenLabsVoiceId: process.env.SPHERE_DR_ECONOMIA_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
    locale: 'es-VE',
    stability: 0.60,
    similarityBoost: 0.78,
    style: 0.55,
    useSpeakerBoost: true,
    gender: 'male',
    accentDescription: 'Caracas, Venezuela — analítico, acento caribeño continental',
  },
  // ╔═══════════════════════════════════╗
  // ║  PERU — es-PE (Lima)              ║
  // ╚═══════════════════════════════════╝
  'dra-cultura': {
    elevenLabsVoiceId: process.env.SPHERE_DRA_CULTURA_VOICE_ID || 'XrExE9yKIg1WjnnlVkGX',
    locale: 'es-PE',
    stability: 0.72,
    similarityBoost: 0.83,
    style: 0.48,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Lima, Perú — clara, neutral sudamericana, articulada',
  },
  // ╔═══════════════════════════════════╗
  // ║  PUERTO RICO — es-PR (San Juan)   ║
  // ╚═══════════════════════════════════╝
  'ing-teknos': {
    elevenLabsVoiceId: process.env.SPHERE_ING_TEKNOS_VOICE_ID || 'flq6f7yk4E4fJM5XTYuZ',
    locale: 'es-PR',
    stability: 0.58,
    similarityBoost: 0.76,
    style: 0.60,
    useSpeakerBoost: true,
    gender: 'male',
    accentDescription: 'San Juan, Puerto Rico — urbano, rápido, caribeño tech',
  },
  // ╔═══════════════════════════════════╗
  // ║  GUARDIÁN — la-vigilante          ║
  // ╚═══════════════════════════════════╝
  'la-vigilante': {
    elevenLabsVoiceId: process.env.SPHERE_LA_VIGILANTE_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
    locale: 'es-MX',
    stability: 0.85,
    similarityBoost: 0.90,
    style: 0.30,
    useSpeakerBoost: true,
    gender: 'female',
    accentDescription: 'Español neutro — formal, vigilante, oscura',
  },
};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface VoiceSuccessResult {
  ok: true;
  audio: string; // base64 mp3
  voiceId: string;
  model: string;
  provider: 'mercury2' | 'elevenlabs';
  agentId: SphereAgentId;
  locale: SphereLocale;
  durationEstimateMs?: number;
}

export interface VoiceFallbackResult {
  ok: false;
  fallback: true;
  text: string;
  agentId: SphereAgentId;
  reason: string;
}

export type VoiceResult = VoiceSuccessResult | VoiceFallbackResult;

// ---------------------------------------------------------------------------
// Main synthesis function
// ---------------------------------------------------------------------------

export async function synthesizeSphereVoice(
  agentId: SphereAgentId,
  text: string
): Promise<VoiceResult> {
  const safeText = text.trim().slice(0, 5000);
  if (!safeText) return fallback(agentId, text, 'empty text');

  // Route 1: Mercury 2 Inception API
  if (process.env.MERCURY_API_KEY && process.env.MERCURY_API_ENDPOINT) {
    const result = await tryMercury2(agentId, safeText);
    if (result.ok) return result;
  }

  // Route 2: ElevenLabs multilingual_v2
  const elevenKey = process.env.ELEVEN_LABS_API_KEY || process.env.ELEVENLABS_API_KEY;
  if (elevenKey) {
    const result = await tryElevenLabs(agentId, safeText, elevenKey);
    if (result.ok) return result;
  }

  // Route 3: Text fallback
  return fallback(agentId, safeText, 'all voice providers failed or unconfigured');
}

// ---------------------------------------------------------------------------
// Mercury 2 Inception API
// ---------------------------------------------------------------------------

async function tryMercury2(agentId: SphereAgentId, text: string): Promise<VoiceResult> {
  const config = SPHERE_VOICE_CONFIG[agentId];
  try {
    const endpoint = `${process.env.MERCURY_API_ENDPOINT}/v1/tts`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCURY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        locale: config.locale,
        voice_id: agentId,
        persona: agentId,
        streaming: false,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`Mercury2 HTTP ${res.status}`);

    const data = await res.json() as { audio: string; duration_ms?: number };
    return {
      ok: true,
      audio: data.audio,
      voiceId: agentId,
      model: 'mercury2-inception',
      provider: 'mercury2',
      agentId,
      locale: config.locale,
      durationEstimateMs: data.duration_ms,
    };
  } catch (err) {
    console.warn(`[mercury-voice] Mercury2 failed for ${agentId}:`, (err as Error).message);
    return fallback(agentId, text, 'mercury2-error');
  }
}

// ---------------------------------------------------------------------------
// ElevenLabs multilingual_v2
// ---------------------------------------------------------------------------

async function tryElevenLabs(
  agentId: SphereAgentId,
  text: string,
  apiKey: string
): Promise<VoiceResult> {
  const config = SPHERE_VOICE_CONFIG[agentId];
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          language_code: config.locale,
          voice_settings: {
            stability: config.stability,
            similarity_boost: config.similarityBoost,
            style: config.style,
            use_speaker_boost: config.useSpeakerBoost,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 200)}`);
    }

    const buffer = await res.arrayBuffer();
    const audio = Buffer.from(buffer).toString('base64');

    // Estimate duration: ~150 WPM average for Spanish
    const wordCount = text.split(/\s+/).length;
    const durationEstimateMs = Math.round((wordCount / 150) * 60 * 1000);

    return {
      ok: true,
      audio,
      voiceId: config.elevenLabsVoiceId,
      model: 'eleven_multilingual_v2',
      provider: 'elevenlabs',
      agentId,
      locale: config.locale,
      durationEstimateMs,
    };
  } catch (err) {
    console.warn(`[mercury-voice] ElevenLabs failed for ${agentId}:`, (err as Error).message);
    return fallback(agentId, text, 'elevenlabs-error');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fallback(agentId: SphereAgentId, text: string, reason: string): VoiceFallbackResult {
  console.warn(`[mercury-voice] Using text fallback for ${agentId}: ${reason}`);
  return { ok: false, fallback: true, text, agentId, reason };
}

export { SPHERE_VOICE_CONFIG };
