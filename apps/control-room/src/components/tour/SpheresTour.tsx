'use client';

/**
 * SpheresTour — three hotspot tour overlays for the /spheres page.
 *
 * Reads ?tour=1 from the URL. Anchors to [data-tour="iniciar-consejo"],
 * [data-tour="aprobaciones"], and [data-tour="mercados"] (mercados step
 * is skipped if its anchor element is absent from the DOM).
 *
 * Steps advance by progress (not by user clicking "next"):
 *   step 1 → 2: when bus.connection === 'live' (meeting started)
 *   step 2 → 3: when approvalPending or after 8 s
 *   step 3 dismiss: after 8 s or ESC
 *
 * Never shown again after dismissed (parent should remove via state or hide via CSS).
 * Replayable by navigating to /spheres?tour=1 again.
 */

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TourOverlay } from './TourOverlay';
import { useCouncilBus } from '@/lib/council/bus';
import type { TourStep } from '@/lib/first-run';

const ALL_TOUR_STEPS: TourStep[] = [
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

  // Bus selectors for progress-based advancement
  const busConnection   = useCouncilBus((s) => s.connection);
  const busApproval     = useCouncilBus((s) => s.approvalPending);

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

  // Step 1 → 2: when meeting starts (bus.connection === 'live')
  useEffect(() => {
    if (step === 1 && busConnection === 'live') {
      setStep(2);
    }
  }, [step, busConnection]);

  // Step 2 → 3: when approvalPending or after 8 s
  useEffect(() => {
    if (step !== 2) return;
    if (busApproval) {
      setStep(3);
      return;
    }
    const t = setTimeout(() => setStep(3), 8_000);
    return () => clearTimeout(t);
  }, [step, busApproval]);

  // Step 3 → dismiss: after 8 s
  useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => setStep(0), 8_000);
    return () => clearTimeout(t);
  }, [step]);

  if (step <= 0) return null;

  // Filter out mercados step if anchor is absent
  const activeSteps = ALL_TOUR_STEPS.filter(s => {
    if (s.anchor === 'mercados' && typeof document !== 'undefined') {
      return document.querySelector('[data-tour="mercados"]') !== null;
    }
    return true;
  });

  // Remap step to filtered list
  const currentStepIdx = step - 1;
  const filteredStep = currentStepIdx < activeSteps.length ? step : 0;
  if (filteredStep <= 0) return null;

  return (
    <TourOverlay
      step={filteredStep}
      steps={activeSteps}
      lang={lang}
      reducedMotion={reducedMotion}
      onDismiss={() => setStep(0)}
    />
  );
}
