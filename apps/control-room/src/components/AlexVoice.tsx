'use client';

/**
 * AlexVoice.tsx — ALEX™ floating voice button
 * Bead B2: Minimal fixed-position button. Activates VAPI voice call with Alex™.
 * Design: follows cockpit charcoal/gold palette — no glass, no gradients.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { VapiCallStatus, VapiTranscript } from '@/lib/vapi-client';

interface AlexVoiceProps {
  lang?: 'es' | 'en';
}

export function AlexVoice({ lang = 'es' }: AlexVoiceProps) {
  const [status, setStatus] = useState<VapiCallStatus>('idle');
  const [transcript, setTranscript] = useState<VapiTranscript[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const vapiRef = useRef<Awaited<ReturnType<typeof import('@/lib/vapi-client')['createVapiClient']>> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initVapi = useCallback(async () => {
    if (vapiRef.current) return;
    try {
      const { createVapiClient } = await import('@/lib/vapi-client');
      const client = await createVapiClient();
      vapiRef.current = client;

      client.on('call-start', () => setStatus('active'));
      client.on('call-end', () => { setStatus('idle'); });
      client.on('error', () => setStatus('error'));

      // Transcript messages
      client.on('message', (msg: { type: string; role?: string; transcript?: string }) => {
        if (msg.type === 'transcript' && msg.transcript) {
          setTranscript(prev => [
            ...prev,
            { role: (msg.role as 'user' | 'assistant') ?? 'assistant', text: msg.transcript!, timestamp: Date.now() },
          ]);
        }
      });
    } catch (err) {
      console.error('[AlexVoice] init error:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    // Scroll transcript to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const startCall = async () => {
    setStatus('connecting');
    setTranscript([]);
    await initVapi();
    if (!vapiRef.current) { setStatus('error'); return; }
    try {
      const assistantId = process.env.NEXT_PUBLIC_ALEX_ASSISTANT_ID;
      if (assistantId) {
        await vapiRef.current.start(assistantId);
      } else {
        // Inline config fallback — uses public key only
        await vapiRef.current.start({
          name: 'ALEX™',
          firstMessage: lang === 'es'
            ? '¡Hola! Soy ALEX™, tu Chief Advisor. ¿En qué te puedo ayudar hoy?'
            : 'Hi! I\'m ALEX™, your Chief Advisor. How can I help you today?',
          model: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [{
              role: 'system',
              content: 'Eres ALEX™, Chief Advisor de SYNTHIA™. Femenina, CDMX, directa y profesional. Respuestas cortas para voz.',
            }],
          },
          voice: {
            provider: '11labs',
            voiceId: process.env.NEXT_PUBLIC_ALEX_VOICE_ID || 'ErXwobaYiN019PkySvjV',
            model: 'eleven_multilingual_v2',
          },
        } as Parameters<typeof vapiRef.current.start>[0]);
      }
    } catch (err) {
      console.error('[AlexVoice] start error:', err);
      setStatus('error');
    }
  };

  const endCall = async () => {
    setStatus('ending');
    try {
      await vapiRef.current?.stop();
    } catch { /* ignore */ }
    setStatus('idle');
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(m => !m);
  };

  const isActive = status === 'active';
  const isConnecting = status === 'connecting';

  return (
    <>
      {/* Transcript panel */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 320,
            maxHeight: 360,
            background: 'var(--color-charcoal-800, #1a1a24)',
            border: '1px solid var(--color-charcoal-600, #2e2e3e)',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--color-charcoal-600, #2e2e3e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isActive ? '#22c55e' : '#64748b',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gold-400, #d4af37)' }}>
                ALEX™
              </span>
              <span style={{ fontSize: 11, color: '#64748b' }}>Chief Advisor</span>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 16,
                padding: '2px 4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              scrollbarWidth: 'none',
            }}
          >
            {transcript.length === 0 && (
              <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: 'auto' }}>
                {isActive || isConnecting
                  ? (lang === 'es' ? 'Escuchando...' : 'Listening...')
                  : (lang === 'es' ? 'Presiona el micrófono para hablar con ALEX™' : 'Press the mic to talk to ALEX™')}
              </p>
            )}
            {transcript.map((t, i) => (
              <div
                key={i}
                style={{
                  alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: t.role === 'user'
                    ? 'var(--color-charcoal-600, #2e2e3e)'
                    : 'rgba(212,175,55,0.12)',
                  border: t.role === 'assistant' ? '1px solid rgba(212,175,55,0.2)' : 'none',
                }}
              >
                <p style={{ fontSize: 12, color: t.role === 'user' ? '#e2e8f0' : 'var(--color-gold-400, #d4af37)', margin: 0, lineHeight: 1.5 }}>
                  {t.text}
                </p>
              </div>
            ))}
          </div>

          {/* Call controls (when active) */}
          {isActive && (
            <div
              style={{
                padding: '8px 14px',
                borderTop: '1px solid var(--color-charcoal-600, #2e2e3e)',
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={toggleMute}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  background: isMuted ? 'rgba(239,68,68,0.15)' : 'var(--color-charcoal-600, #2e2e3e)',
                  border: '1px solid',
                  borderColor: isMuted ? 'rgba(239,68,68,0.4)' : 'var(--color-charcoal-600, #2e2e3e)',
                  borderRadius: 4,
                  color: isMuted ? '#ef4444' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {isMuted ? (lang === 'es' ? 'Activar mic' : 'Unmute') : (lang === 'es' ? 'Silenciar' : 'Mute')}
              </button>
              <button
                onClick={endCall}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: 4,
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
              >
                {lang === 'es' ? 'Colgar' : 'End call'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating mic button */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {/* ALEX label */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: isActive ? 'var(--color-gold-400, #d4af37)' : '#64748b',
            transition: 'color 200ms',
          }}
        >
          ALEX™
        </span>

        {/* Main button */}
        <button
          onClick={isActive ? () => { setShowPanel(p => !p); } : isConnecting ? undefined : () => { setShowPanel(true); startCall(); }}
          title={lang === 'es' ? 'Hablar con ALEX™' : 'Talk to ALEX™'}
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            border: '1px solid',
            borderColor: isActive
              ? 'rgba(212,175,55,0.5)'
              : status === 'error'
              ? 'rgba(239,68,68,0.5)'
              : 'var(--color-charcoal-600, #2e2e3e)',
            background: isActive
              ? 'rgba(212,175,55,0.12)'
              : 'var(--color-charcoal-800, #1a1a24)',
            cursor: isConnecting ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 200ms, background 200ms',
            boxShadow: isActive ? '0 0 0 3px rgba(212,175,55,0.15)' : '0 2px 8px rgba(0,0,0,0.25)',
          }}
          disabled={isConnecting}
          aria-label={lang === 'es' ? 'Hablar con ALEX™' : 'Talk to ALEX™'}
        >
          {isConnecting ? (
            <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #64748b', borderTopColor: 'var(--color-gold-400, #d4af37)', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          ) : isActive ? (
            <MicActiveIcon />
          ) : (
            <MicIdleIcon />
          )}
        </button>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}

function MicIdleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicActiveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="rgba(212,175,55,0.15)" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
