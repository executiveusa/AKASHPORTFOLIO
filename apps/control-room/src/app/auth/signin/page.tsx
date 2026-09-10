'use client';

/**
 * Sign-in page — AUTH BYPASS ACTIVE FOR TESTING.
 * Auto-redirects to / immediately. No credentials needed.
 * Restore: reinstate passcode form when NextAuth is working.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07080c',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Entrando…</div>
    </div>
  );
}
