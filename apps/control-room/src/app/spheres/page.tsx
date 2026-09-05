'use client';

/**
 * /spheres — Observatorio Council Dashboard
 *
 * Controls kept: start button, topic input, LangToggle.
 *
 * Removed (subtraction test):
 *   - Field/Roster tab switcher (no field value mapping)
 *   - Sidebar roster grid (decorative list, no physics data)
 *   - Sphere legend sidebar list (replaced by HUD readouts)
 *   - Custom inline lang toggle (replaced by LangToggle component)
 *   - "EN VIVO / DEMO" live badge (state is in HUD)
 *   - Active sphere tooltip chrome (now accessible via click and keyboard sr-only list — see SphereField.tsx)
 *
 * Tour anchors: data-tour="iniciar-consejo", "aprobaciones", "mercados"
 * (aprobaciones and mercados are rendered inside SphereField's HUD strip)
 */

import { Suspense, useState } from 'react';
import { SphereField } from '@/components/SphereField';
import { LangToggle, useVoiceLang } from '@/components/LangToggle';
import { SpheresTour } from '@/components/tour/SpheresTour';
import { useCouncilLang } from '@/lib/council/selectors';

const copy = {
  es: {
    title:            'Observatorio del Consejo',
    topicPlaceholder: 'Tema de la reunión…',
    launching:        'Iniciando…',
    launch:           'Convocar Consejo',
    meetingError:     'Error al iniciar reunión',
  },
  en: {
    title:            'Council Observatory',
    topicPlaceholder: 'Meeting topic…',
    launching:        'Launching…',
    launch:           'Summon Council',
    meetingError:     'Error starting meeting',
  },
} as const;

export default function SpheresPage() {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [topic, setTopic]         = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [lang]                    = useCouncilLang();
  const [voiceLang]               = useVoiceLang();
  const t = copy[lang as 'es' | 'en'] ?? copy.es;

  const launchMeeting = async () => {
    if (!topic.trim()) return;
    setIsLaunching(true);
    setError(null);
    try {
      const res = await fetch('/api/council/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), lang: voiceLang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { meetingId?: string };
      if (data.meetingId) setMeetingId(data.meetingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.meetingError);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <main
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: '#07080c', color: '#fff' }}
    >
      {/* Top bar — LangToggle top-right, topic input + start button */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(7,8,12,0.9)',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            flexShrink: 0,
          }}
        >
          {t.title}
        </span>

        {/* Topic input */}
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') launchMeeting(); }}
          placeholder={t.topicPlaceholder}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5,
            padding: '6px 10px',
            color: '#fff',
            fontSize: 12,
            fontFamily: '"IBM Plex Sans", sans-serif',
            outline: 'none',
          }}
        />

        {/* Start button */}
        <button
          data-tour="iniciar-consejo"
          onClick={launchMeeting}
          disabled={isLaunching || !topic.trim()}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid rgba(232,233,238,0.35)',
            borderRadius: 5,
            color: '#e8e9ee',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: isLaunching || !topic.trim() ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            opacity: isLaunching || !topic.trim() ? 0.4 : 1,
          }}
        >
          {isLaunching ? t.launching : t.launch}
        </button>

        {/* LangToggle — top-right */}
        <LangToggle />
      </header>

      {error && (
        <p
          style={{
            margin: 0,
            padding: '4px 16px',
            background: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            fontSize: 11,
            fontFamily: '"IBM Plex Mono", monospace',
          }}
        >
          {error}
        </p>
      )}

      {/* Full-screen field */}
      <div className="flex-1 relative">
        <SphereField meetingId={meetingId ?? undefined} className="absolute inset-0" />
      </div>

      {/* Tour overlay (shown when ?tour=1) */}
      <Suspense>
        <SpheresTour lang={lang as 'es' | 'en'} />
      </Suspense>
    </main>
  );
}
