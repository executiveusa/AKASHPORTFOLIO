'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('google', { callbackUrl, redirect: false });
      if (result?.error) {
        setError('Esta es la cuenta personal de Ivette. Solo ella puede entrar.');
      } else if (result?.ok) {
        router.push(callbackUrl);
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
      background: 'radial-gradient(ellipse at 50% 20%, #1a0f2e 0%, #0d0d0d 60%)',
      padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Glow orb */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #8b5cf6 0%, #5b21b6 50%, transparent 70%)',
        boxShadow: '0 0 80px 20px rgba(139, 92, 246, 0.3)',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-2px',
      }}>
        C
      </div>

      {/* Greeting */}
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' }}>
        Hola, Ivette.
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 40, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Soy Cynthia. Tu mundo está aquí — listo cuando tú lo estés. Entra con tu cuenta de Google para continuar.
      </p>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          maxWidth: 320,
          width: '100%',
          fontSize: 13,
          color: '#fca5a5',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Sign in button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 28px',
          background: isLoading ? 'rgba(255,255,255,0.1)' : '#fff',
          color: '#1a1a1a',
          borderRadius: 12,
          border: 'none',
          fontSize: 15,
          fontWeight: 600,
          cursor: isLoading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          minWidth: 240,
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <>
            <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #333', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Entrando...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar con Google
          </>
        )}
      </button>

      <p style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        Solo Ivette puede acceder a Cynthia.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Cargando...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
