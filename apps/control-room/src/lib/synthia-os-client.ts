/**
 * SYNTHIA OS Internal Client
 *
 * This module connects the SYNTHIA control room to the internal
 * orchestration layer running at localhost:3100.
 *
 * IMPORTANT:
 * - This port is NEVER exposed to the public internet
 * - The orchestration layer name NEVER appears in user-facing UI
 * - All agent slugs are mapped to SYNTHIA display names before
 *   being rendered anywhere in the interface
 * - Clients see: SYNTHIA 3.0, Sphere OS, La Vigilante
 */

const OS_URL = process.env.SYNTHIA_OS_INTERNAL_URL ?? 'http://localhost:3100'
const OS_KEY = process.env.SYNTHIA_OS_BOARD_KEY ?? ''

// Map internal slugs → SYNTHIA display names
// Slugs NEVER rendered in UI — only display names are
export const AGENT_DISPLAY: Record<string, string> = {
  // Kupuri Media agents
  'synthia-prime':    'SYNTHIA™ Prime',
  'fany':             'FANY™',
  'fany-tiktok':      'Fany · TikTok',
  'fany-instagram':   'Fany · Instagram',
  'fany-linkedin':    'Fany · LinkedIn',
  'cazadora':         'CAZADORA™',
  'indigo':           'INDIGO',
  'merlina':          'MERLINA',
  'morpho':           'MORPHO',
  'ralphy':           'RALPHY',
  'clandestino':      'CLANDESTINO',
  // Akash Engine agents
  'lane-ceo':         'LANE CEO',
  'lane-audit':       'LANE Audit',
  'lane-dev':         'LANE Dev',
}

export type AgentSlug = keyof typeof AGENT_DISPLAY

export interface AgentStatus {
  slug: AgentSlug
  displayName: string
  budgetUsedUSD: number
  budgetLimitUSD: number
  budgetPct: number
  paused: boolean
  lastHeartbeatAt: string | null
  activeTaskCount: number
}

export interface TaskCreate {
  title: string
  body: string
  assignee: AgentSlug
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

async function osCall(path: string, opts?: RequestInit) {
  const res = await fetch(`${OS_URL}/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OS_KEY}`,
      ...opts?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[SYNTHIA OS] ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

export const synthiaOS = {
  /** All agent statuses — shown in La Vigilante budget panel */
  async getAgentStatuses(company = 'kupuri-media'): Promise<AgentStatus[]> {
    try {
      const data = await osCall(`/companies/${company}/agents`)
      return (data.agents ?? []).map((a: Record<string, unknown>) => ({
        slug: a.slug as AgentSlug,
        displayName: AGENT_DISPLAY[a.slug as string] ?? String(a.slug),
        budgetUsedUSD: Number(a.budget_used_usd ?? 0),
        budgetLimitUSD: Number(a.budget_limit_usd ?? 1),
        budgetPct: Number(a.budget_used_usd ?? 0) /
                   Number(a.budget_limit_usd ?? 1) * 100,
        paused: Boolean(a.paused),
        lastHeartbeatAt: a.last_heartbeat_at as string | null,
        activeTaskCount: Number(a.active_task_count ?? 0),
      }))
    } catch {
      return [] // degrade gracefully — cockpit still renders
    }
  },

  /** Create a task and assign to an agent */
  async createTask(task: TaskCreate, company = 'kupuri-media') {
    return osCall(`/companies/${company}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    })
  },

  /** Pause all agents for a company — kill switch */
  async pauseAllAgents(company: string): Promise<void> {
    const agents = await this.getAgentStatuses(company)
    await Promise.allSettled(
      agents.map(a =>
        osCall(`/companies/${company}/agents/${a.slug}/pause`, {
          method: 'POST',
        })
      )
    )
  },

  /** Resume all agents for a company */
  async resumeAllAgents(company: string): Promise<void> {
    const agents = await this.getAgentStatuses(company)
    await Promise.allSettled(
      agents.map(a =>
        osCall(`/companies/${company}/agents/${a.slug}/resume`, {
          method: 'POST',
        })
      )
    )
  },

  /** Pause single agent */
  async pauseAgent(slug: AgentSlug, company = 'kupuri-media') {
    return osCall(`/companies/${company}/agents/${slug}/pause`, {
      method: 'POST',
    })
  },

  /** Resume single agent */
  async resumeAgent(slug: AgentSlug, company = 'kupuri-media') {
    return osCall(`/companies/${company}/agents/${slug}/resume`, {
      method: 'POST',
    })
  },

  /** Activity log for La Vigilante audit trail */
  async getActivityLog(company = 'kupuri-media', limit = 50) {
    return osCall(`/companies/${company}/activity?limit=${limit}`)
  },

  /** Open tasks for cockpit pipeline view */
  async getOpenTasks(company = 'kupuri-media') {
    return osCall(`/companies/${company}/tasks?status=open`)
  },

  /** Board view — Ivette sees all companies */
  async getAllCompanies() {
    return osCall('/companies')
  },
}
