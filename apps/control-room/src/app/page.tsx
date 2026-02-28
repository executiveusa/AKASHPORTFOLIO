"use client";

import { useEffect, useState } from 'react';
import WorldClock from "../components/WorldClock";
import AgentGrid from "../components/AgentGrid";
import RepoPulse from "../components/RepoPulse";
import SynthiaTerminal from "../components/SynthiaTerminal";
import TelemetryLog from "../components/TelemetryLog";
import ViewingRoom from "../components/ViewingRoom";
import SkillMarket from "../components/SkillMarket";
import InviteGate from "../components/InviteGate";
import OrgoConsole from "../components/OrgoConsole";
import type { Agent } from "@/lib/swarm";

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);

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

  return (
    <InviteGate>
      <div className="flex min-h-screen flex-col items-center bg-black text-zinc-100 font-sans overflow-x-hidden">

        {/* Header / Branding */}
        <header className="w-full max-w-[1600px] flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 border-b border-zinc-900">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold italic text-xl">S</div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                SYNTHIA <span className="text-zinc-600">3.0</span>
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.5em] font-mono text-zinc-600 mt-2">
              Sistema Operativo Agéntico // KUPURI MEDIA™
            </p>
          </div>

          <div className="flex gap-12 text-right">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Fundadora</span>
              <span className="text-lg font-bold tracking-tight">IVETTE MILO</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Status del Núcleo</span>
              <span className="text-lg font-bold tracking-tight text-emerald-500 animate-pulse">OPTIMAL</span>
            </div>
          </div>
        </header>

        {/* Main OS Layout */}
        <main className="w-full max-w-[1600px] p-8 md:p-12 grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left Column: Communications & OS Controls */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            <SynthiaTerminal />
            <TelemetryLog />
            <OrgoConsole />
          </div>

          {/* Center/Right Column: Swarm, 3D, and Repos */}
          <div className="xl:col-span-8 flex flex-col gap-8">

            {/* Real-time World Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Reloj Global de Operaciones</h2>
                </div>
                <WorldClock />
              </div>
              <ViewingRoom agents={agents} />
            </div>

            <AgentGrid />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
              <RepoPulse />
              <SkillMarket />
            </div>

            {/* Power User Grid (The 20 Leverage Points) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <PowerButton label="Generación UGC" status="Listo" />
              <PowerButton label="Filtro ACIP" status="Activo" />
              <PowerButton label="Lead Radar" status="Escaneando" />
              <PowerButton label="Auto-Deploy" status="Standby" />
            </div>
          </div>

        </main>

        <footer className="w-full p-8 text-center text-[10px] uppercase tracking-[0.5em] text-zinc-700 border-t border-zinc-900 mt-auto">
          Synthia 3.0 // Empowering Women in Tech // KUPURI MEDIA Digital CEO Protocol
        </footer>
      </div>
    </InviteGate>
  );
}

function PowerButton({ label, status }: { label: string, status: string }) {
  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</p>
      <p className="text-xs font-bold mt-1 text-zinc-400 group-hover:text-white transition-colors">{status}</p>
    </div>
  );
}
