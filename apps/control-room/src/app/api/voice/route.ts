import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface VoiceSynthesis {
  id: string;
  text: string;
  voiceId: string;
  audioUrl: string;
  lipSyncData: LipSyncFrame[];
  duration: number;
}

interface LipSyncFrame {
  time: number; // milliseconds
  viseme: string; // 'a', 'e', 'i', 'o', 'u', 'p', 'b', 'm', etc.
  intensity: number; // 0-1
}

// Cache for generated audio
const audioCache = new Map<string, VoiceSynthesis>();

// POST: Synthesize text to speech with avatar lip-sync
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId = 'ivette-primary', language = 'es' } = body;

    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    const cacheKey = `${text}-${voiceId}`;
    if (audioCache.has(cacheKey)) {
      return NextResponse.json(audioCache.get(cacheKey));
    }

    // Mock lip-sync generation
    const lipSyncData = generateLipSync(text, language);
    const estimatedDuration = (text.length / 5) * 1000; // Rough estimate: 5 chars per second

    const synthesis: VoiceSynthesis = {
      id: `audio-${Date.now()}`,
      text,
      voiceId,
      audioUrl: `/api/voice/audio?id=${`audio-${Date.now()}`}`,
      lipSyncData,
      duration: estimatedDuration,
    };

    audioCache.set(cacheKey, synthesis);

    return NextResponse.json(synthesis, { status: 201 });
  } catch (error) {
    console.error('Voice synthesis error:', error);
    return NextResponse.json({ error: 'Failed to synthesize voice' }, { status: 500 });
  }
}

// GET: Stream audio or fetch synthesis info
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Find cached audio
    for (const [key, synthesis] of audioCache) {
      if (synthesis.id === id) {
        return NextResponse.json(synthesis);
      }
    }

    return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
  } catch (error) {
    console.error('Voice GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}

// Helper: Generate lip-sync data from text
function generateLipSync(text: string, language: string): LipSyncFrame[] {
  const frames: LipSyncFrame[] = [];
  const visemes = ['a', 'e', 'i', 'o', 'u', 'p', 'b', 'm', 'f', 'v', 'th', 's', 'z'];

  let timeMs = 0;
  const charsPerViseme = 3; // Rough estimate

  for (let i = 0; i < text.length; i += charsPerViseme) {
    const viseme = visemes[Math.floor(Math.random() * visemes.length)];
    const intensity = Math.random() * 0.5 + 0.5; // 0.5-1.0

    frames.push({
      time: timeMs,
      viseme,
      intensity,
    });

    timeMs += 100; // ~100ms per viseme
  }

  return frames;
}
