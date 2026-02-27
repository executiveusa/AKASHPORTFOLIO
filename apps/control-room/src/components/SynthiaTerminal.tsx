"use client";

import { useState, useRef, useEffect } from 'react';

export default function SynthiaTerminal() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ type: 'user' | 'agent', text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setHistory(prev => [...prev, { type: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/synthia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            if (data.success) {
                setHistory(prev => [...prev, { type: 'agent', text: data.response }]);
            } else {
                setHistory(prev => [...prev, { type: 'agent', text: `ERROR: ${data.error}` }]);
            }
        } catch (err) {
            setHistory(prev => [...prev, { type: 'agent', text: 'FATAL: Fallo en la conexión con el núcleo Synthia.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden h-[500px]">
            <div className="bg-zinc-900 px-6 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Synthia 3.0 // Kernel Terminal</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4">
                <div className="text-zinc-500 uppercase text-[10px] tracking-widest mb-8">
                    *** SISTEMA OPERATIVO SYNTHIA INICIALIZADO ***<br />
                    CONEXIÓN ESTABLECIDA CON MINIMAX CLUSTER<br />
                    FILTROS DE SEGURIDAD ACIP V1.3 ACTIVOS
                </div>

                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold'}`}>
                            <span className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1">
                                {msg.type === 'user' ? 'IVETTE' : 'SYNTHIA'}
                            </span>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-cyan-500 animate-pulse font-bold tracking-widest">
                        SYNTHIA ESTÁ PENSANDO...
                    </div>
                )}
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escriba un comando para la CEO..."
                    className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-sm"
                />
                <button
                    onClick={handleSend}
                    className="text-xs font-bold uppercase tracking-widest bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-transform active:scale-95"
                >
                    Enviar
                </button>
            </div>
        </section>
    );
}
