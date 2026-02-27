import { NextResponse } from 'next/server';
import { synthiaSwarm } from '@/lib/swarm';

export async function GET() {
    return NextResponse.json(synthiaSwarm.listAllAgents());
}

export async function POST(req: Request) {
    const { name, role, parentId } = await req.json();
    const newAgent = await synthiaSwarm.spawnAgent(name, role, parentId);
    return NextResponse.json(newAgent);
}
