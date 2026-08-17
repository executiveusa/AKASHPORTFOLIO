import { NextResponse } from 'next/server'
import { synthiaOS } from '@/lib/synthia-os-client'
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

export async function GET() {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  const agents = await synthiaOS.getAgentStatuses('kupuri-media')
  return NextResponse.json({ agents })
}
