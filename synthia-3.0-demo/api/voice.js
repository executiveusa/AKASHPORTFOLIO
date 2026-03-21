/**
 * POST /api/voice
 * Synthia 3.0 — ElevenLabs PersonaPlex Voice Synthesis
 * Returns base64 MP3 for a given agent's text.
 *
 * Body: { text: string, agentId?: string, voiceId?: string, lang?: "es"|"en" }
 * Response: { audio: base64, voiceId, agentId, durationMs? }
 */

export const config = { runtime: 'edge' };

// Per-agent ElevenLabs voice IDs — swap these once voices are synced
const AGENT_VOICES = {
  'synthia-prime':   process.env.VOICE_SYNTHIA   || 'pNInz6obpgDQGcFmaJgB', // warm / authority
  'agent-marketing': process.env.VOICE_MARKETING || 'EXAVITQu4vr4xnSDxMaL', // energetic
  'agent-coder':     process.env.VOICE_CODER     || 'VR6AewLTigWG4xSOukaG', // crisp / technical
  'agent-sales':     process.env.VOICE_SALES     || 'ErXwobaYiN019PkySvjV', // smooth / persuasive
  'agent-legal':     process.env.VOICE_LEGAL     || 'MF3mGyEYCl7XYWbV9V6O', // measured / precise
};

const DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ELEVEN_LABS_API_KEY not set — voices pending sync' }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const { text, agentId, voiceId, lang = 'en' } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'text required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const safeText = text.slice(0, 4000);
  const selectedVoiceId =
    voiceId ||
    (agentId && AGENT_VOICES[agentId]) ||
    DEFAULT_VOICE;

  const start = Date.now();

  try {
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: lang === 'es' ? 0.5 : 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs error:', errText);
      return new Response(
        JSON.stringify({ error: 'Voice generation failed', detail: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const buffer = await elevenRes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const audio = btoa(binary);

    return new Response(
      JSON.stringify({
        audio,
        voiceId: selectedVoiceId,
        agentId: agentId || 'synthia-prime',
        lengthChars: safeText.length,
        durationMs: Date.now() - start,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('Voice synthesis error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Voice synthesis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
