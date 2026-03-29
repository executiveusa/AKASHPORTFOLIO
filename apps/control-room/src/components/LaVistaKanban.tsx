/**
 * La Vista™ — El Panorama™ GTD Kanban
 * Design: expedition cartography, dark luxury, Cormorant Garamond
 * UDEC: DESIGN_VARIANCE:9 / MOTION:8 / DENSITY:5
 * Live updates every 10s via polling
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────

interface Mision {
  id: string;
  titulo: string;
  estado: Column['id'];
  prioridad: 'urgente' | 'alta' | 'media' | 'baja';
  asignada_a?: string | null;
  proximo_paso?: string | null;
  mesa_id?: string | null;
  tokens_usados: number;
  creado_en: string;
}

// ─── Constants ──────────────────────────────────────────────────

const SPHERE_COLORS: Record<string, string> = {
  'synthia-prime':   '#c8a04a',
  'darya-design':    '#8a4a7a',
  'research-esfera': '#4a6a8a',
  'deploy-esfera':   '#4a8a5a',
};

const PRIO_COLORS = {
  urgente: '#aa5050',
  alta:    '#c8a04a',
  media:   '#4a6a8a',
  baja:    '#404040',
};

interface Column {
  id: 'bandeja' | 'proximo' | 'en_ronda' | 'esperando' | 'listo';
  label: string;
  emoji: string;
  border: string;
}

const COLS: Column[] = [
  { id: 'bandeja',   label: 'BANDEJA',   emoji: '📥', border: 'rgba(80,80,80,0.3)' },
  { id: 'proximo',   label: 'PRÓXIMO',   emoji: '⚡', border: 'rgba(74,106,138,0.4)' },
  { id: 'en_ronda',  label: 'EN RONDA',  emoji: '🔄', border: 'rgba(200,160,74,0.35)' },
  { id: 'esperando', label: 'ESPERANDO', emoji: '⏳', border: 'rgba(138,80,80,0.3)' },
  { id: 'listo',     label: 'LISTO',     emoji: '✅', border: 'rgba(74,138,90,0.35)' },
];

const BACKEND = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080')
  : '';

// ─── Card ────────────────────────────────────────────────────────

function Card({ m, onMove }: { m: Mision; onMove: (id: string, to: Column['id']) => void }) {
  const sc = SPHERE_COLORS[m.asignada_a ?? ''] ?? '#404040';
  const pc = PRIO_COLORS[m.prioridad];
  const nextCols = COLS.filter(c => c.id !== m.estado).map(c => c.id);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group rounded-xl overflow-hidden transition-all"
      style={{
        background: 'rgba(10,13,20,0.92)',
        border: '1px solid rgba(180,140,60,0.1)',
        boxShadow: `inset 3px 0 0 ${sc}`,
        cursor: 'default',
      }}
    >
      <div className="p-3">
        {/* Title + priority */}
        <div className="flex items-start gap-2 mb-1.5">
          <p className="flex-1 leading-snug" style={{
            color: '#d8cdb0',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            {m.titulo}
          </p>
          <span className="shrink-0 px-1.5 py-0.5 rounded text-center"
            style={{
              background: `${pc}18`,
              color: pc,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '8px',
              letterSpacing: '1px',
            }}>
            {m.prioridad.toUpperCase()}
          </span>
        </div>

        {/* Next action */}
        {m.proximo_paso && (
          <p className="mb-2 leading-tight" style={{
            color: 'rgba(200,160,74,0.55)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
          }}>
            → {m.proximo_paso.slice(0, 55)}{m.proximo_paso.length > 55 ? '…' : ''}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {m.asignada_a ? (
            <div className="flex items-center gap-1.5">
              <span className="block w-2.5 h-2.5 rounded-full" style={{
                background: sc,
                boxShadow: `0 0 5px ${sc}50`,
              }} />
              <span style={{
                color: '#404040',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
              }}>
                {m.asignada_a.replace('-esfera', '').toUpperCase()}
              </span>
            </div>
          ) : <span />}

          {/* Move buttons */}
          {hovered && (
            <div className="flex gap-1">
              {nextCols.slice(0, 2).map(col => (
                <button
                  key={col}
                  onClick={() => onMove(m.id, col)}
                  className="px-1.5 py-0.5 rounded text-center text-xs transition-colors"
                  style={{
                    background: 'rgba(200,160,74,0.1)',
                    color: 'rgba(200,160,74,0.6)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '8px',
                  }}>
                  → {col.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {m.tokens_usados > 0 && (
            <span style={{
              color: '#303030',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
            }}>
              ⚡{m.tokens_usados.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Board ───────────────────────────────────────────────────────

export function LaVistaKanban({ mesaId }: { mesaId?: string }) {
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const url = new URL(`${BACKEND}/el-panorama/misiones`);
      if (mesaId) url.searchParams.set('mesa_id', mesaId);
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5_000) });
      const data = await res.json() as { misiones?: Mision[] };
      setMisiones(data.misiones ?? []);
      setLastSync(new Date());
    } catch { /* degrade silently */ }
    finally { setLoading(false); }
  }, [mesaId]);

  useEffect(() => {
    void fetch_();
    const t = setInterval(fetch_, 10_000);
    return () => clearInterval(t);
  }, [fetch_]);

  const move = useCallback(async (id: string, to: Column['id']) => {
    // Optimistic
    setMisiones(prev => prev.map(m => m.id === id ? { ...m, estado: to } : m));
    await fetch(`${BACKEND}/el-panorama/misiones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: to }),
    }).catch(() => { void fetch_(); }); // revert on failure
  }, [fetch_]);

  if (loading) return (
    <div className="flex items-center justify-center py-16" style={{
      color: 'rgba(200,160,74,0.3)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      letterSpacing: '2px',
    }}>
      CARGANDO LA VISTA™...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '18px',
          color: '#c8a04a',
          letterSpacing: '2px',
        }}>
          LA VISTA™
        </h2>
        {lastSync && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            color: '#303030',
          }}>
            SYNC {lastSync.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Columns */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-4 pb-4" style={{ minWidth: 'max-content' }}>
          {COLS.map(col => {
            const cards = misiones.filter(m => m.estado === col.id);
            return (
              <div key={col.id} style={{ width: '240px' }}>
                {/* Column header */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2"
                  style={{
                    border: `1px solid ${col.border}`,
                    background: col.border.replace('0.', '0.05'),
                  }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    color: 'rgba(200,160,74,0.7)',
                  }}>
                    {col.emoji} {col.label}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: 'rgba(200,160,74,0.4)',
                  }}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 min-h-20">
                  {cards.map(m => <Card key={m.id} m={m} onMove={move} />)}

                  {cards.length === 0 && (
                    <div className="rounded-xl py-5 text-center"
                      style={{
                        border: '1px dashed rgba(200,160,74,0.08)',
                        color: '#282828',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                      vacío
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
