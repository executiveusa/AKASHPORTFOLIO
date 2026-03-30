/**
 * Site Factory Dashboard — La Vista™ Extension
 * Shows live progress of site factory batch runs
 * Expedition cartography aesthetic — dark, gold, JetBrains Mono
 * UDEC: DESIGN_VARIANCE:9 / MOTION:8 / DENSITY:6
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteRun {
  business_name: string;
  site_id: string;
  site_url?: string;
  udec_score: number;
  status: 'queued' | 'running' | 'complete' | 'partial' | 'failed';
  cost_estimate_usd: number;
  pipeline_steps?: Array<{ step: string; status: string; duration_ms: number }>;
}

const STATUS_CONFIG: Record<
  SiteRun['status'],
  { color: string; label: string; emoji: string }
> = {
  queued:   { color: '#404040', label: 'EN COLA',   emoji: '⏳' },
  running:  { color: '#c8a04a', label: 'CORRIENDO', emoji: '🔄' },
  complete: { color: '#4a8a6a', label: 'COMPLETO',  emoji: '✅' },
  partial:  { color: '#8a6a4a', label: 'PARCIAL',   emoji: '⚠️'  },
  failed:   { color: '#8a4040', label: 'FALLÓ',     emoji: '❌' },
};

function SiteCard({ run }: { run: SiteRun }) {
  const cfg = STATUS_CONFIG[run.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(10,13,20,0.92)',
        border: `1px solid ${cfg.color}40`,
        boxShadow: `inset 3px 0 0 ${cfg.color}`,
      }}
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <p
            className="text-sm leading-snug flex-1 mr-2"
            style={{
              color: '#d8cdb0',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '14px',
            }}
          >
            {run.business_name}
          </p>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              color: cfg.color,
              letterSpacing: '1px',
            }}
          >
            {cfg.emoji} {cfg.label}
          </span>
        </div>

        {run.pipeline_steps && (
          <div className="flex gap-1 flex-wrap mb-2">
            {run.pipeline_steps.map((s, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-center"
                style={{
                  background:
                    s.status === 'success'
                      ? 'rgba(74,138,90,0.15)'
                      : 'rgba(138,64,64,0.15)',
                  color: s.status === 'success' ? '#4a8a6a' : '#8a4040',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '8px',
                }}
              >
                {s.step.split(' ')[0]}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {run.site_url ? (
            <a
              href={run.site_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(200,160,74,0.6)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
              }}
            >
              {run.site_url.replace('https://', '')}
            </a>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {run.udec_score > 0 && (
              <span
                style={{
                  color: run.udec_score >= 8.5 ? '#4a8a6a' : '#8a4040',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                }}
              >
                UDEC {run.udec_score.toFixed(1)}
              </span>
            )}
            <span
              style={{
                color: '#303030',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
              }}
            >
              ${run.cost_estimate_usd.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const NICHES = [
  { value: 'vegan_food', label: '🌱 Comida Vegana' },
  { value: 'eco_turismo', label: '🌿 Eco-Turismo' },
  { value: 'salud_bienestar', label: '💚 Salud y Bienestar' },
  { value: 'pool_cleaning', label: '🏊 Albercas' },
  { value: 'general', label: '🏢 General' },
];

export function SiteFactoryDashboard() {
  const [runs, setRuns] = useState<SiteRun[]>([]);
  const [stats, setStats] = useState({ total: 0, complete: 0, failed: 0, cost: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [niche, setNiche] = useState('vegan_food');
  const [city, setCity] = useState('Puerto Vallarta');
  const [count, setCount] = useState(10);

  const startBatch = async () => {
    setIsRunning(true);
    setRuns([]);

    try {
      const backend = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';
      const res = await fetch(`${backend}/site-factory/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          city,
          count,
          auto_deploy: true,
          auto_outreach: true,
        }),
      });

      const data = await res.json() as { batch_id: string };
      console.log('[site-factory] Batch started:', data.batch_id);
    } catch (err) {
      console.error('[site-factory] Batch start failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const totalCost = runs.reduce((sum, r) => sum + r.cost_estimate_usd, 0);
  const completeCount = runs.filter(r => r.status === 'complete').length;

  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              color: '#c8a04a',
              letterSpacing: '2px',
            }}
          >
            SITE FACTORY™
          </h2>
          <p style={{ fontSize: '9px', color: '#303030', letterSpacing: '1px' }}>
            {completeCount}/{runs.length || stats.total} SITIOS · ${totalCost.toFixed(2)} USD
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center">
          <select
            value={niche}
            onChange={e => setNiche(e.target.value)}
            className="rounded px-2 py-1 text-xs"
            style={{
              background: 'rgba(200,160,74,0.08)',
              border: '1px solid rgba(200,160,74,0.2)',
              color: '#c8a04a',
              fontSize: '10px',
            }}
          >
            {NICHES.map(n => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>

          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ciudad"
            className="rounded px-2 py-1 text-xs w-28"
            style={{
              background: 'rgba(200,160,74,0.08)',
              border: '1px solid rgba(200,160,74,0.2)',
              color: '#d8cdb0',
              fontSize: '10px',
            }}
          />

          <select
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="rounded px-2 py-1 text-xs"
            style={{
              background: 'rgba(200,160,74,0.08)',
              border: '1px solid rgba(200,160,74,0.2)',
              color: '#c8a04a',
              fontSize: '10px',
            }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>
                {n} sitios
              </option>
            ))}
          </select>

          <motion.button
            onClick={() => void startBatch()}
            disabled={isRunning}
            className="px-3 py-1.5 rounded text-xs font-bold"
            style={{
              background: isRunning ? '#303030' : '#c8a04a',
              color: '#0a0f1a',
              fontSize: '10px',
              letterSpacing: '1px',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? 'CORRIENDO...' : '▶ EJECUTAR'}
          </motion.button>
        </div>
      </div>

      {/* Site grid */}
      <div className="px-4">
        {runs.length === 0 ? (
          <div
            className="py-12 text-center rounded-xl"
            style={{
              border: '1px dashed rgba(200,160,74,0.08)',
              color: '#282828',
              fontSize: '11px',
            }}
          >
            Configura el nicho y ciudad, luego ejecuta el batch.
          </div>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            <AnimatePresence>
              {runs.map(r => (
                <SiteCard key={r.site_id} run={r} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
