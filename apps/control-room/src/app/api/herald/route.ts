/**
 * HERALD Admin API
 * GET  /api/herald            — list all registered tools
 * POST /api/herald            — bootstrap/refresh tool registry
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { bootstrapHeraldRegistry, getAllTools } from '@/lib/herald/tool-registry';
import type { ExecutorKind } from '@/lib/herald/tool-registry';

export async function GET(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  const { searchParams } = new URL(req.url);
  const executor = searchParams.get('executor') as ExecutorKind | null;
  const capability = searchParams.get('capability') ?? undefined;

  const tools = await getAllTools(
    executor || capability
      ? { executor_kind: executor ?? undefined, capability }
      : undefined
  );

  return NextResponse.json({ tools, count: tools.length });
}

export async function POST(req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }
  const body = await req.json().catch(() => ({})) as { action?: string };

  if (body.action === 'bootstrap') {
    const result = await bootstrapHeraldRegistry();
    return NextResponse.json({ success: true, ...result });
  }

  return NextResponse.json({ error: 'Unknown action. Use { action: "bootstrap" }' }, { status: 400 });
}
