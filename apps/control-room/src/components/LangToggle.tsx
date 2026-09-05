'use client';

/**
 * LangToggle — segmented ES · EN control.
 * Persists the chosen voice language in localStorage('synthia_voice_lang').
 * Best-effort PATCH to /api/synthia/memory { voice_lang } on change.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const LS_KEY = 'synthia_voice_lang';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoiceLang(): [string, (lang: string) => void] {
  const [lang, setLangState] = useState<string>('es');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === 'es' || saved === 'en') setLangState(saved);
    } catch {
      /* storage blocked */
    }
  }, []);

  const setLang = (next: string) => {
    setLangState(next);
    try {
      localStorage.setItem(LS_KEY, next);
    } catch {
      /* storage blocked */
    }
    // Best-effort — never block on failure
    fetch('/api/synthia/memory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_lang: next }),
    }).catch(() => { /* intentionally silent */ });
  };

  return [lang, setLang];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LangToggleProps {
  /** Called after internal state updates; receives the new lang value. */
  onChange?: (lang: string) => void;
}

export function LangToggle({ onChange }: LangToggleProps) {
  const [lang, setLang] = useVoiceLang();

  const handleSelect = (next: string) => {
    setLang(next);
    onChange?.(next);
  };

  const MONO: CSSProperties = {
    fontFamily: '"IBM Plex Mono", "Courier New", monospace',
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
