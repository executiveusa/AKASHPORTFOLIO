'use client';

/**
 * SphereField.tsx — Sphere OS™ Cosmic Council canvas
 *
 * Reads live state exclusively from CouncilBus (no own EventSource).
 * La Vigilante (frequency_hz 0) stays still and slate; lights amber
 * only when bus.approvalPending is set.
 * Zero idle motion when field is null — rAF stops; restarts on bus or controls change.
 * Camera micro-shake is post-controls, non-accumulating, amplitude ≤ 0.2px.
 * FALLBACK transcript entries render muted with a "Voz no disponible" badge.
 * Sphere click (Raycaster) + keyboard (sr-only button list) → activeSphere HUD info.
 * Market readout hidden when no market prop is provided.
 * HUD readout: PRESUPUESTO renamed to ENERGÍA/ENERGY (physics scalar, not money).
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
import { ApprovalCard } from '@/components/ApprovalCard';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// Shaders
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
  /** Market readout value. If omitted, the mercado cell is hidden entirely. */
  market?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// HUD — 4-readout strip, IBM Plex Mono 12px uppercase .12em
// ENERGÍA replaces PRESUPUESTO (physics scalar, not money).
// Market cell hidden when market is undefined.
// ---------------------------------------------------------------------------
function CouncilHUD({
  market,
  activeSphere,
}: {
  market?: string;
  activeSphere: SphereAgentId | null;
}) {
  const [lang]          = useCouncilLang();
  const approvalPending = useCouncilBus((s) => s.approvalPending);
  const groupCoherence  = useCouncilBus((s) =>
    Math.round((s.field?.groupCoherence ?? 0) * 100),
  );
  const energyBudget = useCouncilBus((s) =>
    Math.round((s.field?.energyBudget ?? 0) * 100),
  );

  const L = {
    mercado:    lang === 'es' ? 'MERCADO'    : 'MARKET',
    energia:    lang === 'es' ? 'ENERGÍA'    : 'ENERGY',
    coherencia: lang === 'es' ? 'COHERENCIA' : 'COHERENCE',
    pendientes: lang === 'es' ? 'PENDIENTES' : 'PENDING',
  } as const;

  const MONO: CSSProperties = {
    fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
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

  // WCAG AA on #07080c: rgba(255,255,255,0.62) ≥ 4.5:1
  const label: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: 12 };
  const val:   CSSProperties = { color: '#fff' };

  const activeCfg = activeSphere ? SPHERE_FREQUENCY_MAP[activeSphere] : null;

  return (
    <div style={wrap} role="status" aria-label="Council readouts">
      {/* Market cell — hidden when no market prop */}
      {market !== undefined && (
        <div style={cell} data-tour="mercados">
          <span style={label}>{L.mercado}</span>
          <span style={val}>{market}</span>
        </div>
      )}
      <div style={cell}>
        <span style={label}>{L.energia}</span>
        <span style={val}>{energyBudget}%</span>
      </div>
      <div style={cell}>
        <span style={label}>{L.coherencia}</span>
        <span style={val}>{groupCoherence}%</span>
      </div>
      {/* data-tour moves to ApprovalCard when a card is visible */}
      <div
        style={{ ...cell, borderRight: 'none' }}
        {...(!approvalPending ? { 'data-tour': 'aprobaciones' } : {})}
      >
        <span style={label}>{L.pendientes}</span>
        <span style={{ ...val, color: approvalPending ? '#f5b000' : '#fff' }}>
          {approvalPending ? 1 : 0}
        </span>
      </div>
      {/* Active sphere info — shown when a sphere is focused/clicked */}
      {activeCfg && (
        <div
          style={{
            ...cell,
            borderRight: 'none',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            minWidth: 80,
          }}
        >
          <span style={{ ...label, color: activeCfg.baseColor }}>{activeCfg.displayName}</span>
          <span style={{ ...val, fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
            {activeCfg.role ?? ''}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript — last 6 turns, aria-live.
// FALLBACK kind: muted style + "Voz no disponible" badge.
// ---------------------------------------------------------------------------
function CouncilTranscript({ lang }: { lang: string }) {
  const transcript = useCouncilBus((s) => s.transcript);
  const last6 = transcript.slice(-6);
  if (last6.length === 0) return null;

  const voiceUnavailableLabel = lang === 'es' ? 'Voz no disponible' : 'Voice unavailable';

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
        const isFallback = entry.kind === 'FALLBACK';
        const cfg = SPHERE_FREQUENCY_MAP[entry.agentId as keyof typeof SPHERE_FREQUENCY_MAP];
        if (!cfg) return null;
        return (
          <div
            key={idx}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start', opacity: isFallback ? 0.55 : 1 }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isFallback ? 'rgba(255,255,255,0.3)' : cfg.baseColor,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isFallback ? 'rgba(255,255,255,0.4)' : cfg.baseColor,
                }}
              >
                {cfg.displayName}
              </span>
              {isFallback && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.38)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 2,
                    padding: '0 4px',
                  }}
                >
                  {voiceUnavailableLabel}
                </span>
              )}
              {entry.text && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: isFallback ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)',
                    lineHeight: 1.45,
                  }}
                >
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
function ReducedMotionView({
  market,
  className,
  lang,
}: {
  market?: string;
  className: string;
  lang: string;
}) {
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
      <CouncilHUD market={market} activeSphere={null} />
      <SphereRing2D
        speaking={speaking}
        energy={energy}
        coherence={field?.groupCoherence ?? 0}
        size={320}
        reducedMotion
      />
      <CouncilTranscript lang={lang} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SphereField — main WebGL component
// ---------------------------------------------------------------------------
export function SphereField({ meetingId, market, className = '' }: SphereFieldProps) {
  const mountRef       = useRef<HTMLDivElement>(null);
  const uniformsRef    = useRef<SphereUniformSet[]>([]);
  const bloomRef       = useRef<UnrealBloomPass | null>(null);
  const cgMatRef       = useRef<THREE.MeshBasicMaterial | null>(null);
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const vLightRef      = useRef<THREE.PointLight | null>(null);
  const sphereMeshesRef = useRef<THREE.Mesh[]>([]);
  const connectedRef   = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSphere, setActiveSphere]   = useState<SphereAgentId | null>(null);
  const setActiveSphereRef = useRef(setActiveSphere);
  setActiveSphereRef.current = setActiveSphere;

  const [lang] = useCouncilLang();

  // Detect reduced-motion or low memory
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

  // Three.js scene
  useEffect(() => {
    if (reducedMotion) return;
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 800;
    const h = mount.clientHeight || 600;

    const isTouch = navigator.maxTouchPoints > 0;
    const dpr = Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080c);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Base camera position for shake damping (post-controls offset)
    const shakeOffset = { x: 0, y: 0 };

    scene.add(new THREE.AmbientLight(0x10080a, 0.8));
    const point = new THREE.PointLight(0x6060ff, 1.2, 40);
    point.position.set(0, 8, 0);
    scene.add(point);

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

    // Static 400-point star field — no twinkle
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

    // Council ring ground disc
    const cgGeo = new THREE.RingGeometry(4.8, 5.2, 128);
    const cgMat = new THREE.MeshBasicMaterial({
      color: 0xe8e9ee, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
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
    const localMeshes: THREE.Mesh[] = [];

    ALL_SPHERE_IDS.forEach((id, i) => {
      const cfg         = SPHERE_FREQUENCY_MAP[id];
      const isVigilante = cfg.frequency_hz === 0;
      const angle       = (i / N) * Math.PI * 2;
      const x           = Math.cos(angle) * RING_R;
      const z           = Math.sin(angle) * RING_R;

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
      localMeshes.push(mesh);

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

      if (isVigilante) {
        const vLight = new THREE.PointLight(0x334155, 0, 5);
        vLight.position.set(x, 1.5, z);
        scene.add(vLight);
        vLightRef.current = vLight;
      }
    });

    uniformsRef.current    = uniformSets;
    sphereMeshesRef.current = localMeshes;

    // Raycaster for click → activeSphere
    const raycaster = new THREE.Raycaster();
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hits = raycaster.intersectObjects(localMeshes, false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.sphereId as SphereAgentId;
        setActiveSphereRef.current(id);
      } else {
        setActiveSphereRef.current(null);
      }
    };
    mount.addEventListener('click', handleCanvasClick);

    // rAF loop — stops when no field; restarts on bus field change or controls interaction
    let raf: number | null = null;

    const doFrame = () => {
      raf = null;

      const bus         = useCouncilBus.getState();
      const busField    = bus.field;
      const busRms      = bus.rms;
      const busApproval = bus.approvalPending;

      uniformSets.forEach((u, i) => {
        const id          = ALL_SPHERE_IDS[i];
        const cfg         = SPHERE_FREQUENCY_MAP[id];
        const isVigilante = cfg.frequency_hz === 0;

        if (busField) {
          const sphere = busField.spheres.get(id);
          if (sphere) {
            u.uPhase.value  = isVigilante ? 0 : sphere.phase;
            u.uEnergy.value = isVigilante ? 0 : sphere.energy;
            u.uSpeak.value  = (!isVigilante && sphere.speakingNow)
              ? Math.max(0.2, busRms)
              : 0;
          }
        } else {
          u.uPhase.value  = 0;
          u.uEnergy.value = 0;
          u.uSpeak.value  = 0;
        }

        if (isVigilante) {
          u.uEnergy.value = 0;
          (u.uEmissive.value as THREE.Color).set(busApproval ? '#f5b000' : '#64748b');
          if (vLightRef.current) {
            vLightRef.current.color.set(busApproval ? '#f5b000' : '#334155');
            vLightRef.current.intensity = busApproval ? 1.5 : 0;
          }
        }
      });

      if (busField) {
        if (bloomRef.current) {
          const target = 0.6 + busField.groupCoherence * 0.8;
          bloomRef.current.strength += (target - bloomRef.current.strength) * 0.04;
        }
        if (cgMatRef.current) {
          cgMatRef.current.opacity = 0.1 + busField.groupCoherence * 0.35;
        }
      }

      // Camera micro-shake (damped, post-controls, amplitude ≤ 0.2px).
      // Store base position after controls.update() each frame; apply shake as
      // camera.position = base + offset so it never accumulates across frames.
      controls.update();
      const basePosX = camera.position.x;
      const basePosY = camera.position.y;
      if (busField && busField.entropy > 0.15) {
        const amt = Math.min((busField.entropy - 0.15) * 0.4, 0.2);
        shakeOffset.x = (Math.random() - 0.5) * amt * 0.002;
        shakeOffset.y = (Math.random() - 0.5) * amt * 0.001;
      } else {
        // Damp shake back to zero
        shakeOffset.x *= 0.6;
        shakeOffset.y *= 0.6;
      }
      camera.position.x = basePosX + shakeOffset.x;
      camera.position.y = basePosY + shakeOffset.y;

      composer.render();

      // Continue loop only while field is active
      if (busField) {
        raf = requestAnimationFrame(doFrame);
      }
      // else: loop stopped; bus subscription / controls change will restart it
    };

    const startLoop = () => {
      if (raf === null) {
        raf = requestAnimationFrame(doFrame);
      }
    };

    // Restart loop when field appears in bus
    const busUnsub = useCouncilBus.subscribe((s, prev) => {
      if (s.field && !prev.field) startLoop();
    });

    // Restart loop on orbit-controls interaction (so damping keeps rendering)
    controls.addEventListener('change', startLoop);

    // Render at least one frame immediately
    startLoop();

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
      if (raf !== null) cancelAnimationFrame(raf);
      busUnsub();
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('click', handleCanvasClick);
      controls.removeEventListener('change', startLoop);
      controls.dispose();
      renderer.dispose();
      bloomRef.current   = null;
      cameraRef.current  = null;
      vLightRef.current  = null;
      cgMatRef.current   = null;
      sphereMeshesRef.current = [];
      while (mount.firstChild) mount.removeChild(mount.firstChild);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <ReducedMotionView market={market} className={className} lang={lang} />;
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: 500, background: '#07080c' }}
    >
      <CouncilHUD market={market} activeSphere={activeSphere} />
      <ApprovalCard />
      <div ref={mountRef} className="absolute inset-0" style={{ top: 36 }} />
      <CouncilTranscript lang={lang} />

      {/* sr-only keyboard-accessible list of all sphere buttons (accessibility) */}
      <div
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
        aria-label="Sphere agents"
      >
        {ALL_SPHERE_IDS.map((id) => {
          const cfg = SPHERE_FREQUENCY_MAP[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSphere(activeSphere === id ? null : id)}
              aria-pressed={activeSphere === id}
            >
              {cfg.displayName} — {cfg.role ?? ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
