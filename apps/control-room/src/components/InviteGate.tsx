"use client";

import { useState } from 'react';

export default function InviteGate({ children }: { children: React.ReactNode }) {
    const [code, setCode] = useState('');
    const [authorized, setAuthorized] = useState(false);

    const handleAccess = () => {
        // Simple YOLO gate
        if (code === 'KUPURI2026') {
            setAuthorized(true);
        } else {
            alert('Acceso Denegado: Código de Invitación Inválido.');
        }
    };

    if (authorized) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black font-bold italic text-3xl mb-12 animate-pulse">S</div>

            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">SYNTHIA 3.0</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-12">Acceso Exclusivo // Solo por Invitación</p>

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="INTRODUZCA CÓDIGO DE AGENCIA"
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center font-mono tracking-widest outline-none focus:border-white transition-colors"
                />
                <button
                    onClick={handleAccess}
                    className="bg-white text-black font-bold uppercase tracking-widest p-4 rounded-xl hover:bg-zinc-200 transition-transform active:scale-95"
                >
                    Entrar al Núcleo
                </button>
            </div>

            <p className="mt-12 text-[10px] text-zinc-800 uppercase tracking-widest text-center max-w-xs">
                Este sistema está en fase alfa. Todas las operaciones son monitoreadas por el Protocolo de Seguridad ACIP v1.3.
            </p>
        </div>
    );
}
