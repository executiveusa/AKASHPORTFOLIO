'use client'

import { useEffect, useState } from 'react'

interface AgentBudget {
  slug: string
  displayName: string
  budgetUsedUSD: number
  budgetLimitUSD: number
  budgetPct: number
  paused: boolean
  lastHeartbeatAt: string | null
  activeTaskCount: number
}

interface BudgetData {
  agents: AgentBudget[]
}

const ES = {
  title: 'Presupuesto de Agentes',
  subtitle: 'Ciclo actual · Kupuri Media',
  total: 'Total del ciclo',
  loading: 'Cargando...',
  paused: 'Pausado',
  active: 'Activo',
  tasks: 'tareas',
  lastSeen: 'Último latido',
  never: 'nunca',
  lang: 'EN',
}

const EN = {
  title: 'Agent Budget',
  subtitle: 'Current cycle · Kupuri Media',
  total: 'Cycle total',
  loading: 'Loading...',
  paused: 'Paused',
  active: 'Active',
  tasks: 'tasks',
  lastSeen: 'Last heartbeat',
  never: 'never',
  lang: 'ES',
}

function pctColor(pct: number): string {
  if (pct >= 80) return 'var(--color-red-500, #ef4444)'
  if (pct >= 60) return 'var(--color-amber-400, #fbbf24)'
  return '#8b5cf6' // violet-500
}

function ProgressBar({ pct }: { pct: number }) {
  const clampedPct = Math.min(pct, 100)
  return (
    <div style={{
      height: '4px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '2px',
      overflow: 'hidden',
      flexGrow: 1,
    }}>
      <div style={{
        height: '100%',
        width: `${clampedPct}%`,
        background: pctColor(pct),
        borderRadius: '2px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

export default function BudgetPage() {
  const [data, setData] = useState<BudgetData | null>(null)
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const t = lang === 'es' ? ES : EN

  async function load() {
    try {
      const res = await fetch('/api/agents/budgets')
      if (res.ok) setData(await res.json())
    } catch {
      // degrade silently
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  const totalUsed = data?.agents.reduce((s, a) => s + a.budgetUsedUSD, 0) ?? 0
  const totalLimit = data?.agents.reduce((s, a) => s + a.budgetLimitUSD, 0) ?? 0

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-charcoal-800, #1a1a2e)',
      color: '#e2e8f0',
      fontFamily: 'var(--font-sans, system-ui)',
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            {t.title}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          {t.lang}
        </button>
      </div>

      {/* Cycle KPI bar */}
      {data && (
        <div style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {t.total}
          </span>
          <ProgressBar pct={totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
            ${totalUsed.toFixed(2)} / ${totalLimit.toFixed(2)}
          </span>
        </div>
      )}

      {/* Agent rows */}
      {!data && (
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{t.loading}</p>
      )}
      {data?.agents.map(agent => (
        <div key={agent.slug} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '0.875rem 1.25rem',
          marginBottom: '0.5rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr auto',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Name + status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {agent.displayName}
              </span>
              {agent.paused && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}>
                  {t.paused}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
              {agent.activeTaskCount} {t.tasks}
              {' · '}
              {t.lastSeen}: {agent.lastHeartbeatAt
                ? new Date(agent.lastHeartbeatAt).toLocaleTimeString()
                : t.never}
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar pct={agent.budgetPct} />

          {/* Dollar amount */}
          <div style={{ textAlign: 'right', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            <span style={{ color: pctColor(agent.budgetPct), fontWeight: 600 }}>
              ${agent.budgetUsedUSD.toFixed(2)}
            </span>
            <span style={{ color: '#475569' }}>
              {' '}/ ${agent.budgetLimitUSD.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
