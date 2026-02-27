"use client";

import { useEffect, useState } from 'react';
import type { Agent } from '@/lib/swarm';

export default function AgentGrid() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAgents() {
            try {
                const res = await fetch('/api/swarm');
                const data = await res.json();
                setAgents(data);
            } catch (err) {
                console.error("Failed to fetch swarm agents:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Gestor de Enjambre (Synthia Swarm)</h2>
                <button className="text-[10px] font-bold uppercase bg-zinc-900 text-white px-3 py-1 rounded-full hover:bg-zinc-700 transition-colors">
                    + Desplegar Agente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <div key={agent.id} className="relative p-6 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group">
                        {/* Status Pulse */}
                        <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${agent.status === 'working' ? 'bg-cyan-500 animate-pulse' : agent.status === 'error' ? 'bg-rose-500' : 'bg-zinc-600'}`}></div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-white italic uppercase">{agent.name}</h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mt-1">{agent.role}</p>
                            </div>

                            <div className="py-4 border-y border-zinc-900">
                                <p className="text-xs text-zinc-400 line-clamp-2">
                                    {agent.currentTask || "En espera de instrucciones..."}
                                </p>
                            </div>

                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-600">
                                <span>ID: {agent.id.split('-')[1]}</span>
                                <span>Sync: {new Date(agent.lastSeen).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-transform hover:scale-105">
                                Intervenir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
