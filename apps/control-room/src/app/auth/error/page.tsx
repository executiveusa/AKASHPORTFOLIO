'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Callback: 'Invalid callback. Please try signing in again.',
    OAuthSignin: 'Google sign-in failed. Please try again.',
    OAuthCallback: 'OAuth callback error. Please try again.',
    EmailSignInError: 'Could not sign you in. Please try again.',
    Default: 'An authentication error occurred. Please try again.',
  };

  const message = errorMessages[error as string] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
        <p className="text-slate-400 text-lg">{message}</p>
        <div className="pt-6 space-y-3">
          <Link href="/auth/signin" className="block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition">
            Try Again
          </Link>
          <Link href="/" className="block text-slate-400 hover:text-slate-300 font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"><div className="text-slate-400">Loading...</div></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
