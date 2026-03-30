/**
 * /api/council/heartbeat
 *
 * Autonomous council heartbeat — fires scheduled governance meetings,
 * daily intelligence briefings, and prospecting sweeps without human
 * intervention.
 *
 * Cron schedule (vercel.json): "0 15,19,23 * * 1-5"
 * (09:00, 13:00, 17:00 CST Mon–Fri)
 *
 * This route REPLACES the legacy /api/cron/morning, /api/cron/midday,
 * and /api/cron/evening cron routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { callLLM, type LLMMessage } from '@/lib/litellm-gateway'

const CRON_SECRET = process.env.CRON_SECRET ?? ''

// ---------------------------------------------------------------------------
// Council trigger definitions
// ---------------------------------------------------------------------------
type TriggerKind = 'morning-brief' | 'midday-check' | 'evening-debrief' | 'prospecting' | 'governance'

interface CouncilTrigger {
  kind: TriggerKind
  label: string
  systemPrompt: string
  userMessage: string
}

const COUNCIL_FOR: Record<TriggerKind, CouncilTrigger> = {
  'morning-brief': {
    kind: 'morning-brief',
    label: 'Briefing matutino',
    systemPrompt:
      'Eres SYNTHIA™, coordinadora del consejo de Kupuri Media. ' +
      'Resume el estado del día: oportunidades activas, tareas críticas, ' +
      'estado del pipeline de ventas. Sé concisa. Español CDMX.',
    userMessage: '¿Cuál es el estado del negocio esta mañana?',
  },
  'midday-check': {
    kind: 'midday-check',
    label: 'Check de mediodía',
    systemPrompt:
      'Eres SYNTHIA™. Revisa el progreso del día: ¿qué avanzó? ' +
      '¿qué necesita atención urgente? Máximo 5 puntos.',
    userMessage: 'Check de mediodía — ¿qué necesita atención ahora?',
  },
  'evening-debrief': {
    kind: 'evening-debrief',
    label: 'Debrief vespertino',
    systemPrompt:
      'Eres SYNTHIA™. Cierra el día: resume logros, tareas pendientes ' +
      'para mañana, y una recomendación estratégica. Tono positivo.',
    userMessage: '¿Cómo cerramos el día? ¿Qué queda para mañana?',
  },
  'prospecting': {
    kind: 'prospecting',
    label: 'Barrido de prospectos',
    systemPrompt:
      'Eres CAZADORA™, especialista en ventas LATAM. Analiza el pipeline: ' +
      'identifica los 3 prospectos más calientes y sugiere el siguiente paso ' +
      'para cada uno. Directo y accionable.',
    userMessage: 'Ejecuta el barrido de prospectos. ¿Quiénes son los top 3?',
  },
  'governance': {
    kind: 'governance',
    label: 'Sesión de gobernanza',
    systemPrompt:
      'Eres CONSEJO™, facilitadora del consejo de Kupuri Media. ' +
      'Revisa métricas clave (MRR, churn, NPS conceptual), identifica ' +
      'decisiones pendientes y presenta opciones. Estructurado y neutral.',
    userMessage: 'Inicia la sesión de gobernanza semanal.',
  },
}

// ---------------------------------------------------------------------------
// Determine which trigger to run based on current hour (CST = UTC-6)
// ---------------------------------------------------------------------------
function getTriggerForHour(utcHour: number): TriggerKind {
  // 15 UTC = 09:00 CST → morning brief
  // 19 UTC = 13:00 CST → midday check + prospecting
  // 23 UTC = 17:00 CST → evening debrief
  if (utcHour === 15) return 'morning-brief'
  if (utcHour === 19) return 'prospecting'
  if (utcHour === 23) return 'evening-debrief'
  // Monday 15 UTC (first of week) → governance
  const day = new Date().getUTCDay()
  if (day === 1 && utcHour === 15) return 'governance'
  return 'midday-check'
}

// ---------------------------------------------------------------------------
// Core council runner
// ---------------------------------------------------------------------------
async function runAutonomousCouncil(trigger: CouncilTrigger): Promise<string> {
  const messages: LLMMessage[] = [
    { role: 'system', content: trigger.systemPrompt },
    { role: 'user', content: trigger.userMessage },
  ]

  const result = await callLLM(messages, {
    model: 'claude-sonnet-4-6',
    maxTokens: 800,
    temperature: 0.7,
    sphereId: 'synthia' as const,
    taskId: `heartbeat-${trigger.kind}-${Date.now()}`,
  })

  return result.content
}

// ---------------------------------------------------------------------------
// GET — health check / status
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    route: '/api/council/heartbeat',
    status: 'ready',
    triggers: Object.keys(COUNCIL_FOR),
    schedule: '0 15,19,23 * * 1-5',
  })
}

// ---------------------------------------------------------------------------
// POST — manual trigger or cron invocation
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // Validate cron secret
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const utcHour = new Date().getUTCHours()
  const triggerKind: TriggerKind = body.trigger ?? getTriggerForHour(utcHour)

  const trigger = COUNCIL_FOR[triggerKind]
  if (!trigger) {
    return NextResponse.json({ error: `Unknown trigger: ${triggerKind}` }, { status: 400 })
  }

  // Fire-and-forget — return immediately, council runs async
  runAutonomousCouncil(trigger).catch(err =>
    console.error('[heartbeat] council error:', err)
  )

  return NextResponse.json({
    ok: true,
    trigger: triggerKind,
    label: trigger.label,
    utcHour,
  })
}
