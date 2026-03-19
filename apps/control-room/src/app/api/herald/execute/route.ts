/**
 * HERALD Execute API
 * POST /api/herald/execute — execute a tool by known tool_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeRoute } from '@/lib/herald/router';
import { getAllTools } from '@/lib/herald/tool-registry';
import type { SphereAgentId } from '@/shared/council-events';
import type { ExecutorKind } from '@/lib/herald/tool-registry';

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    tool_id?: string;
    args?: Record<string, unknown>;
    agent_id?: string;
  };

  const { tool_id, args, agent_id } = body;

  if (!tool_id || !agent_id) {
    return NextResponse.json(
      { error: 'tool_id and agent_id are required' },
      { status: 400 }
    );
  }

  const tools = await getAllTools();
  const tool = tools.find(t => t.tool_id === tool_id);

  if (!tool) {
    return NextResponse.json(
      { error: `Tool not found: ${tool_id}` },
      { status: 404 }
    );
  }

  const route = {
    tool_id: tool.tool_id,
    tool_name: tool.tool_name,
    executor_kind: tool.executor_kind as ExecutorKind,
    executor_config: tool.executor_config,
    cli_signature: tool.cli_signature,
    confidence: 1.0,
    fallback_available: false,
  };

  const result = await executeRoute(route, args ?? {}, agent_id as SphereAgentId);
  return NextResponse.json(result);
}
