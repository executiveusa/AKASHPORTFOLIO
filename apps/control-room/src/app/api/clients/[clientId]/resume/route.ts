import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'
import { synthiaOS } from '@/lib/synthia-os-client'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const supabase = supabaseAdmin

  // Fetch client record to get their OS company slug
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, os_company_slug, subscription_active')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  if (!client.os_company_slug) {
    return NextResponse.json(
      { error: 'Client has no orchestration company configured' },
      { status: 400 }
    )
  }

  // Check subscription is active before restoring agents
  if (!client.subscription_active) {
    return NextResponse.json(
      { error: 'Cannot resume — subscription is not active' },
      { status: 403 }
    )
  }

  // Resume all agents for that company
  await synthiaOS.resumeAllAgents(client.os_company_slug)

  // Log to kill switch audit table
  await supabase.from('kill_switch_log').insert({
    os_company_slug: client.os_company_slug,
    action: 'resume',
    initiated_by: req.headers.get('x-user-id') ?? 'system',
    reason: 'Manual resume — client dashboard',
  })

  return NextResponse.json({ ok: true, company: client.os_company_slug })
}
