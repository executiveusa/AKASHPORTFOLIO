import { NextResponse } from 'next/server';
import { synthiaSwarm } from '@/lib/swarm';
import { requireAdmin, toErrorResponse } from '@/lib/auth/guards';

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(synthiaSwarm.listAllAgents());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { name, role, parentId } = await req.json();
    const newAgent = await synthiaSwarm.spawnAgent(name, role, parentId);
    return NextResponse.json(newAgent);
  } catch (e) {
    return toErrorResponse(e);
  }
}
