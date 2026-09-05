/**
 * first-run.ts — Cookie + localStorage gate for the bienvenida first-run journey.
 *
 * Cookie: synthia_seen=1  (1-year, SameSite=Lax, Secure on https)
 * localStorage: synthia_seen=1  (instant client-side read)
 */

const COOKIE_NAME = 'synthia_seen';
const LS_KEY = 'synthia_seen';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Returns true if the user has already completed the first-run journey. */
export function hasSeenFirstRun(): boolean {
  if (typeof window === 'undefined') return false;
  // Fast path: localStorage
  try {
    if (localStorage.getItem(LS_KEY) === '1') return true;
  } catch {
    /* storage blocked */
  }
  // Cookie path
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_NAME}=1`));
}

/** Marks the first-run journey as complete in both localStorage and a 1-year cookie. */
export function markFirstRunSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, '1');
  } catch {
    /* storage blocked */
  }
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${COOKIE_NAME}=1; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

/** A single step of the inline tour overlay. */
export interface TourStep {
  /** Unique identifier for this step. */
  id: string;
  /** Value of the data-tour attribute on the target element in the DOM. */
  anchor: string;
  textEs: string;
  textEn: string;
}

/**
 * The three in-journey tour steps.
 * Step 1 → anchored to the sphere ring (bienvenida page).
 * Step 2 → anchored to the council memo (bienvenida page).
 * Step 3 → anchored to the "Iniciar consejo" button (/spheres page, via SpheresTour).
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'tour-bienvenida-1',
    anchor: 'ring',
    textEs: 'Cada esfera es una agente del consejo. CAZADORA busca clientes para tu negocio.',
    textEn: 'Each sphere is a council agent. CAZADORA finds clients for your business.',
  },
  {
    id: 'tour-bienvenida-2',
    anchor: 'memo',
    textEs: 'Esto es el memo del consejo. Lo que requiera tu aprobación aparecerá junto a LA VIGILANTE.',
    textEn: 'This is the council memo. Anything needing approval will appear next to LA VIGILANTE.',
  },
  {
    id: 'tour-spheres-1',
    anchor: 'iniciar-consejo',
    textEs: 'Desde aquí convocas al consejo cuando necesites una decisión.',
    textEn: 'From here you convene the council when you need a decision.',
  },
];
