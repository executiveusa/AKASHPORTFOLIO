'use client';

/**
 * ApprovalCard.tsx — Inline approval control for council approval.required events.
 *
 * Renders a quiet card (IBM Plex Mono, #07080c bg, 1px border, amber left rule)
 * when bus.approvalPending is set. Posts the decision to
 * /api/approvals/[id]/decision and clears bus.approvalPending on resolution.
 *
 * Keyboard shortcuts (global while card is mounted):
 *   A — Aprobar / Approve
 *   R — Rechazar / Reject
 *   Esc — dismiss UI without calling the API
 *
 * data-tour="aprobaciones" lives on this container when present; the HUD
 * PENDING cell drops it to avoid duplicate tour anchors.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCouncilBus } from '@/lib/council/bus';
import { useCouncilLang } from '@/lib/council/selectors';

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = {
  es: {
    title: 'APROBACIÓN REQUERIDA',
    approve: 'Aprobar',
    reject: 'Rechazar',
    hint: 'A · Aprobar  R · Rechazar  Esc · Cerrar',
    errorPrefix: 'Error al enviar:',
  },
  en: {
    title: 'APPROVAL REQUIRED',
    approve: 'Approve',
    reject: 'Reject',
    hint: 'A · Approve  R · Reject  Esc · Close',
    errorPrefix: 'Failed to submit:',
  },
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const MONO: CSSProperties = {
  fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
};

const cardWrap: CSSProperties = {
  position: 'absolute',
  top: 40,        // just below the 36px HUD strip
  right: 0,
  width: 320,
  background: '#07080c',
  border: '1px solid rgba(255,255,255,0.13)',
  borderLeft: '3px solid #f5b000',
  zIndex: 20,
  padding: '12px 16px 12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  ...MONO,
};

const titleStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: '#f5b000',
};

const reasonStyle: CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.5,
  wordBreak: 'break-word',
};

const btnRow: CSSProperties = {
  display: 'flex',
  gap: 8,
};

function btnStyle(variant: 'approve' | 'reject', disabled: boolean): CSSProperties {
  const base: CSSProperties = {
    flex: 1,
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '5px 0',
    border: '1px solid',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    background: 'transparent',
    transition: 'opacity 120ms',
    ...MONO,
  };
  if (variant === 'approve') {
    return { ...base, color: '#f5b000', borderColor: '#f5b000' };
  }
  return { ...base, color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.2)' };
}

const hintStyle: CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.09em',
  color: 'rgba(255,255,255,0.28)',
};

const errorStyle: CSSProperties = {
  fontSize: 10,
  color: '#f87171',
  letterSpacing: '0.05em',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApprovalCard() {
  const approvalPending = useCouncilBus((s) => s.approvalPending);
  const resolveApproval = useCouncilBus((s) => s.resolveApproval);
  const [lang] = useCouncilLang();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error when a new approval arrives
  const prevIdRef = useRef<string | null>(null);
  if (approvalPending && approvalPending.id !== prevIdRef.current) {
    prevIdRef.current = approvalPending.id;
    // Only reset error if the id changed (new approval)
    if (error !== null) setError(null);
  }

  const L = LABELS[lang === 'en' ? 'en' : 'es'];

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!approvalPending || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/approvals/${encodeURIComponent(approvalPending.id)}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const msg = typeof body.error === 'string' ? body.error : `HTTP ${res.status}`;
        setError(`${L.errorPrefix} ${msg}`);
        setLoading(false);
        return;
      }
      resolveApproval();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${L.errorPrefix} ${msg}`);
      setLoading(false);
    }
  };

  // Keyboard shortcuts — active while card is mounted (approvalPending is set)
  useEffect(() => {
    if (!approvalPending) return;

    const handler = (e: KeyboardEvent) => {
      // Don't steal keys from input fields
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleDecision('approved');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleDecision('rejected');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        resolveApproval(); // dismiss UI only — no API call
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalPending, loading]);

  if (!approvalPending) return null;

  return (
    <div
      style={cardWrap}
      data-tour="aprobaciones"
      role="alertdialog"
      aria-label={L.title}
      aria-modal="false"
    >
      <span style={titleStyle}>{L.title}</span>
      <p style={reasonStyle}>{approvalPending.reason}</p>

      <div style={btnRow}>
        <button
          type="button"
          style={btnStyle('approve', loading)}
          disabled={loading}
          onClick={() => { handleDecision('approved'); }}
          aria-label={L.approve}
        >
          {L.approve}
        </button>
        <button
          type="button"
          style={btnStyle('reject', loading)}
          disabled={loading}
          onClick={() => { handleDecision('rejected'); }}
          aria-label={L.reject}
        >
          {L.reject}
        </button>
      </div>

      {error && <span style={errorStyle}>{error}</span>}
      <span style={hintStyle}>{L.hint}</span>
    </div>
  );
}
