/**
 * POST /api/alex/voice
 * Generate ElevenLabs voice audio from text using ALEX™'s CDMX voice
 * Returns: { audio: base64MP3, voiceId, model }
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 });
  }

  const { text, voiceId } = await req.json() as { text?: string; voiceId?: string };

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  // Limit text to 5000 chars to keep latency low
  const safeText = text.slice(0, 5000);
  const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

  try {
    const res = await fetch(
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
            style: 0.45,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('ElevenLabs error:', errText);
      return NextResponse.json({ error: 'Voice generation failed' }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    const audio = Buffer.from(buffer).toString('base64');

    return NextResponse.json({
      audio,
      voiceId: selectedVoiceId,
      model: 'eleven_multilingual_v2',
      lengthChars: safeText.length,
    });
  } catch (error) {
    console.error('Voice route error:', error);
    return NextResponse.json({ error: 'Voice generation failed' }, { status: 500 });
  }
}

/**
 * GET /api/alex/voice/voices — list available ElevenLabs voices
 */
export async function GET() {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 });
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 502 });
    }

    const data = await res.json() as {
      voices?: Array<{ voice_id: string; name: string; labels?: Record<string, string> }>;
    };

    // Filter to Spanish/multilingual voices
    const voices = (data.voices ?? [])
      .filter((v) =>
        v.labels?.language === 'es' ||
        v.labels?.accent?.includes('spanish') ||
        v.labels?.accent?.includes('mexican')
      )
      .map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels }));

    return NextResponse.json({ voices, total: voices.length });
  } catch (error) {
    console.error('List voices error:', error);
    return NextResponse.json({ error: 'Failed to list voices' }, { status: 500 });
  }
}
