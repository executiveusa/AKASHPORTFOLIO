'use client';

/**
 * /bienvenida — First-run Observatorio scene (60-second rule).
 *
 * Flow:
 *   1. Mount → hasSeenFirstRun() → if true, redirect to /spheres
 *   2. SYNTHIA greeting line appears; voice synthesis attempted on first user gesture
 *   3. User types one sentence → Enter / submit
 *   4. POST /api/council/orchestrator (initiatedBy: 'bienvenida', lang) → bus.connect(meetingId, { token })
 *   5. sphere.signal events: speaking/transcript/energy read from bus (SphereRing2D driven by field.spheres)
 *      → TourOverlay step 1 anchors to ring when bus.connection === 'live'
 *   6. meeting.end → show memo (decisions[] from bus transcript)
 *      → TourOverlay step 2 anchors to memo
 *   7. "Entrar al observatorio" → markFirstRunSeen() → /spheres?tour=1
 *
 * Watchdog: 20 s timer reset on every bus transcript change / field tick;
 *   on expiry → disconnect + static memo. Hard 90 s cap.
 *
 * Degradation: on any orchestrator error, show a self-identifying static memo
 * (dashed border, muted, labelled "Sin consejo en vivo — memo de ejemplo").
 *
 * Mobile: ring ≤ 60vw; input full width; no overflow.
 *
 * AudioContext: created/resumed only on first user gesture (focus or keydown on
 * the input). The greeting audio buffer is fetched eagerly but played on gesture.
 * Council turns route through the bus (MediaSource TTFA applies).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { hasSeenFirstRun, markFirstRunSeen, TOUR_STEPS } from '@/lib/first-run';
import { LangToggle, useVoiceLang } from '@/components/LangToggle';
import { SphereRing2D } from '@/components/SphereRing2D';
import { TourOverlay } from '@/components/tour/TourOverlay';
import { unlockAudio, useCouncilBus } from '@/lib/council/bus';
import { ApprovalCard } from '@/components/ApprovalCard';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Constants — Observatorio design tokens
// ---------------------------------------------------------------------------

const FIELD    = '#07080c';
const TEXT_DIM = 'rgba(255,255,255,0.42)';
const TEXT_MID = 'rgba(255,255,255,0.72)';
const TEXT_FULL = 'rgba(255,255,255,0.92)';
const BORDER   = 'rgba(255,255,255,0.10)';
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
  return decoded.duration * 1000;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BienvenidaPage() {
  const router = useRouter();
  const [lang] = useVoiceLang();

  // Bus state
  const busConnect    = useCouncilBus((s) => s.connect);
  const busDisconnect = useCouncilBus((s) => s.disconnect);
  const busConnection = useCouncilBus((s) => s.connection);
  const busTranscript = useCouncilBus((s) => s.transcript);
  const busField      = useCouncilBus((s) => s.field);
  const busSpeaking   = useCouncilBus((s) => s.speaking);
  const busApproval   = useCouncilBus((s) => s.approvalPending);

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

  // Local energy + coherence derived from bus field
  const energy: Partial<Record<SphereAgentId, number>> = {};
  let coherenceVal = 0;
  if (busField) {
    coherenceVal = busField.groupCoherence;
    for (const [id, sphere] of busField.spheres.entries()) {
      energy[id] = sphere.energy;
    }
  }

  // Transcript display — last bus transcript text, falling back to greeting
  const [greetingText, setGreetingText] = useState('');
  const lastTranscriptText =
    busTranscript.length > 0
      ? (busTranscript[busTranscript.length - 1].text ?? '')
      : greetingText;

  // Voice-failed badge (only for greeting; bus handles council turns)
  const [voiceFailed, setVoiceFailed] = useState(false);

  // User input
  const [brief, setBrief] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Meeting state
  const [phase, setPhase] = useState<'idle' | 'greeting' | 'running' | 'done'>('idle');
  const [memo, setMemo]   = useState<string[]>([]);
  const [memoIsStatic, setMemoIsStatic] = useState(false);
  const briefTextRef = useRef('');
  // Ref-tracked phase for use inside timeout callbacks (avoids stale closure)
  const phaseRef = useRef<'idle' | 'greeting' | 'running' | 'done'>('idle');

  // Tour step — only first 2 bienvenida steps
  const [tourStep, setTourStep] = useState(0);
  const bienvenidaTourSteps = TOUR_STEPS.slice(0, 2);

  // ---------------------------------------------------------------------------
  // AudioContext — lazy; created and resumed only on first user gesture
  // (used only for greeting clip; council turns use bus MediaSource)
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
        await playWithContext(ctx, buf);
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
      setGreetingText(greeting);
      setPhase('greeting');

      try {
        const res = await fetch('/api/spheres/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'synthia', text: greeting, lang }),
        });
        if (res.ok && res.headers.get('content-type')?.includes('audio')) {
          greetingBufRef.current = await res.arrayBuffer();
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
  // Tour auto-advance: step 1 when bus goes live (meeting started)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (busConnection === 'live' && phase === 'running' && tourStep === 0) {
      setTourStep(1);
    }
  }, [busConnection, phase, tourStep]);

  // ---------------------------------------------------------------------------
  // Watch bus for meeting.end (connection transitions to idle after meeting)
  // Phase transitions to done once meeting ends and we have decisions from transcript
  // ---------------------------------------------------------------------------
  const meetingEndHandledRef = useRef(false);

  useEffect(() => {
    if (
      phase === 'running' &&
      busConnection === 'idle' &&
      !meetingEndHandledRef.current
    ) {
      meetingEndHandledRef.current = true;
      // Collect decisions from bus transcript
      const decisions = busTranscript
        .filter(e => e.kind === 'ASSERT' && e.text)
        .map(e => e.text as string)
        .slice(-3);
      if (decisions.length > 0) {
        setMemo(decisions);
        setMemoIsStatic(false);
      } else {
        setMemo(buildStaticMemo(briefTextRef.current, lang as 'es' | 'en'));
        setMemoIsStatic(true);
      }
      setPhase('done');
      setTourStep(2);
    }
  }, [busConnection, phase, busTranscript, lang]);

  // Keep phaseRef current so timeout callbacks can read latest phase
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ---------------------------------------------------------------------------
  // Watchdog: 20 s timer reset on every transcript change / field tick.
  // On expiry: disconnect + static memo. Hard 90 s cap.
  // ---------------------------------------------------------------------------
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardCapRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armWatchdog = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      // Use ref to avoid stale closure over phase
      if (phaseRef.current === 'running') {
        busDisconnect();
        setMemo(buildStaticMemo(briefTextRef.current, lang as 'es' | 'en'));
        setMemoIsStatic(true);
        setPhase('done');
        setTourStep(2);
      }
    }, 20_000);
  }, [busDisconnect, lang]);

  // Reset watchdog whenever transcript or field ticks
  useEffect(() => {
    if (phase === 'running') armWatchdog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busTranscript.length, busField, phase]);

  // Hard 90 s cap — set once when phase becomes 'running'
  useEffect(() => {
    if (phase !== 'running') return;
    hardCapRef.current = setTimeout(() => {
      if (phaseRef.current === 'running') {
        busDisconnect();
        setMemo(buildStaticMemo(briefTextRef.current, lang as 'es' | 'en'));
        setMemoIsStatic(true);
        setPhase('done');
        setTourStep(2);
      }
    }, 90_000);
    return () => {
      if (hardCapRef.current) clearTimeout(hardCapRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cleanup timers + bus on unmount
  useEffect(() => {
    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (hardCapRef.current) clearTimeout(hardCapRef.current);
      busDisconnect();
    };
  }, [busDisconnect]);

  // ---------------------------------------------------------------------------
  // Submit handler — POST to orchestrator, then connect bus
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    const text = brief.trim();
    if (!text || phase === 'running') return;

    briefTextRef.current = text;
    setPhase('running');
    setVoiceFailed(false);
    meetingEndHandledRef.current = false;

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
      const meetingId = data.meetingId ?? data.briefId ?? null;
      const sseToken  = data.token ?? undefined;

      if (!meetingId) throw new Error('no meetingId');

      // Connect bus — routes council turns through MediaSource for TTFA
      busConnect(meetingId, { token: sseToken });
      // Arm initial watchdog
      armWatchdog();

    } catch {
      setMemo(buildStaticMemo(text, lang as 'es' | 'en'));
      setMemoIsStatic(true);
      setPhase('done');
      setTourStep(2);
    }
  }, [brief, lang, phase, busConnect, armWatchdog]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* LangToggle — fixed top-right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <LangToggle />
      </div>

      {/* Sphere ring — driven by bus field */}
      <div
        data-tour="ring"
        style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
      >
        <SphereRing2D
          speaking={busSpeaking}
          energy={energy}
          coherence={coherenceVal}
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
        {lastTranscriptText}
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

      {/* ApprovalCard — shown when bus.approvalPending */}
      {busApproval && (
        <div style={{ width: '100%', maxWidth: 520, marginTop: 16, position: 'relative' }}>
          <ApprovalCard />
        </div>
      )}

      {/* Memo — shown after meeting.end */}
      {phase === 'done' && memo.length > 0 && (
        <div
          data-tour="memo"
          style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}
        >
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
