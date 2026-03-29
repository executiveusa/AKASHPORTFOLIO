'use client';

import React, { Suspense } from 'react';
import PauliClipScene from '@/components/PauliClipScene';

function PauliClipLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-100">PAULI-CLIP™</h1>
        <p className="text-sm text-zinc-500">Initializing 3D ceremony chamber...</p>
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

export default function PauliClipPage() {
  return (
    <Suspense fallback={<PauliClipLoading />}>
      <PauliClipScene autoStart={true} durationMs={300000} />
    </Suspense>
  );
}
