'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface VozInterfaceProps {
  mesaId?: string;
  onMisionCreada?: (data: unknown) => void;
  className?: string;
}

type VozEstado = 'idle' | 'escuchando' | 'procesando' | 'hecho' | 'error';

export function VozInterface({ mesaId, onMisionCreada, className = '' }: VozInterfaceProps) {
  const [estado, setEstado] = useState<VozEstado>('idle');
  const [transcripcion, setTranscripcion] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'es-MX';
    r.maxAlternatives = 1;

    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((res: any) => res[0].transcript).join('');
      setTranscripcion(t);
    };
    r.onend = () => {
      if (!abortRef.current) void enviar();
      setEstado(s => s === 'escuchando' ? 'procesando' : s);
    };
    r.onerror = () => { setEstado('error'); };

    recognitionRef.current = r;
    return () => { recognitionRef.current = null; };
  }, []);

  const toggle = useCallback(() => {
    if (estado === 'escuchando') {
      abortRef.current = true;
      recognitionRef.current?.stop();
      setEstado('idle');
      abortRef.current = false;
      return;
    }
    setTranscripcion('');
    setResultado(null);
    setEstado('escuchando');
    recognitionRef.current?.start();
  }, [estado]);

  const enviar = useCallback(async () => {
    if (!transcripcion.trim()) { setEstado('idle'); return; }
    setEstado('procesando');
    try {
      const res = await fetch('/api/voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripcion, idioma: 'es', mesa_id: mesaId }),
      });
      const data = await res.json();
      setResultado(res.ok
        ? `✅ Misión creada — ${(data.expedicion_creada as string)?.slice(0, 8) ?? '...'}`
        : `❌ ${data.error ?? 'Error'}`
      );
      setEstado('hecho');
      onMisionCreada?.(data);
    } catch {
      setResultado('❌ Sin conexión al backend');
      setEstado('error');
    }
    setTimeout(() => setEstado('idle'), 4000);
  }, [transcripcion, mesaId, onMisionCreada]);

  const isListening = estado === 'escuchando';
  const color = isListening ? '#c8a04a' : estado === 'hecho' ? '#4a8a6a' : estado === 'error' ? '#8a4040' : '#2a2a2a';

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={toggle}
        aria-label={isListening ? 'Detener' : 'Hablar'}
        className="relative w-16 h-16 rounded-full flex items-center justify-center select-none transition-all"
        style={{
          background: color,
          border: `2px solid ${color}40`,
          boxShadow: isListening ? `0 0 20px ${color}80` : 'none',
        }}
      >
        <span className="text-xl pointer-events-none">
          {estado === 'procesando' ? '⏳' : isListening ? '🎙️' : '🎤'}
        </span>
      </button>

      <p style={{
        color: 'rgba(200,160,74,0.6)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        letterSpacing: '1.5px',
      }}>
        {estado === 'escuchando' ? 'ESCUCHANDO...' :
         estado === 'procesando' ? 'PROCESANDO...' :
         estado === 'hecho' ? 'LISTO' :
         'TOCA PARA HABLAR'}
      </p>

      {transcripcion && (
        <p className="text-xs text-center max-w-xs px-3 py-2 rounded-lg transition-opacity"
          style={{
            background: 'rgba(200,160,74,0.06)',
            border: '1px solid rgba(200,160,74,0.15)',
            color: '#c8b896',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '13px',
            opacity: transcripcion ? 1 : 0,
          }}
        >
          "{transcripcion}"
        </p>
      )}

      {resultado && (
        <p style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: resultado.startsWith('✅') ? '#6aaa8a' : '#aa6a6a',
          opacity: resultado ? 1 : 0,
          transition: 'opacity 0.3s',
        }}>
          {resultado}
        </p>
      )}
    </div>
  );
}
