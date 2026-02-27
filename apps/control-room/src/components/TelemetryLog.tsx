"use client";

import { useEffect, useState, useRef } from 'react';
import type { TelemetryEvent } from '@/lib/observability';

export default function TelemetryLog() {
    const [events, setEvents] = useState<TelemetryEvent[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/telemetry/stream');

        eventSource.onmessage = (event) => {
            const newEvent = JSON.parse(event.data);
            setEvents(prev => [...prev.slice(-100), newEvent]);
        };

        return () => eventSource.close();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <section className="flex flex-col gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden h-[300px]">
            <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Observabilidad // Streaming de Telemetría</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1">
                {events.map((e) => (
                    <div key={e.id} className="flex gap-4 border-b border-zinc-900 pb-1">
                        <span className="text-zinc-600">[{new Date(e.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-bold ${e.type === 'error' ? 'text-rose-500' :
                                e.type === 'tool_call' ? 'text-cyan-500' :
                                    e.type === 'success' ? 'text-emerald-500' : 'text-zinc-500'
                            }`}>
                            {e.type.toUpperCase()}
                        </span>
                        <span className="text-zinc-400">{e.summary}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
