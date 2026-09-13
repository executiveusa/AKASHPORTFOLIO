'use client';

/**
 * SphereRing2D — SVG ring of all 10 SYNTHIA™ spheres on an ellipse.
 *
 * No idle animation. Every visual change maps to a prop change.
 * La Vigilante is always slate and still.
 * The speaking sphere glows via an SVG filter; others dim slightly.
 *
 * Props:
 *   speaking       — agentId of the currently speaking sphere, or null
 *   energy         — per-sphere energy [0..1] (controls opacity / size)
 *   coherence      — [0..1] tightens the ellipse inward as the group aligns
 *   size           — SVG canvas width/height in px (default 320)
 *   reducedMotion  — if true, skip glow filter (opacity-only feedback)
 */

import { SPHERE_FREQUENCY_MAP } from '@/shared/sphere-state';
import type { SphereAgentId } from '@/shared/council-events';

// All 10 sphere IDs in registry order (includes la-vigilante)
const SPHERE_IDS = Object.keys(SPHERE_FREQUENCY_MAP) as SphereAgentId[];
const COUNT = SPHERE_IDS.length;

export interface SphereRing2DProps {
  speaking?: SphereAgentId | null;
  energy?: Partial<Record<SphereAgentId, number>>;
  coherence?: number;
  size?: number;
  reducedMotion?: boolean;
}

export function SphereRing2D({
  speaking = null,
  energy = {},
  coherence = 0,
  size = 320,
  reducedMotion = false,
}: SphereRing2DProps) {
  const cx = size / 2;
  const cy = size / 2;

  // Ellipse axes: proportional to canvas, foreshortened for perspective feel
  const baseRx = size * 0.42;
  const baseRy = size * 0.30;

  // Coherence gently tightens the ring (up to 15% inward)
  const coherenceFactor = 1 - Math.max(0, Math.min(1, coherence)) * 0.15;
  const erx = baseRx * coherenceFactor;
  const ery = baseRy * coherenceFactor;

  // Dot base radius
  const baseR = size * 0.052;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Anillo de las diez esferas del consejo SYNTHIA"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <title>Anillo de las diez esferas del consejo SYNTHIA</title>

      {/* Glow filter definitions — only for the speaking sphere */}
      <defs>
        {!reducedMotion && speaking !== null && (
          <filter
            id={`glow-${speaking}`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation={baseR * 0.85} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Ellipse orbit track */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={erx}
        ry={ery}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {/* Spheres */}
      {SPHERE_IDS.map((id, i) => {
        const info = SPHERE_FREQUENCY_MAP[id];
        const isVigilante = id === 'la-vigilante';
        const isSpeaking = speaking === id;
        const en = Math.max(0, Math.min(1, energy[id] ?? 0.7));

        // La Vigilante: slate, smaller, always still
        const color = isVigilante ? '#64748b' : info.baseColor;

        // Size: speaking sphere expands; others reflect energy
        let dotR: number;
        if (isVigilante) {
          dotR = baseR * 0.82;
        } else if (isSpeaking) {
          dotR = baseR * 1.38;
        } else {
          dotR = baseR * (0.82 + en * 0.28);
        }

        // Opacity: speaking = full; vigilante = muted; others by energy
        let opacity: number;
        if (isVigilante) {
          opacity = 0.50;
        } else if (isSpeaking) {
          opacity = 1.0;
        } else if (speaking !== null) {
          // Others dim while someone speaks
          opacity = 0.38 + en * 0.28;
        } else {
          opacity = 0.60 + en * 0.30;
        }

        // Ellipse position — evenly distributed, starting from top (-90°)
        const angleDeg = (i / COUNT) * 360 - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = cx + erx * Math.cos(angleRad);
        const y = cy + ery * Math.sin(angleRad);

        const filterAttr = isSpeaking && !reducedMotion && speaking !== null
          ? `url(#glow-${id})`
          : undefined;

        return (
          <circle
            key={id}
            cx={x}
            cy={y}
            r={dotR}
            fill={color}
            opacity={opacity}
            filter={filterAttr}
          >
            <title>{info.displayName} — {info.role}</title>
          </circle>
        );
      })}
    </svg>
  );
}
