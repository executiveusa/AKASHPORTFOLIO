'use client';

/**
 * /spheres — Ivette's Sphere OS™ Council Dashboard
 * Full-screen cosmic sphere field + meeting launcher.
 */

import { useState } from 'react';
import { SphereField } from '@/components/SphereField';
import { SPHERE_FREQUENCY_MAP, ALL_SPHERE_IDS } from '@/shared/sphere-state';

const copy = {
  es: {
    title: 'Sphere OS™ — Consejo Cósmico',
    subtitle: 'Kupuri Media · CDMX',
    field: 'Campo',
    roster: 'Elenco',
    newMeeting: 'Nueva Reunión',
    topicPlaceholder: 'Tema de la reunión...',
    launching: 'Iniciando…',
    launch: 'Convocar Consejo',
    meetingError: 'Error al iniciar reunión',
  },
  en: {
    title: 'Sphere OS™ — Cosmic Council',
    subtitle: 'Kupuri Media · CDMX',
    field: 'Field',
    roster: 'Roster',
    newMeeting: 'New Meeting',
    topicPlaceholder: 'Meeting topic...',
    launching: 'Launching…',
    launch: 'Summon Council',
    meetingError: 'Error starting meeting',
  },
};

export default function SpheresPage() {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'field' | 'roster'>('field');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = copy[lang];

  const launchMeeting = async () => {
    if (!topic.trim()) return;
    setIsLaunching(true);
    setError(null);
    try {
      const res = await fetch('/api/council/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
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
    <main className="flex flex-col h-screen bg-[#030010] text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-violet-900/40 bg-black/40 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-sm font-bold tracking-widest uppercase text-violet-300">
            {t.title}
          </h1>
          <p className="text-[10px] text-zinc-500 tracking-widest">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-violet-700/50 text-violet-300 hover:bg-violet-900/30 transition-colors"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className={`px-3 py-1 rounded-md text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'field'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.field}
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1 rounded-md text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'roster'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.roster}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Three.js canvas */}
        <div className={`flex-1 relative transition-all ${activeTab === 'field' ? 'block' : 'hidden md:block'}`}>
          <SphereField meetingId={meetingId ?? undefined} className="w-full h-full" />
        </div>

        {/* Roster tab (mobile) */}
        {activeTab === 'roster' && (
          <div className="flex-1 overflow-y-auto p-4 md:hidden">
            <RosterGrid />
          </div>
        )}

        {/* Right sidebar — always visible on desktop */}
        <aside className="hidden md:flex flex-col w-72 border-l border-violet-900/30 bg-black/50 backdrop-blur-sm p-4 gap-4 overflow-y-auto">
          {/* Meeting launcher */}
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-violet-400 mb-2">{t.newMeeting}</h2>
            <textarea
              className="w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
              rows={3}
              placeholder={t.topicPlaceholder}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) launchMeeting(); }}
            />
            {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            <button
              onClick={launchMeeting}
              disabled={isLaunching || !topic.trim()}
              className="mt-2 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLaunching ? t.launching : t.launch}
            </button>
            {meetingId && (
              <p className="text-[9px] text-violet-400 mt-1 font-mono break-all">
                ID: {meetingId}
              </p>
            )}
          </section>

          {/* Sphere roster */}
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-violet-400 mb-2">{t.roster}</h2>
            <RosterGrid />
          </section>
        </aside>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Roster grid
// ---------------------------------------------------------------------------
function RosterGrid() {
  return (
    <div className="flex flex-col gap-2">
      {ALL_SPHERE_IDS.map((id) => {
        const cfg = SPHERE_FREQUENCY_MAP[id];
        return (
          <div
            key={id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-opacity-60 transition-colors"
            style={{ borderColor: cfg.baseColor + '40' }}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
              style={{ backgroundColor: cfg.baseColor, boxShadow: `0 0 8px ${cfg.baseColor}` }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold" style={{ color: cfg.baseColor }}>
                {cfg.displayName}
              </p>
              <p className="text-[9px] text-zinc-500 truncate">{cfg.role}</p>
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest">{cfg.locale}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
