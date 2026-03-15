/**
 * Vibe Graph API — context engine for all spheres
 *
 * POST   /api/vibe/ingest         — add a new fact/node
 * GET    /api/vibe/context        — get ecosystem context for an agent (?agent=X)
 * PATCH  /api/vibe/invalidate     — mark a node superseded
 */

import { NextRequest, NextResponse } from 'next/server';
import { vibeIngest, getVibeContext, vibeInvalidate } from '@/lib/vibe-graph';
import type { SphereAgentId } from '@/shared/council-events';
import type { NodeKind } from '@/lib/vibe-graph';

const VALID_AGENTS = ['synthia','alex','cazadora','forjadora','seductora','consejo','dr-economia','dra-cultura','ing-teknos','system'] as const;
const VALID_NODE_KINDS: NodeKind[] = ['agent','task','fact','memory','goal','resource','relationship'];

export async function POST(req: NextRequest) {
  let body: {
    agentId?: string;
    kind?: string;
    label?: string;
    content?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    relatesToIds?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.agentId || !VALID_AGENTS.includes(body.agentId as typeof VALID_AGENTS[number])) {
    return NextResponse.json({ error: 'Invalid agentId' }, { status: 400 });
  }
  if (!body.kind || !VALID_NODE_KINDS.includes(body.kind as NodeKind)) {
    return NextResponse.json({ error: `kind must be one of: ${VALID_NODE_KINDS.join(', ')}` }, { status: 400 });
  }
  if (!body.label || !body.content) {
    return NextResponse.json({ error: 'label and content are required' }, { status: 400 });
  }

  const node = await vibeIngest({
    agentId: body.agentId as SphereAgentId,
    kind: body.kind as NodeKind,
    label: body.label,
    content: body.content,
    tags: body.tags,
    metadata: body.metadata,
    relatesToIds: body.relatesToIds,
  });

  return NextResponse.json(node, { status: 201 });
}

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agent');

  if (!agentId || !VALID_AGENTS.includes(agentId as typeof VALID_AGENTS[number])) {
    return NextResponse.json(
      { error: `agent param must be one of: ${VALID_AGENTS.join(', ')}` },
      { status: 400 },
    );
  }

  const context = await getVibeContext(agentId as SphereAgentId);
  return NextResponse.json(context);
}

export async function PATCH(req: NextRequest) {
  let body: { nodeId?: string; newNodeId?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.nodeId || !body.newNodeId) {
    return NextResponse.json({ error: 'nodeId and newNodeId are required' }, { status: 400 });
  }

  await vibeInvalidate(body.nodeId, body.newNodeId);
  return NextResponse.json({ ok: true });
}
