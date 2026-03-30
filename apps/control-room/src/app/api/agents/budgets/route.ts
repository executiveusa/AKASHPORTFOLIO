import { NextResponse } from 'next/server'
import { synthiaOS } from '@/lib/synthia-os-client'

export async function GET() {
  const agents = await synthiaOS.getAgentStatuses('kupuri-media')
  return NextResponse.json({ agents })
}
