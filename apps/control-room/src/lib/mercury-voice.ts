/**
 * Mercury Voice Gateway — Synthia™ Sphere OS
 *
 * Provider chain (controlled by VOICE_PROVIDER env):
 *   1. Rime  (RIME_API_TOKEN present, VOICE_PROVIDER='rime' default)
 *   2. ElevenLabs (legacy env present, flagged provider='elevenlabs-legacy')
 *   3. Text-only fallback { fallback:true, text }
 *
 * Secrets: RIME_API_TOKEN, ELEVEN_LABS_API_KEY / ELEVENLABS_API_KEY.
 * Never log token values. Client code never sees audio vendor tokens.
 */

import type { SphereAgentId, SphereLocale } from '@/shared/council-events';
import { rimeSynthesize, pickSpeaker } from '@/lib/voice/rime-voice';
import type { VoiceLang } from '@/lib/voice/rime-voice';

// ---------------------------------------------------------------------------
// Per-sphere ElevenLabs legacy config (kept for fallback continuity)
// ---------------------------------------------------------------------------

interface ElevenLabsVoiceConfig {
  elevenLabsVoiceId: string;
  locale: SphereLocale;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  gender: 'female' | 'male';
}

const SPHERE_VOICE_CONFIG: Record<SphereAgentId, ElevenLabsVoiceConfig> = {
  synthia: {
    elevenLabsVoiceId: process.env.SPHERE_SYNTHIA_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL',
    locale: 'es-MX', stability: 0.75, similarityBoost: 0.88, style: 0.45, useSpeakerBoost: true, gender: 'female',
  },
  alex: {
    elevenLabsVoiceId: process.env.SPHERE_ALEX_VOICE_ID ?? 'ErXwobaYiN019PkySvjV',
    locale: 'es-MX', stability: 0.72, similarityBoost: 0.85, style: 0.40, useSpeakerBoost: true, gender: 'female',
  },
  cazadora: {
    elevenLabsVoiceId: process.env.SPHERE_CAZADORA_VOICE_ID ?? 'AZnzlk1XvdvUeBnXmlld',
    locale: 'es-CO', stability: 0.62, similarityBoost: 0.82, style: 0.65, useSpeakerBoost: true, gender: 'female',
  },
  forjadora: {
    elevenLabsVoiceId: process.env.SPHERE_FORJADORA_VOICE_ID ?? 'MF3mGyEYCl7XYWbV9V6O',
    locale: 'es-AR', stability: 0.70, similarityBoost: 0.84, style: 0.50, useSpeakerBoost: true, gender: 'female',
  },
  seductora: {
    elevenLabsVoiceId: process.env.SPHERE_SEDUCTORA_VOICE_ID ?? 'jsCqWAovK2LkecY7zXl4',
    locale: 'es-CU', stability: 0.52, similarityBoost: 0.78, style: 0.72, useSpeakerBoost: true, gender: 'female',
  },
  consejo: {
    elevenLabsVoiceId: process.env.SPHERE_CONSEJO_VOICE_ID ?? 'TxGEqnHWrfWFTfGW9XjX',
    locale: 'es-CL', stability: 0.68, similarityBoost: 0.80, style: 0.38, useSpeakerBoost: false, gender: 'male',
  },
  'dr-economia': {
    elevenLabsVoiceId: process.env.SPHERE_DR_ECONOMIA_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB',
    locale: 'es-VE', stability: 0.60, similarityBoost: 0.78, style: 0.55, useSpeakerBoost: true, gender: 'male',
  },
  'dra-cultura': {
    elevenLabsVoiceId: process.env.SPHERE_DRA_CULTURA_VOICE_ID ?? 'XrExE9yKIg1WjnnlVkGX',
    locale: 'es-PE', stability: 0.72, similarityBoost: 0.83, style: 0.48, useSpeakerBoost: true, gender: 'female',
  },
  'ing-teknos': {
    elevenLabsVoiceId: process.env.SPHERE_ING_TEKNOS_VOICE_ID ?? 'flq6f7yk4E4fJM5XTYuZ',
    locale: 'es-PR', stability: 0.58, similarityBoost: 0.76, style: 0.60, useSpeakerBoost: true, gender: 'male',
  },
  'la-vigilante': {
    elevenLabsVoiceId: process.env.SPHERE_LA_VIGILANTE_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB',
    locale: 'es-MX', stability: 0.85, similarityBoost: 0.90, style: 0.30, useSpeakerBoost: true, gender: 'female',
  },
};

// ---------------------------------------------------------------------------
// Response types (exported, backward-compatible + new fields)
// ---------------------------------------------------------------------------

export interface VoiceSuccessResult {
  ok: true;
  audio: string; // base64 mp3
  voiceId: string;
  model: string;
  provider: 'rime' | 'elevenlabs-legacy';
  agentId: SphereAgentId;
  locale: SphereLocale;
  speaker?: string;
  durationEstimateMs?: number;
}

export interface VoiceFallbackResult {
  ok: false;
  fallback: true;
  text: string;
  agentId: SphereAgentId;
  reason: string;
  provider?: 'text-fallback';
}

export type VoiceResult = VoiceSuccessResult | VoiceFallbackResult;

// ---------------------------------------------------------------------------
// Text sanitisation helpers
// ---------------------------------------------------------------------------

/** Strip control characters and cap at 2000 chars per architecture spec. */
function sanitizeText(text: string): string {
  // Remove ASCII control chars except tab/newline/CR
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 2000);
}

// ---------------------------------------------------------------------------
// Main synthesis function
// ---------------------------------------------------------------------------

export async function synthesizeSphereVoice(
  agentId: SphereAgentId,
  text: string,
  opts?: { lang?: 'es' | 'en'; produced?: boolean },
): Promise<VoiceResult> {
  const safeText = sanitizeText(text.trim());
  if (!safeText) return makeFallback(agentId, text, 'empty text');

  const lang: VoiceLang = opts?.lang ?? 'es';
  const provider = process.env.VOICE_PROVIDER ?? 'rime';
  const elevenKey =
    process.env.ELEVEN_LABS_API_KEY ?? process.env.ELEVENLABS_API_KEY;

  // Route 1: Rime (default, token-gated)
  if (provider !== 'off' && (provider === 'rime' || !elevenKey)) {
    if (process.env.RIME_API_TOKEN) {
      const rimeResult = await tryRime(agentId, safeText, lang, opts);
      if (rimeResult.ok) return rimeResult;
    }
  }

  // Route 2: ElevenLabs legacy
  if (provider !== 'off' && elevenKey) {
    const elResult = await tryElevenLabs(agentId, safeText, elevenKey);
    if (elResult.ok) return elResult;
  }

  // Route 3: Text fallback
  return makeFallback(agentId, safeText, 'all voice providers failed or unconfigured');
}

// ---------------------------------------------------------------------------
// Rime REST provider
// ---------------------------------------------------------------------------

async function tryRime(
  agentId: SphereAgentId,
  text: string,
  lang: VoiceLang,
  opts?: { produced?: boolean },
): Promise<VoiceResult> {
  const result = await rimeSynthesize(agentId, text, lang, opts);
  if (!result.ok) return makeFallback(agentId, text, result.reason);
  const choice = pickSpeaker(agentId, lang, opts);
  const b64 = result.audio.toString('base64');
  return {
    ok: true,
    audio: b64,
    voiceId: result.speaker,
    model: result.modelId,
    provider: 'rime',
    agentId,
    locale: SPHERE_VOICE_CONFIG[agentId].locale,
    speaker: result.speaker,
    durationEstimateMs: result.ttfbMs, // rough proxy; real dur unknown until played
  };
  // `choice` is used only for type-narrowing the lang path; suppress unused warning:
  void choice;
}

// ---------------------------------------------------------------------------
// ElevenLabs legacy provider (unchanged logic, updated provider label)
// ---------------------------------------------------------------------------

async function tryElevenLabs(
  agentId: SphereAgentId,
  text: string,
  apiKey: string,
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
          Accept: 'audio/mpeg',
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
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 200)}`);
    }
    const buffer = await res.arrayBuffer();
    const audio = Buffer.from(buffer).toString('base64');
    const wordCount = text.split(/\s+/).length;
    const durationEstimateMs = Math.round((wordCount / 150) * 60 * 1000);
    return {
      ok: true,
      audio,
      voiceId: config.elevenLabsVoiceId,
      model: 'eleven_multilingual_v2',
      provider: 'elevenlabs-legacy',
      agentId,
      locale: config.locale,
      durationEstimateMs,
    };
  } catch (err) {
    console.warn(`[mercury-voice] ElevenLabs failed for ${agentId}:`, (err as Error).message);
    return makeFallback(agentId, text, 'elevenlabs-error');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFallback(agentId: SphereAgentId, text: string, reason: string): VoiceFallbackResult {
  return { ok: false, fallback: true, text, agentId, reason, provider: 'text-fallback' };
}

export { SPHERE_VOICE_CONFIG };
