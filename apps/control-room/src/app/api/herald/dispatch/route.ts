/**
 * HERALD Dispatch API
 * POST /api/herald/dispatch — route an intent to a tool (with optional execution)
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeIntent, executeRoute } from '@/lib/herald/router';
import type { SphereAgentId } from '@/shared/council-events';

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    intent?: string;
    agent_id?: string;
    session_id?: string;
    execute?: boolean;
    args?: Record<string, unknown>;
  };

  const { intent, agent_id, session_id, execute = false, args = {} } = body;

  if (!intent || !agent_id) {
    return NextResponse.json(
      { error: 'intent and agent_id are required' },
      { status: 400 }
    );
  }

  const route = await routeIntent(intent, agent_id as SphereAgentId, { session_id });

  if (!route) {
    return NextResponse.json(
      { error: 'No suitable tool found for intent', intent },
      { status: 404 }
    );
  }

  if (!execute) {
    return NextResponse.json({ route });
  }

  // Execute immediately if requested
  const result = await executeRoute(route, args, agent_id as SphereAgentId);
  return NextResponse.json({ route, result });
}
