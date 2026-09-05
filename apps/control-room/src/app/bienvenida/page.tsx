'use client';

/**
 * /bienvenida — First-run Observatorio scene (60-second rule).
 *
 * Flow:
 *   1. Mount → hasSeenFirstRun() → if true, redirect to /spheres
 *   2. SYNTHIA greeting line appears; voice synthesis attempted on first user gesture
 *   3. User types one sentence → Enter / submit
 *   4. POST /api/council/orchestrator (initiatedBy: 'bienvenida', lang) → EventSource SSE
 *   5. sphere.signal events: set speaking sphere + append transcript
 *      → TourOverlay step 1 anchors to ring
 *   6. meeting.closing / meeting.end → show memo (decisions[] or synthesis)
 *      → TourOverlay step 2 anchors to memo
 *   7. "Entrar al observatorio" → markFirstRunSeen() → /spheres?tour=1
 *
 * Degradation: on any orchestrator error, show a self-identifying static memo
 * (dashed border, muted, labelled "Sin consejo en vivo — memo de ejemplo").
 *
 * Mobile: ring ≤ 60vw; input full width; no overflow.
 *
 * AudioContext: created/resumed only on first user gesture (focus or keydown on
 * the input). The greeting audio buffer is fetched eagerly but played on gesture.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { hasSeenFirstRun, markFirstRunSeen, TOUR_STEPS } from '@/lib/first-run';
import { LangToggle, useVoiceLang } from '@/components/LangToggle';
import { SphereRing2D } from '@/components/SphereRing2D';
import { TourOverlay } from '@/components/tour/TourOverlay';
import { unlockAudio } from '@/lib/council/bus';
import type { SphereAgentId, CouncilEvent } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Constants — Observatorio design tokens
// ---------------------------------------------------------------------------

const FIELD    = '#07080c';
const TEXT_DIM = 'rgba(255,255,255,0.42)';
const TEXT_MID = 'rgba(255,255,255,0.72)';
const TEXT_FULL = 'rgba(255,255,255,0.92)';
const BORDER   = 'rgba(255,255,255,0.10)';
// Neutral accent: no violet. #e8e9ee text on transparent with 1px border.
const ACCENT_TEXT   = '#e8e9ee';
const ACCENT_BORDER = 'rgba(232,233,238,0.35)';

const GREETING = {
  es: 'Hola. Soy SYNTHIA. Dime en una frase qué hace tu negocio.',
  en: 'Hello. I am SYNTHIA. Tell me in one sentence what your business does.',
};

const PLACEHOLDER = {
  es: 'Dime en una frase qué hace tu negocio',
  en: 'Describe your business in one sentence',
};

const ENTER_LABEL = {
  es: 'Entrar al observatorio',
  en: 'Enter the observatory',
};

const VOICE_UNAVAILABLE = {
  es: 'Voz no disponible',
  en: 'Voice unavailable',
};

const STATIC_MEMO_LABEL = {
  es: 'Sin consejo en vivo — memo de ejemplo',
  en: 'No live council — sample memo',
};

// ---------------------------------------------------------------------------
// Static fallback memo builder
// ---------------------------------------------------------------------------

function buildStaticMemo(userText: string, lang: 'es' | 'en'): string[] {
  if (lang === 'en') {
    return [
      `Your business: ${userText.slice(0, 80)}.`,
      'Recommended first action: define your ideal client profile.',
      'Next step: schedule a strategy council session with ALEX and CAZADORA.',
    ];
  }
  return [
    `Tu negocio: ${userText.slice(0, 80)}.`,
    'Primera acción recomendada: define el perfil de tu cliente ideal.',
    'Siguiente paso: convoca un consejo de estrategia con ALEX y CAZADORA.',
  ];
}

// ---------------------------------------------------------------------------
// Audio context helper — call only inside user gesture handler
// ---------------------------------------------------------------------------

async function playWithContext(
  ctx: AudioContext,
  buf: ArrayBuffer,
): Promise<number> {
  const decoded = await ctx.decodeAudioData(buf.slice(0));
  const src = ctx.createBufferSource();
  src.buffer = decoded;
  src.connect(ctx.destination);
  src.start(0);
  return decoded.duration * 1000; // ms
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BienvenidaPage() {
  const router = useRouter();
  const [lang, setLang] = useVoiceLang() as [('es' | 'en'), (l: string) => void];

  // Redirect if already onboarded
  useEffect(() => {
    if (hasSeenFirstRun()) {
      router.replace('/spheres');
    }
  }, [router]);

  // Reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // Intro fade-in
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Sphere ring state
  const [speaking, setSpeaking] = useState<SphereAgentId | null>(null);
  const [energy, setEnergy]     = useState<Partial<Record<SphereAgentId, number>>>({});
  const [coherence, setCoherence] = useState(0);

  // Transcript + voice-failed badge
  const [transcript, setTranscript] = useState<string>('');
  const [voiceFailed, setVoiceFailed] = useState(false);

  // User input
  const [brief, setBrief] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Meeting state
  const [phase, setPhase] = useState<'idle' | 'greeting' | 'running' | 'done'>('idle');
  const [memo, setMemo]   = useState<string[]>([]);
  const [memoIsStatic, setMemoIsStatic] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Tour step — only first 2 bienvenida steps
  const [tourStep, setTourStep] = useState(0);
  const bienvenidaTourSteps = TOUR_STEPS.slice(0, 2);

  // ---------------------------------------------------------------------------
  // AudioContext — lazy; created and resumed only on first user gesture
  // ---------------------------------------------------------------------------
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const greetingBufRef    = useRef<ArrayBuffer | null>(null);
  const greetingPlayedRef = useRef(false);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const handleGesture = useCallback(async () => {
    // Unlock the bus audio pipeline on first gesture
    unlockAudio();
    // Create context on first gesture
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        setVoiceFailed(true);
        return;
      }
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { setVoiceFailed(true); return; }
    }
    // Play buffered greeting if not played yet
    if (greetingBufRef.current && !greetingPlayedRef.current) {
      greetingPlayedRef.current = true;
      const buf = greetingBufRef.current;
      greetingBufRef.current = null;
      try {
        const durationMs = await playWithContext(ctx, buf);
        setSpeaking('synthia');
        setTimeout(() => setSpeaking(null), durationMs);
        setVoiceFailed(false);
      } catch {
        setVoiceFailed(true);
      }
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Greeting on mount — fetch audio eagerly, play on first gesture
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const t = setTimeout(async () => {
      const greeting = GREETING[lang as 'es' | 'en'] ?? GREETING.es;
      setTranscript(greeting);
      setPhase('greeting');

      try {
        const res = await fetch('/api/spheres/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'synthia', text: greeting, lang }),
        });
        if (res.ok && res.headers.get('content-type')?.includes('audio')) {
          greetingBufRef.current = await res.arrayBuffer();
          // Will play on first user gesture (focus/keydown)
        } else {
          setVoiceFailed(true);
        }
      } catch {
        setVoiceFailed(true);
      }

      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    const text = brief.trim();
    if (!text || phase === 'running') return;

    setPhase('running');
    setTranscript('');
    setVoiceFailed(false);

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    let meetingId: string | null = null;
  let sseToken: string | null = null;

    try {
      const res = await fetch('/api/council/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic:       `Consejo de bienvenida: ${text}`,
          agentIds:    ['synthia', 'alex', 'cazadora'],
          initiatedBy: 'bienvenida',
          lang,
        }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as {
        meetingId?: string;
        briefId?: string;
        status?: string;
        token?: string;
      };
      meetingId = data.meetingId ?? data.briefId ?? null;
      sseToken  = data.token ?? null;
    } catch {
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setMemoIsStatic(true);
      setPhase('done');
      setTourStep(2);
      return;
    }

    if (!meetingId) {
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setMemoIsStatic(true);
      setPhase('done');
      setTourStep(2);
      return;
    }

    // Open SSE stream — include signed token so GET auth works cross-instance
    const sseUrl = sseToken
      ? `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}&token=${encodeURIComponent(sseToken)}`
      : `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`;
    const es = new EventSource(sseUrl);
    esRef.current = es;

    let tourStep1Shown = false;

    es.onmessage = (e) => {
      let event: CouncilEvent;
      try {
        event = JSON.parse(e.data as string) as CouncilEvent;
      } catch {
        return;
      }

      if (event.type === 'sphere.signal') {
        setSpeaking(event.agentId);
        setEnergy(prev => ({ ...prev, [event.agentId]: 1.0 }));
        if (event.transcript) setTranscript(event.transcript);
        if (!tourStep1Shown) { tourStep1Shown = true; setTourStep(1); }
        const dur = event.durationMs ?? 3000;
        setTimeout(() => {
          setSpeaking(prev => (prev === event.agentId ? null : prev));
          setEnergy(prev => ({ ...prev, [event.agentId]: 0.6 }));
        }, dur);
      }

      if (event.type === 'meeting.closing') setCoherence(event.coherence);

      if (event.type === 'meeting.end') {
        es.close();
        esRef.current = null;
        setSpeaking(null);
        const decisions =
          event.decisions && event.decisions.length > 0
            ? event.decisions.slice(0, 3)
            : buildStaticMemo(text, lang as 'es' | 'en');
        const isStatic = !(event.decisions && event.decisions.length > 0);
        setMemo(decisions);
        setMemoIsStatic(isStatic);
        setPhase('done');
        setTourStep(2);
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setMemoIsStatic(true);
      setPhase('done');
      setTourStep(2);
    };
  }, [brief, lang, phase]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Resume AudioContext on any key (user gesture)
    void handleGesture();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEnter = () => {
    markFirstRunSeen();
    router.push('/spheres?tour=1');
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  // Responsive ring size
  const [ringSize, setRingSize] = useState(300);
  useEffect(() => {
    const update = () =>
      setRingSize(Math.min(320, Math.floor(window.innerWidth * 0.6)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isMono = 'var(--font-plex-mono), ui-monospace, monospace';
  const isSans = 'var(--font-plex-sans), system-ui, sans-serif';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: FIELD,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: isSans,
        opacity: visible ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 600ms ease',
      }}
    >
      {/* Base styles only — no Google Fonts @import at runtime */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* LangToggle — fixed top-right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <LangToggle onChange={(l) => setLang(l)} />
      </div>

      {/* Sphere ring */}
      <div
        data-tour="ring"
        style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
      >
        <SphereRing2D
          speaking={speaking}
          energy={energy}
          coherence={coherence}
          size={ringSize}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Transcript line + voice-failed badge */}
      <p
        style={{
          fontFamily: isMono,
          fontSize: 13,
          color: TEXT_MID,
          letterSpacing: '0.02em',
          textAlign: 'center',
          maxWidth: 480,
          minHeight: '1.6em',
          margin: '0 0 4px',
          lineHeight: 1.6,
          padding: '0 8px',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {transcript}
      </p>
      {voiceFailed && (
        <span
          style={{
            display: 'inline-block',
            marginBottom: 20,
            fontFamily: isMono,
            fontSize: 10,
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 3,
            padding: '2px 6px',
          }}
          aria-label={VOICE_UNAVAILABLE[lang as 'es' | 'en'] ?? VOICE_UNAVAILABLE.es}
        >
          {VOICE_UNAVAILABLE[lang as 'es' | 'en'] ?? VOICE_UNAVAILABLE.es}
        </span>
      )}
      {!voiceFailed && <div style={{ marginBottom: 20 }} />}

      {/* Input — hidden after done */}
      {phase !== 'done' && (
        <div style={{ width: '100%', maxWidth: 520, display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { void handleGesture(); }}
            enterKeyHint="go"
            placeholder={PLACEHOLDER[lang as 'es' | 'en'] ?? PLACEHOLDER.es}
            autoFocus
            disabled={phase === 'running'}
            aria-label={PLACEHOLDER[lang as 'es' | 'en'] ?? PLACEHOLDER.es}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              color: TEXT_FULL,
              fontSize: 14,
              fontFamily: isSans,
              padding: '11px 14px',
              outline: 'none',
              opacity: phase === 'running' ? 0.5 : 1,
              transition: 'border-color 150ms, opacity 150ms',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = ACCENT_BORDER;
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = BORDER;
            }}
          />
        </div>
      )}

      {/* Memo — shown after meeting.end */}
      {phase === 'done' && memo.length > 0 && (
        <div
          data-tour="memo"
          style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}
        >
          {/* Static memo self-identification badge */}
          {memoIsStatic && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
                padding: '3px 8px',
                border: '1px dashed rgba(255,255,255,0.22)',
                borderRadius: 4,
                color: TEXT_DIM,
                fontSize: 10,
                fontFamily: isMono,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
              aria-label={STATIC_MEMO_LABEL[lang as 'es' | 'en']}
            >
              {STATIC_MEMO_LABEL[lang as 'es' | 'en'] ?? STATIC_MEMO_LABEL.es}
            </div>
          )}

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {memo.map((line, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: memoIsStatic ? 'rgba(255,255,255,0.45)' : TEXT_MID,
                  fontFamily: isSans,
                  lineHeight: 1.6,
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: memoIsStatic
                    ? '1px dashed rgba(255,255,255,0.14)'
                    : `1px solid ${BORDER}`,
                  borderRadius: 6,
                  textAlign: 'left',
                }}
              >
                {line}
              </li>
            ))}
          </ul>

          {/* Neutral enter button — no violet */}
          <button
            type="button"
            onClick={handleEnter}
            style={{
              background: 'transparent',
              border: `1px solid ${ACCENT_BORDER}`,
              borderRadius: 8,
              color: ACCENT_TEXT,
              fontSize: 14,
              fontWeight: 400,
              fontFamily: isSans,
              padding: '12px 28px',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {ENTER_LABEL[lang as 'es' | 'en'] ?? ENTER_LABEL.es}
          </button>
        </div>
      )}

      {/* Tour overlay — bienvenida steps only (steps 1 & 2) */}
      {tourStep > 0 && (
        <TourOverlay
          step={tourStep}
          steps={bienvenidaTourSteps}
          lang={lang as 'es' | 'en'}
          reducedMotion={reducedMotion}
          onDismiss={() => setTourStep(0)}
        />
      )}
    </div>
  );
}
