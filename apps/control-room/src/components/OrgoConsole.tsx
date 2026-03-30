"use client";

import { useEffect, useState, useRef } from 'react';

export default function OrgoConsole() {
    const [logs, setLogs] = useState<{ msg: string, type: 'in' | 'out' }[]>([]);
    const [command, setCommand] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const execute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command) return;

        const currentCmd = command;
        setCommand('');
        setLogs(prev => [...prev, { msg: `> ${currentCmd}`, type: 'in' }]);

        try {
            const res = await fetch('/api/synthia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Execute on Orgo: ${currentCmd}` })
            });
            const data = await res.json();
            setLogs(prev => [...prev, { msg: data.response, type: 'out' }]);
        } catch (err) {
            setLogs(prev => [...prev, { msg: "[ERROR] Conexión fallida con el Núcleo.", type: 'out' }]);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-[300px] bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden font-mono shadow-2xl">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/10">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Orgo Cloud Console</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 text-[11px] leading-relaxed scrollbar-hide">
                {logs.length === 0 && (
                    <div className="text-zinc-700 italic">Esperando comandos para el túnel Orgo...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={log.type === 'in' ? 'text-zinc-500' : 'text-emerald-400'}>
                        {log.msg}
                    </div>
                ))}
            </div>

            <form onSubmit={execute} className="p-4 bg-zinc-900/20 border-t border-zinc-900">
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Escribir comando para Orgo..."
                    className="w-full bg-transparent border-none outline-none text-zinc-300 placeholder:text-zinc-700 text-xs"
                />
            </form>
        </div>
    );
}
