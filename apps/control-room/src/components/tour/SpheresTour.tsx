'use client';

/**
 * SpheresTour — three hotspot tour overlays for the /spheres page.
 *
 * Reads ?tour=1 from the URL. Anchors to [data-tour="iniciar-consejo"],
 * [data-tour="aprobaciones"], and [data-tour="mercados"].
 *
 * Mount point: add <SpheresTour /> anywhere inside the /spheres page component
 * (preferably at the root div level). See BUILD-NOTES.md for exact placement.
 *
 * Never shown again after dismissed (parent should remove via state or hide via CSS).
 * Replayable by navigating to /spheres?tour=1 again.
 */

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TourOverlay } from './TourOverlay';
import type { TourStep } from '@/lib/first-run';

const SPHERES_TOUR_STEPS: TourStep[] = [
  {
    id: 'spheres-tour-1',
    anchor: 'iniciar-consejo',
    textEs: 'Desde aquí convocas al consejo cuando necesites una decisión.',
    textEn: 'From here you convene the council when you need a decision.',
  },
  {
    id: 'spheres-tour-2',
    anchor: 'aprobaciones',
    textEs: 'Aquí aparecen las decisiones que esperan tu aprobación.',
    textEn: 'Here are the decisions waiting for your approval.',
  },
  {
    id: 'spheres-tour-3',
    anchor: 'mercados',
    textEs: 'Cuando conectes tus mercados, su estado real aparecerá aquí. Sin datos, no hay número.',
    textEn: 'Once your markets are connected, their real state appears here. No data, no number.',
  },
];

interface SpheresTourProps {
  lang?: 'es' | 'en';
}

export function SpheresTour({ lang = 'es' }: SpheresTourProps) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (searchParams.get('tour') === '1') {
      setStep(1);
    }
  }, [searchParams]);

  if (step <= 0) return null;

  return (
    <TourOverlay
      step={step}
      steps={SPHERES_TOUR_STEPS}
      lang={lang}
      reducedMotion={reducedMotion}
      onNext={() =>
        setStep(s => {
          const next = s + 1;
          return next > SPHERES_TOUR_STEPS.length ? 0 : next;
        })
      }
      onDismiss={() => setStep(0)}
    />
  );
}
