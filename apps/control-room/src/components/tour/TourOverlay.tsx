'use client';

/**
 * TourOverlay — anchored one-sentence tour tip.
 *
 * Positions itself relative to [data-tour="<anchor>"] via getBoundingClientRect.
 * Dismissed by progress (parent changes `step`) or ESC key.
 * No "Siguiente / Next" button — overlays advance only via the `step` prop.
 * Only a dismiss (×) control is shown.
 *
 * Props:
 *   step          — 1-based index of current step (0 = hidden)
 *   steps         — ordered TourStep array
 *   lang          — 'es' | 'en'
 *   onNext        — kept for caller compat; not rendered
 *   onDismiss     — called when ESC or × is pressed
 *   reducedMotion — disables CSS transitions
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { TourStep } from '@/lib/first-run';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourOverlayProps {
  step: number;
  steps: TourStep[];
  lang: 'es' | 'en';
  /** Kept for caller compatibility; not rendered. Overlays advance via step prop. */
  onNext?: () => void;
  onDismiss?: () => void;
  reducedMotion?: boolean;
}

export function TourOverlay({
  step,
  steps,
  lang,
  onDismiss,
  reducedMotion = false,
}: TourOverlayProps) {
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[step - 1] ?? null;

  const measureAnchor = useCallback(() => {
    if (!currentStep) { setAnchorRect(null); return; }
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${currentStep.anchor}"]`,
    );
    if (!el) { setAnchorRect(null); return; }
    const r = el.getBoundingClientRect();
    setAnchorRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [currentStep]);

  useEffect(() => {
    measureAnchor();
    window.addEventListener('resize', measureAnchor);
    return () => window.removeEventListener('resize', measureAnchor);
  }, [measureAnchor]);

  // ESC to dismiss
  useEffect(() => {
    if (!currentStep) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, onDismiss]);

  if (!currentStep || step <= 0) return null;

  const text = lang === 'en' ? currentStep.textEn : currentStep.textEs;

  // Compute position: prefer below the anchor, fall back to above or bottom-center
  let top = 0;
  let left = 0;
  if (anchorRect) {
    const overlayH = 60;
    const spaceBelow = window.innerHeight - anchorRect.top - anchorRect.height;
    top = spaceBelow >= overlayH + 12
      ? anchorRect.top + anchorRect.height + 10
      : Math.max(8, anchorRect.top - overlayH - 10);
    const overlayW = Math.min(280, window.innerWidth - 24);
    left = anchorRect.left + anchorRect.width / 2 - overlayW / 2;
    left = Math.max(12, Math.min(window.innerWidth - overlayW - 12, left));
  } else {
    top  = window.innerHeight - 96;
    left = window.innerWidth / 2 - 140;
  }

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    maxWidth: Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 320) - 24),
    background: 'rgba(7,8,12,0.94)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: reducedMotion ? 'none' : 'top 200ms ease, left 200ms ease, opacity 160ms ease',
  };

  const textStyle: CSSProperties = {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.80)',
    fontFamily: 'var(--font-plex-sans), system-ui, sans-serif',
    fontWeight: 400,
    margin: 0,
  };

  const btnStyle: CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.50)',
    fontSize: 14,
    padding: '0 2px',
    lineHeight: 1,
    fontFamily: 'inherit',
    alignSelf: 'center',
  };

  return (
    <div ref={overlayRef} style={overlayStyle} role="tooltip" aria-live="polite">
      {/* Thin anchor line (visual cue) */}
      <span
        style={{
          width: 2,
          minHeight: 16,
          alignSelf: 'stretch',
          background: 'rgba(255,255,255,0.22)',
          borderRadius: 1,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <p style={textStyle}>{text}</p>
      {/* Dismiss only — no "Siguiente/Next" button; overlays advance via step prop */}
      <button
        type="button"
        style={btnStyle}
        aria-label={lang === 'en' ? 'Close tour' : 'Cerrar guía'}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
