'use client';

/**
 * /bienvenida — First-run Observatorio scene (60-second rule).
 *
 * Flow:
 *   1. Mount → hasSeenFirstRun() → if true, redirect to /spheres
 *   2. SYNTHIA greeting line appears; best-effort voice synthesis plays
 *   3. User types one sentence → Enter / submit
 *   4. POST /api/council/orchestrator → EventSource SSE stream
 *   5. sphere.signal events: set speaking sphere + append transcript
 *      → TourOverlay step 1 anchors to ring
 *   6. meeting.closing / meeting.end → show memo (decisions[] or synthesis)
 *      → TourOverlay step 2 anchors to memo
 *   7. "Entrar al observatorio" → markFirstRunSeen() → /spheres?tour=1
 *
 * Degradation: on any orchestrator error, show a static 3-bullet memo and
 * let the user enter the observatory.
 *
 * Mobile: ring ≤ 60vw; input full width; no overflow.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { hasSeenFirstRun, markFirstRunSeen, TOUR_STEPS } from '@/lib/first-run';
import { LangToggle, useVoiceLang } from '@/components/LangToggle';
import { SphereRing2D } from '@/components/SphereRing2D';
import { TourOverlay } from '@/components/tour/TourOverlay';
import type { SphereAgentId, CouncilEvent } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIELD = '#07080c';
const TEXT_DIM = 'rgba(255,255,255,0.42)';
const TEXT_MID = 'rgba(255,255,255,0.72)';
const TEXT_FULL = 'rgba(255,255,255,0.92)';
const BORDER = 'rgba(255,255,255,0.10)';
const ACCENT = '#8b5cf6'; // synthia violet

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

// ---------------------------------------------------------------------------
// Web Audio helper
// ---------------------------------------------------------------------------

async function playAudioArrayBuffer(buf: ArrayBuffer): Promise<number> {
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(buf);
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.connect(ctx.destination);
  source.start(0);
  return decoded.duration * 1000; // ms
}

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

  // Intro fade-in state
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Sphere ring state
  const [speaking, setSpeaking] = useState<SphereAgentId | null>(null);
  const [energy, setEnergy] = useState<Partial<Record<SphereAgentId, number>>>({});
  const [coherence, setCoherence] = useState(0);

  // Transcript line shown under the ring
  const [transcript, setTranscript] = useState<string>('');

  // User input
  const [brief, setBrief] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Meeting state
  const [phase, setPhase] = useState<'idle' | 'greeting' | 'running' | 'done'>('idle');
  const [memo, setMemo] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  // Tour step
  const [tourStep, setTourStep] = useState(0);
  // Only the bienvenida steps (first 2)
  const bienvenidaTourSteps = TOUR_STEPS.slice(0, 2);

  // ---------------------------------------------------------------------------
  // Greeting on mount
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
          const buf = await res.arrayBuffer();
          setSpeaking('synthia');
          const durationMs = await playAudioArrayBuffer(buf);
          setTimeout(() => setSpeaking(null), durationMs);
        }
        // Text fallback: transcript already displayed above
      } catch {
        // Voice unavailable — transcript already displayed, continue
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

    // Close any prior stream
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    let meetingId: string | null = null;

    try {
      const res = await fetch('/api/council/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Consejo de bienvenida: ${text}`,
          agentIds: ['synthia', 'alex', 'cazadora'],
          initiatedBy: 'bienvenida',
        }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as {
        meetingId?: string;
        briefId?: string;
        status?: string;
      };
      meetingId = data.meetingId ?? data.briefId ?? null;
    } catch {
      // Degrade: static memo
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setPhase('done');
      setTourStep(2); // skip to memo overlay
      return;
    }

    if (!meetingId) {
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setPhase('done');
      setTourStep(2);
      return;
    }

    // Open SSE stream
    const es = new EventSource(
      `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`,
    );
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
        // Boost energy for speaking sphere
        setEnergy(prev => ({ ...prev, [event.agentId]: 1.0 }));
        if (event.transcript) {
          setTranscript(event.transcript);
        }
        // Show ring tour overlay on first signal
        if (!tourStep1Shown) {
          tourStep1Shown = true;
          setTourStep(1);
        }
        // Auto-clear speaking after durationMs
        const dur = event.durationMs ?? 3000;
        setTimeout(() => {
          setSpeaking(prev => (prev === event.agentId ? null : prev));
          setEnergy(prev => ({ ...prev, [event.agentId]: 0.6 }));
        }, dur);
      }

      if (event.type === 'meeting.closing') {
        setCoherence(event.coherence);
      }

      if (event.type === 'meeting.end') {
        es.close();
        esRef.current = null;
        setSpeaking(null);
        const decisions =
          event.decisions && event.decisions.length > 0
            ? event.decisions.slice(0, 3)
            : buildStaticMemo(text, lang as 'es' | 'en');
        setMemo(decisions);
        setPhase('done');
        setTourStep(2);
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Always degrade — onerror only fires when the stream breaks unexpectedly
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setPhase('done');
      setTourStep(2);
    };
  }, [brief, lang, phase]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  // ---------------------------------------------------------------------------
  // Responsive ring size — updated after mount to avoid hydration mismatch
  // ---------------------------------------------------------------------------

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

  const isMono = '"IBM Plex Mono", "Courier New", monospace';
  const isSans = '"IBM Plex Sans", system-ui, -apple-system, sans-serif';

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
      {/* IBM Plex font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* LangToggle — fixed top-right */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
        }}
      >
        <LangToggle onChange={(l) => setLang(l)} />
      </div>

      {/* Sphere ring */}
      <div
        data-tour="ring"
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <SphereRing2D
          speaking={speaking}
          energy={energy}
          coherence={coherence}
          size={ringSize}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Transcript line — SYNTHIA or active sphere */}
      <p
        style={{
          fontFamily: isMono,
          fontSize: 13,
          color: TEXT_MID,
          letterSpacing: '0.02em',
          textAlign: 'center',
          maxWidth: 480,
          minHeight: '1.6em',
          margin: '0 0 28px',
          lineHeight: 1.6,
          padding: '0 8px',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {transcript}
      </p>

      {/* Input — shown only while idle/greeting/running, hidden after done */}
      {phase !== 'done' && (
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            onKeyDown={handleKeyDown}
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = BORDER;
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!brief.trim() || phase === 'running'}
            aria-label={lang === 'en' ? 'Submit' : 'Enviar'}
            style={{
              background:
                brief.trim() && phase !== 'running' ? ACCENT : 'rgba(255,255,255,0.07)',
              border: 'none',
              borderRadius: 8,
              color: brief.trim() && phase !== 'running' ? '#fff' : TEXT_DIM,
              width: 44,
              height: 44,
              fontSize: 18,
              cursor: brief.trim() && phase !== 'running' ? 'pointer' : 'default',
              transition: 'background 150ms',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ↑
          </button>
        </div>
      )}

      {/* Memo — shown after meeting.end */}
      {phase === 'done' && memo.length > 0 && (
        <div
          data-tour="memo"
          style={{
            width: '100%',
            maxWidth: 520,
            textAlign: 'center',
          }}
        >
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
                  color: TEXT_MID,
                  fontFamily: isSans,
                  lineHeight: 1.6,
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  textAlign: 'left',
                }}
              >
                {line}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleEnter}
            style={{
              background: ACCENT,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
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
          onNext={() =>
            setTourStep((s) => {
              const next = s + 1;
              return next > bienvenidaTourSteps.length ? 0 : next;
            })
          }
          onDismiss={() => setTourStep(0)}
        />
      )}
    </div>
  );
}
