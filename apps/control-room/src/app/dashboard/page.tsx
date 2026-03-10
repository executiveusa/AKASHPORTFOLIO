"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import WorldClock from "../../components/WorldClock";
import AgentGrid from "../../components/AgentGrid";
import RepoPulse from "../../components/RepoPulse";
import SynthiaTerminal from "../../components/SynthiaTerminal";
import TelemetryLog from "../../components/TelemetryLog";
import ViewingRoom from "../../components/ViewingRoom";
import SkillMarket from "../../components/SkillMarket";
import InviteGate from "../../components/InviteGate";
import OrgoConsole from "../../components/OrgoConsole";
import TaskDelegation from "../../components/TaskDelegation";
import SocialMediaManager from "../../components/SocialMediaManager";
import ReportsAndAnalytics from "../../components/ReportsAndAnalytics";
import { DailyBriefCard } from "../../components/DailyBriefCard";
import MeetingSchedule from "../../components/MeetingSchedule";
import type { Agent } from "@/lib/swarm";
import { MEETING_LOCATIONS, WEEKLY_SCHEDULE } from "@/lib/meeting-locations";

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/swarm');
        const data = await res.json();
        setAgents(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    es: {
      title: 'SYNTHIA 3.0',
      subtitle: 'Sistema Operativo Agéntico',
      founder: 'Fundadora',
      status: 'Status del Núcleo',
      optimal: 'ÓPTIMO',
      nerve: 'NERVIO',
      command: 'COMANDO',
      manifest: 'MANIFESTACIÓN',
      worldClock: 'Reloj Global de Operaciones',
      theaterLink: '🎭 Sala del Consejo',
      language: 'IDIOMA',
      spanish: 'ES',
      english: 'EN'
    },
    en: {
      title: 'SYNTHIA 3.0',
      subtitle: 'Agentic Operating System',
      founder: 'Founder',
      status: 'Core Status',
      optimal: 'OPTIMAL',
      nerve: 'NERVE',
      command: 'COMMAND',
      manifest: 'MANIFEST',
      worldClock: 'Global Operations Clock',
      theaterLink: '🎭 Council Chamber',
      language: 'LANGUAGE',
      spanish: 'ES',
      english: 'EN'
    }
  };

  const labels = t[language];

  return (
    <InviteGate>
      {/* 3-Layer Background */}
      <div
        className="min-h-screen flex flex-col bg-charcoal-900 text-cream-100 font-sans overflow-x-hidden relative"
        style={{
          backgroundImage: `url(/images/work-item-3.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-charcoal-900/85 backdrop-blur-sm" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen">

          {/* Header */}
          <header className="w-full glass-panel-elevated border-b border-gold-600/30 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-8">

              {/* Branding */}
              <div className="flex flex-col gap-2 flex-1">
                <h1 className="text-6xl font-display font-bold tracking-tight text-gold-400">
                  {labels.title}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.5em] text-cream-400">
                  {labels.subtitle} // KUPURI MEDIA™
                </p>
              </div>

              {/* Founder + Status + Language Toggle */}
              <div className="flex gap-8 md:gap-12 items-center">
                <div className="text-right hidden md:block">
                  <span className="text-[10px] uppercase tracking-widest text-cream-400 block">{labels.founder}</span>
                  <span className="text-lg font-bold text-cream-100">IVETTE MILO</span>
                </div>

                <div className="text-right hidden md:block">
                  <span className="text-[10px] uppercase tracking-widest text-cream-400 block">{labels.status}</span>
                  <span className="text-lg font-bold text-gold-400 gold-pulse">{labels.optimal}</span>
                </div>

                {/* Language Toggle */}
                <div className="flex gap-2 glass-panel px-3 py-2">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded transition-all ${
                      language === 'es'
                        ? 'bg-gold-400 text-charcoal-900'
                        : 'text-cream-400 hover:text-cream-100'
                    }`}
                  >
                    {labels.spanish}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded transition-all ${
                      language === 'en'
                        ? 'bg-gold-400 text-charcoal-900'
                        : 'text-cream-400 hover:text-cream-100'
                    }`}
                  >
                    {labels.english}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - 3 Column Grid */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-12 py-16 grid grid-cols-1 xl:grid-cols-12 gap-12">

            {/* LEFT COLUMN: NERVE (Communications & Controls) */}
            <div className="xl:col-span-3 flex flex-col gap-8">
              <div className="glass-panel-elevated p-6">
                <h2 className="text-[10px] uppercase tracking-widest font-bold text-gold-400 mb-4">{labels.nerve}</h2>
                <SynthiaTerminal />
              </div>
              <div className="glass-panel-elevated p-6">
                <TelemetryLog />
              </div>
              <div className="glass-panel-elevated p-6">
                <OrgoConsole />
              </div>
            </div>

            {/* CENTER COLUMN: COMMAND (Operations & Visualization) */}
            <div className="xl:col-span-6 flex flex-col gap-8">
              <div className="glass-panel-elevated p-6">
                <h2 className="text-[10px] uppercase tracking-widest font-bold text-gold-400 mb-4">{labels.command}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-cream-400">{labels.worldClock}</h3>
                    </div>
                    <WorldClock />
                  </div>
                  <ViewingRoom agents={agents} />
                </div>
              </div>

              {/* Daily Brief Card */}
              <DailyBriefCard language={language} />

              <div className="glass-panel-elevated p-6">
                <AgentGrid />
              </div>

              <div className="glass-panel-elevated p-6">
                <ReportsAndAnalytics />
              </div>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Theater Link Button */}
                <a
                  href="/theater"
                  className="glass-panel-elevated px-6 py-4 hover:bg-gold-600/10 transition-all border border-gold-600/50 hover:border-gold-400 text-center"
                >
                  <span className="text-gold-400 font-bold uppercase tracking-widest text-sm">{labels.theaterLink}</span>
                </a>

                {/* ALEX Link Button */}
                <a
                  href="/alex"
                  className="glass-panel-elevated px-6 py-4 hover:bg-amber-600/10 transition-all border border-amber-600/50 hover:border-amber-400 text-center"
                >
                  <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">🤖 ALEX™</span>
                </a>

                {/* Skills Link Button */}
                <a
                  href="/skills"
                  className="glass-panel-elevated px-6 py-4 hover:bg-amber-600/10 transition-all border border-amber-600/50 hover:border-amber-400 text-center"
                >
                  <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">⚡ {language === 'es' ? 'Habilidades' : 'Skills'}</span>
                </a>
              </div>

              {/* Power Buttons */}
              <div className="glass-panel-elevated p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PowerButton label="Generación UGC" status="Listo" language={language} />
                  <PowerButton label="Filtro ACIP" status="Activo" language={language} />
                  <PowerButton label="Lead Radar" status="Escaneando" language={language} />
                  <PowerButton label="Auto-Deploy" status="Standby" language={language} />
                </div>
              </div>

              {/* World Meeting Locations – Demo Cards */}
              <div className="glass-panel-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] uppercase tracking-widest font-bold text-gold-400">
                    {language === 'es' ? '🌍 Lugares de Reunión Mundiales' : '🌍 World Meeting Locations'}
                  </h2>
                  <a
                    href="/theater"
                    className="text-[9px] uppercase tracking-widest text-gold-400 hover:text-gold-300 border border-gold-400/30 hover:border-gold-400 px-3 py-1 rounded-full transition-all"
                  >
                    {language === 'es' ? 'Abrir Teatro' : 'Open Theater'} →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MEETING_LOCATIONS.map((loc) => (
                    <a
                      key={loc.id}
                      href={`/theater`}
                      className="relative group rounded-xl overflow-hidden border border-zinc-800 hover:border-gold-400/50 transition-all"
                    >
                      <div className="relative h-28 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={loc.referenceImageUrl}
                          alt={loc.nameEs}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to bottom, transparent 30%, #${loc.bgColor.toString(16).padStart(6, '0')}dd 100%)`,
                          }}
                        />
                        <div className="absolute bottom-0 left-0 p-2">
                          <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: loc.accentHex }}>
                            {loc.neighborhood.split(',')[0]}
                          </p>
                          <p className="text-xs font-bold text-white leading-tight">{loc.nameEs.split('–')[0].trim()}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Council Meeting Schedule */}
              <div className="glass-panel-elevated p-6">
                <MeetingSchedule language={language} />
              </div>
            </div>

            {/* RIGHT COLUMN: MANIFEST (Vision & Tools) */}
            <div className="xl:col-span-3 flex flex-col gap-8">
              <div className="glass-panel-elevated p-6">
                <h2 className="text-[10px] uppercase tracking-widest font-bold text-gold-400 mb-4">{labels.manifest}</h2>
                <TaskDelegation />
              </div>
              <div className="glass-panel-elevated p-6">
                <SocialMediaManager />
              </div>
              <div className="glass-panel-elevated p-6">
                <SkillMarket />
              </div>
              <div className="glass-panel-elevated p-6">
                <RepoPulse />
              </div>
            </div>

          </main>

          {/* Footer */}
          <footer className="relative mt-auto w-full p-8 text-center text-[10px] uppercase tracking-[0.5em] text-cream-400 border-t border-gold-600/30">
            Synthia 3.0 // Empowering Women in Tech // KUPURI MEDIA Digital CEO Protocol
          </footer>

        </div>
      </div>
    </InviteGate>
  );
}

function PowerButton({
  label,
  status,
  language
}: {
  label: string,
  status: string,
  language: 'es' | 'en'
}) {
  return (
    <div className="glass-panel p-4 hover:bg-gold-400/10 transition-all border border-gold-600/30 hover:border-gold-400/50 cursor-pointer group">
      <p className="text-[10px] uppercase tracking-widest text-cream-400 group-hover:text-gold-400 transition-colors">{label}</p>
      <p className="text-xs font-bold mt-2 text-gold-400 group-hover:text-cream-100 transition-colors">{status}</p>
    </div>
  );
}
