'use client';

/**
 * LangToggle — segmented ES · EN control.
 * Lang is a single source of truth: the bus (useCouncilBus lang + setLang).
 * On first mount, LangToggle hydrates the bus from localStorage('synthia_voice_lang').
 * useVoiceLang() is a thin wrapper over the bus for backward compat with bienvenida.
 */

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useCouncilBus } from '@/lib/council/bus';
import type { VoiceLang } from '@/shared/council-events';

const LS_KEY = 'synthia_voice_lang';

// ---------------------------------------------------------------------------
// Hook — reads/writes bus; hydrate is done inside LangToggle component effect
// ---------------------------------------------------------------------------

export function useVoiceLang(): [VoiceLang, (lang: VoiceLang) => void] {
  const lang = useCouncilBus((s) => s.lang);
  const setLang = useCouncilBus((s) => s.setLang);
  return [lang, setLang];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LangToggleProps {
  /** Called after internal state updates; receives the new lang value. */
  onChange?: (lang: VoiceLang) => void;
}

export function LangToggle({ onChange }: LangToggleProps) {
  const lang = useCouncilBus((s) => s.lang);
  const busSetLang = useCouncilBus((s) => s.setLang);

  // Hydrate bus from localStorage on first mount (single source of truth)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === 'es' || saved === 'en') {
        busSetLang(saved);
      }
    } catch {
      /* storage blocked */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (next: VoiceLang) => {
    busSetLang(next);
    // Persist to localStorage as backup
    try { localStorage.setItem(LS_KEY, next); } catch { /* */ }
    onChange?.(next);
  };

  const MONO: CSSProperties = {
    fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };

  const wrapStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'stretch',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 5,
    overflow: 'hidden',
    ...MONO,
  };

  const btnStyle = (id: string): CSSProperties => ({
    padding: '5px 10px',
    background: lang === id ? 'rgba(255,255,255,0.13)' : 'transparent',
    color: lang === id ? '#fff' : 'rgba(255,255,255,0.38)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: MONO.fontFamily,
    fontSize: MONO.fontSize,
    letterSpacing: MONO.letterSpacing,
    textTransform: MONO.textTransform,
    lineHeight: 1,
    transition: 'color 120ms, background 120ms',
  });

  const dividerStyle: CSSProperties = {
    width: 1,
    background: 'rgba(255,255,255,0.14)',
    alignSelf: 'stretch',
  };

  return (
    <div style={wrapStyle} role="group" aria-label="Idioma de voz">
      <button
        type="button"
        style={btnStyle('es')}
        aria-pressed={lang === 'es'}
        onClick={() => handleSelect('es')}
      >
        ES
      </button>
      <span style={dividerStyle} aria-hidden="true" />
      <button
        type="button"
        style={btnStyle('en')}
        aria-pressed={lang === 'en'}
        onClick={() => handleSelect('en')}
      >
        EN
      </button>
    </div>
  );
}
