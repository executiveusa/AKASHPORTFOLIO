import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface MeetingObservation {
  id: string;
  meetingId: string;
  transcript: string[];
  decisions: Decision[];
  timestamp: string;
}

interface Decision {
  agentId: string;
  decision: string;
  confidence: number;
  rationale: string;
  timestamp: string;
}

const observations = new Map<string, MeetingObservation>();

// POST: Log meeting observation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingId, transcript, decisions } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId required' }, { status: 400 });
    }

    const observation: MeetingObservation = {
      id: `obs-${Date.now()}`,
      meetingId,
      transcript: transcript || [],
      decisions: decisions || [],
      timestamp: new Date().toISOString(),
    };

    observations.set(observation.id, observation);

    return NextResponse.json(observation, { status: 201 });
  } catch (error) {
    console.error('Meeting observation POST error:', error);
    return NextResponse.json({ error: 'Failed to log observation' }, { status: 500 });
  }
}

// GET: Fetch meeting observations
export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get('meetingId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId required' }, { status: 400 });
    }

    const results = Array.from(observations.values())
      .filter(obs => obs.meetingId === meetingId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Meeting observation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 });
  }
}

// PUT: Update observation with new decisions
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { observationId, decisions } = body;

    if (!observationId) {
      return NextResponse.json({ error: 'observationId required' }, { status: 400 });
    }

    const obs = observations.get(observationId);
    if (!obs) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }

    if (decisions) {
      obs.decisions = [...obs.decisions, ...decisions];
    }

    return NextResponse.json(obs);
  } catch (error) {
    console.error('Meeting observation PUT error:', error);
    return NextResponse.json({ error: 'Failed to update observation' }, { status: 500 });
  }
}
