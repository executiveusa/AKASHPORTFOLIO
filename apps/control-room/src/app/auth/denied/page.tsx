'use client';

import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🔐</div>
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 text-lg">
          This area is restricted to authorized personnel only. If you believe this is a mistake, please contact the administrator.
        </p>
        <div className="pt-6 space-y-3">
          <Link href="/" className="block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition">
            Back to Home
          </Link>
          <a href="/api/auth/signout" className="block text-slate-400 hover:text-slate-300 font-semibold">
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
