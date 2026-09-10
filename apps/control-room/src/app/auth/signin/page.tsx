'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('passcode', {
        passcode: inputRef.current?.value ?? '',
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setError('Código incorrecto. Intenta de nuevo.');
      } else if (result?.ok) {
        router.replace(callbackUrl);
      }
    } catch {
      setError('Algo salió mal. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, #0d0c14 0%, #07080c 70%)',
      padding: 24,
      fontFamily: 'var(--font-plex-sans, "IBM Plex Sans", system-ui, sans-serif)',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, #4c3f7a 0%, #1c1a2e 60%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 32px 6px rgba(120,90,200,0.12)',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1,
      }}>S</div>

      <h1 style={{ fontSize: 20, fontWeight: 500, color: '#e8e9ee', marginBottom: 8, textAlign: 'center' }}>
        Hola, Ivette.
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(232,233,238,0.4)', marginBottom: 32, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
        Introduce tu código de acceso para continuar.
      </p>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
          maxWidth: 280, width: '100%', fontSize: 12, color: '#fca5a5', textAlign: 'center',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <input
          ref={inputRef}
          type="password"
          placeholder="Código de acceso"
          autoComplete="current-password"
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10, padding: '12px 14px', fontSize: 14,
            color: '#e8e9ee', outline: 'none', width: '100%',
            boxSizing: 'border-box', letterSpacing: '0.08em',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 0',
            background: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(100,80,180,0.30)',
            color: isLoading ? 'rgba(255,255,255,0.3)' : '#e8e9ee',
            borderRadius: 10, border: '1px solid rgba(100,80,180,0.35)',
            fontSize: 14, fontWeight: 500, cursor: isLoading ? 'default' : 'pointer',
          }}
        >
          {isLoading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.12)', textAlign: 'center' }}>
        SYNTHIA · Kupuri Media
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07080c' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Cargando…</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
