'use client';

/**
 * SphereField.tsx — Sphere OS™ Cosmic Council canvas
 *
 * Reads live state exclusively from CouncilBus (no own EventSource).
 * Bug W1 fixed: event matching now lives in bus.ts only.
 * La Vigilante (frequency_hz 0) stays still and slate; lights amber
 * only when bus.approvalPending is set.
 * Zero idle motion when field is null.
 * Reduced-motion / deviceMemory < 4 → SphereRing2D fallback.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SPHERE_FREQUENCY_MAP, ALL_SPHERE_IDS } from '@/shared/sphere-state';
import { useCouncilBus } from '@/lib/council/bus';
import { useCouncilLang } from '@/lib/council/selectors';
import { SphereRing2D } from '@/components/SphereRing2D';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Shaders — uPhase drives displacement so entrainment is visible
// uEnergy maps emissive 0.4→1.6 per design table
// uSpeak drives equatorial pulse (mouth-like band from RMS)
// ---------------------------------------------------------------------------
const VERTEX_SHADER = `
  uniform float uPhase;
  uniform float uEnergy;
  uniform float uSpeak;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec3 pos = position;
    float amp = 0.04 + uEnergy * 0.03;
    float d = sin(pos.x * 8.0 + uPhase * 6.28318) *
              cos(pos.y * 8.0 + uPhase * 4.0) * amp;
    float equator = exp(-pos.y * pos.y * 8.0) * uSpeak;
    pos += normal * (d + equator * 0.06);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mv.xyz);
    vNormal  = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3  uBase;
  uniform vec3  uEmissive;
  uniform float uEnergy;
  uniform float uSpeak;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    float fr    = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.8);
    float emInt = 0.4 + uEnergy * 1.2;
    vec3 core   = uEmissive * emInt;
    vec3 col    = mix(core, uBase, 0.55) + uBase * fr * 1.4;
    col        += uEmissive * uSpeak * 0.5;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SphereUniformSet {
  uPhase:    THREE.IUniform<number>;
  uEnergy:   THREE.IUniform<number>;
  uSpeak:    THREE.IUniform<number>;
  uBase:     THREE.IUniform<THREE.Color>;
  uEmissive: THREE.IUniform<THREE.Color>;
}

export interface SphereFieldProps {
  meetingId?: string;
  market?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// HUD — 4-readout strip, IBM Plex Mono 12px uppercase .12em
// ---------------------------------------------------------------------------
function CouncilHUD({ market }: { market: string }) {
  const [lang]         = useCouncilLang();
  const approvalPending = useCouncilBus((s) => s.approvalPending);
  const groupCoherence  = useCouncilBus((s) =>
    Math.round((s.field?.groupCoherence ?? 0) * 100),
  );
  const energyBudget = useCouncilBus((s) =>
    Math.round((s.field?.energyBudget ?? 0) * 100),
  );

  const L = {
    mercado:     lang === 'es' ? 'MERCADO'     : 'MARKET',
    presupuesto: lang === 'es' ? 'PRESUPUESTO' : 'BUDGET',
    coherencia:  lang === 'es' ? 'COHERENCIA'  : 'COHERENCE',
    pendientes:  lang === 'es' ? 'PENDIENTES'  : 'PENDING',
  } as const;

  const MONO: CSSProperties = {
    fontFamily: '"IBM Plex Mono", "Courier New", monospace',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };

  const wrap: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    background: 'rgba(7,8,12,0.88)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    zIndex: 10,
    ...MONO,
  };

  const cell: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 12px',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    minWidth: 0,
    flex: 1,
  };

  const label: CSSProperties = { color: 'rgba(255,255,255,0.35)', fontSize: 9 };
  const val:   CSSProperties = { color: '#fff' };

  return (
    <div style={wrap} role="status" aria-label="Council readouts">
      <div style={cell} data-tour="mercados">
        <span style={label}>{L.mercado}</span>
        <span style={val}>{market}</span>
      </div>
      <div style={cell}>
        <span style={label}>{L.presupuesto}</span>
        <span style={val}>{energyBudget}%</span>
      </div>
      <div style={cell}>
        <span style={label}>{L.coherencia}</span>
        <span style={val}>{groupCoherence}%</span>
      </div>
      <div style={{ ...cell, borderRight: 'none' }} data-tour="aprobaciones">
        <span style={label}>{L.pendientes}</span>
        <span style={{ ...val, color: approvalPending ? '#f5b000' : '#fff' }}>
          {approvalPending ? 1 : 0}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript — last 6 turns, aria-live region
// ---------------------------------------------------------------------------
function CouncilTranscript() {
  const transcript = useCouncilBus((s) => s.transcript);
  const last6 = transcript.slice(-6);
  if (last6.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Council transcript"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: 160,
        overflowY: 'auto',
        background: 'rgba(7,8,12,0.88)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '8px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 10,
      }}
    >
      {last6.map((entry, idx) => {
        const cfg = SPHERE_FREQUENCY_MAP[entry.agentId as keyof typeof SPHERE_FREQUENCY_MAP];
        if (!cfg) return null;
        return (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: cfg.baseColor,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: cfg.baseColor,
                }}
              >
                {cfg.displayName}
              </span>
              {entry.text && (
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
                  {entry.text}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2D reduced-motion fallback
// ---------------------------------------------------------------------------
function ReducedMotionView({ market, className }: { market: string; className: string }) {
  const field    = useCouncilBus((s) => s.field);
  const speaking = useCouncilBus((s) => s.speaking);

  const energy: Partial<Record<SphereAgentId, number>> = {};
  if (field) {
    for (const [id, sphere] of field.spheres) {
      energy[id] = sphere.energy;
    }
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center gap-4 ${className}`}
      style={{ background: '#07080c', minHeight: 500 }}
    >
      <CouncilHUD market={market} />
      <SphereRing2D
        speaking={speaking}
        energy={energy}
        coherence={field?.groupCoherence ?? 0}
        size={320}
        reducedMotion
      />
      <CouncilTranscript />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SphereField — main WebGL component
// ---------------------------------------------------------------------------
export function SphereField({ meetingId, market = 'MX', className = '' }: SphereFieldProps) {
  const mountRef     = useRef<HTMLDivElement>(null);
  const uniformsRef  = useRef<SphereUniformSet[]>([]);
  const bloomRef     = useRef<UnrealBloomPass | null>(null);
  const cgMatRef     = useRef<THREE.MeshBasicMaterial | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const vLightRef    = useRef<THREE.PointLight | null>(null);
  const connectedRef = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect reduced-motion or low memory before creating WebGL context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq  = window.matchMedia('(prefers-reduced-motion: reduce)');
    type NavExt = Navigator & { deviceMemory?: number };
    const dm  = (navigator as NavExt).deviceMemory;
    if (mq.matches || (dm !== undefined && dm < 4)) {
      setReducedMotion(true);
      return;
    }
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setReducedMotion(true); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Connect / disconnect bus when meetingId changes
  useEffect(() => {
    if (!meetingId) return;
    useCouncilBus.getState().connect(meetingId);
    connectedRef.current = true;
    return () => {
      if (connectedRef.current) {
        useCouncilBus.getState().disconnect();
        connectedRef.current = false;
      }
    };
  }, [meetingId]);

  // Three.js scene — only created when not reduced-motion
  useEffect(() => {
    if (reducedMotion) return;
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 800;
    const h = mount.clientHeight || 600;

    // DPR capped at 1.5 on touch devices
    const isTouch = navigator.maxTouchPoints > 0;
    const dpr = Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Observatory night sky — no gradients, no light pollution
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080c);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0x10080a, 0.8));
    const point = new THREE.PointLight(0x6060ff, 1.2, 40);
    point.position.set(0, 8, 0);
    scene.add(point);

    // Bloom — strength driven by groupCoherence in rAF
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.4, 0.78);
    composer.addPass(bloom);
    bloomRef.current = bloom;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.target.set(0, 0, 0);
    controls.update();

    // Static 400-point star field — no twinkle (sky only moves because bodies move)
    const STAR_COUNT = 400;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 16 + Math.random() * 10;
      starPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      starPos[i * 3 + 2] = r * Math.cos(ph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 }),
    ));

    // Council ring ground disc — opacity driven by coherence in rAF
    const cgGeo = new THREE.RingGeometry(4.8, 5.2, 128);
    const cgMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
    });
    cgMatRef.current = cgMat;
    const cgRing = new THREE.Mesh(cgGeo, cgMat);
    cgRing.rotation.x = -Math.PI / 2;
    cgRing.position.y = 0.01;
    scene.add(cgRing);

    // 9 sphere avatars on ring
    const N = ALL_SPHERE_IDS.length;
    const RING_R = 5.0;
    const uniformSets: SphereUniformSet[] = [];

    ALL_SPHERE_IDS.forEach((id, i) => {
      const cfg       = SPHERE_FREQUENCY_MAP[id];
      const isVigilante = cfg.frequency_hz === 0;
      const angle     = (i / N) * Math.PI * 2;
      const x         = Math.cos(angle) * RING_R;
      const z         = Math.sin(angle) * RING_R;

      // La Vigilante is slate; sphere colors are the only saturation
      const base = new THREE.Color(isVigilante ? '#334155' : cfg.baseColor);
      const emis = new THREE.Color(isVigilante ? '#64748b' : cfg.emissiveColor);

      const uniforms: SphereUniformSet = {
        uPhase:    { value: 0 },
        uEnergy:   { value: 0 },
        uSpeak:    { value: 0 },
        uBase:     { value: base },
        uEmissive: { value: emis },
      };
      uniformSets.push(uniforms);

      const mat = new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: uniforms as unknown as { [key: string]: THREE.IUniform },
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 48), mat);
      mesh.position.set(x, 0.5, z);
      mesh.userData.sphereId = id;
      scene.add(mesh);

      // Underlight disc
      const discMat = new THREE.MeshBasicMaterial({
        color: isVigilante ? 0x334155 : cfg.baseColor,
        transparent: true,
        opacity: 0.2,
      });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(x, 0.02, z);
      scene.add(disc);

      // La Vigilante amber point light (off by default, enabled on approvalPending)
      if (isVigilante) {
        const vLight = new THREE.PointLight(0x334155, 0, 5);
        vLight.position.set(x, 1.5, z);
        scene.add(vLight);
        vLightRef.current = vLight;
      }
    });

    uniformsRef.current = uniformSets;

    // rAF loop — reads bus state, maps to uniforms; no sin() breathing
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      const bus      = useCouncilBus.getState();
      const busField = bus.field;
      const busRms   = bus.rms;
      const busApproval = bus.approvalPending;

      uniformSets.forEach((u, i) => {
        const id          = ALL_SPHERE_IDS[i];
        const cfg         = SPHERE_FREQUENCY_MAP[id];
        const isVigilante = cfg.frequency_hz === 0;

        if (busField) {
          const sphere = busField.spheres.get(id);
          if (sphere) {
            // energy → emissive 0.4→1.6; phase → displacement entrainment
            u.uPhase.value  = isVigilante ? 0 : sphere.phase;
            u.uEnergy.value = isVigilante ? 0 : sphere.energy;
            // speakingNow + RMS → equatorial pulse
            u.uSpeak.value  = (!isVigilante && sphere.speakingNow)
              ? Math.max(0.2, busRms)
              : 0;
          }
        } else {
          // No meeting — freeze, no idle motion
          u.uPhase.value  = 0;
          u.uEnergy.value = 0;
          u.uSpeak.value  = 0;
        }

        // La Vigilante: always still; amber only on approvalPending
        if (isVigilante) {
          u.uEnergy.value = 0;
          (u.uEmissive.value as THREE.Color).set(busApproval ? '#f5b000' : '#64748b');
          if (vLightRef.current) {
            vLightRef.current.color.set(busApproval ? '#f5b000' : '#334155');
            vLightRef.current.intensity = busApproval ? 1.5 : 0;
          }
        }
      });

      // groupCoherence → bloom strength 0.6→1.4 + ring opacity
      if (busField) {
        if (bloomRef.current) {
          const target = 0.6 + busField.groupCoherence * 0.8;
          bloomRef.current.strength += (target - bloomRef.current.strength) * 0.04;
        }
        if (cgMatRef.current) {
          cgMatRef.current.opacity = 0.1 + busField.groupCoherence * 0.35;
        }
        // entropy → camera micro-shake ≤ 0.2 px
        if (busField.entropy > 0.15 && cameraRef.current) {
          const shakeAmt = (busField.entropy - 0.15) * 0.4;
          cameraRef.current.position.x += (Math.random() - 0.5) * shakeAmt * 0.002;
          cameraRef.current.position.y += (Math.random() - 0.5) * shakeAmt * 0.001;
        }
      }

      controls.update();
      composer.render();
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      bloomRef.current  = null;
      cameraRef.current = null;
      vLightRef.current = null;
      cgMatRef.current  = null;
      while (mount.firstChild) mount.removeChild(mount.firstChild);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <ReducedMotionView market={market} className={className} />;
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: 500, background: '#07080c' }}
    >
      <CouncilHUD market={market} />
      <div ref={mountRef} className="absolute inset-0" />
      <CouncilTranscript />
    </div>
  );
}
