import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AgentState {
  agentId: string;
  persona: string;
  memory: Record<string, any>;
  mood: string;
  lastUpdate: string;
  context: string[];
}

const agentStates = new Map<string, AgentState>();

// Initialize default agents if empty
function ensureDefaultAgents() {
  const defaultAgents = [
    'advisor-economic',
    'advisor-cultural',
    'advisor-tech',
    'advisor-social',
    'ivette-primary',
  ];

  defaultAgents.forEach(agentId => {
    if (!agentStates.has(agentId)) {
      agentStates.set(agentId, {
        agentId,
        persona: `Persona for ${agentId}`,
        memory: { conversations: [], decisions: [] },
        mood: 'analytical',
        lastUpdate: new Date().toISOString(),
        context: [],
      });
    }
  });
}

// GET: Fetch agent state
export async function GET(req: NextRequest) {
  try {
    ensureDefaultAgents();

    const agentId = req.nextUrl.searchParams.get('agentId');

    if (agentId) {
      const state = agentStates.get(agentId);
      if (!state) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      return NextResponse.json(state);
    }

    // Return all agents
    return NextResponse.json(Array.from(agentStates.values()));
  } catch (error) {
    console.error('Agent state GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 });
  }
}

// POST: Create or initialize agent state
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, persona, memory, mood, context } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    const state: AgentState = {
      agentId,
      persona: persona || `Agent ${agentId}`,
      memory: memory || { conversations: [], decisions: [] },
      mood: mood || 'neutral',
      lastUpdate: new Date().toISOString(),
      context: context || [],
    };

    agentStates.set(agentId, state);

    return NextResponse.json(state, { status: 201 });
  } catch (error) {
    console.error('Agent state POST error:', error);
    return NextResponse.json({ error: 'Failed to create state' }, { status: 500 });
  }
}

// PUT: Update agent state
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, ...updates } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    let state: AgentState = agentStates.get(agentId) || {
      agentId,
      persona: `Agent ${agentId}`,
      memory: { conversations: [], decisions: [] },
      mood: 'neutral',
      lastUpdate: new Date().toISOString(),
      context: [],
    };

    state = {
      ...state,
      agentId,
      ...updates,
      lastUpdate: new Date().toISOString(),
    };

    agentStates.set(agentId, state);

    return NextResponse.json(state);
  } catch (error) {
    console.error('Agent state PUT error:', error);
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}
