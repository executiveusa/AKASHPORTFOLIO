'use client';

/**
 * SphereField.tsx — Sphere OS™ Cosmic Council canvas
 * Full-screen Three.js field with 9 branded spheres.
 * Connects to /api/council/orchestrator SSE for live pulse rings.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SPHERE_FREQUENCY_MAP, ALL_SPHERE_IDS } from '@/shared/sphere-state';

// ---------------------------------------------------------------------------
// Sphere shader (Fresnel + displacement)
// ---------------------------------------------------------------------------
const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uFrequency;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec3 pos = position;
    float d = sin(pos.x * 8.0 + uTime * uFrequency * 6.28) *
              cos(pos.y * 8.0 + uTime * uFrequency * 4.0) * 0.05;
    pos += normal * d;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mv.xyz);
    vNormal  = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3  uBase;
  uniform vec3  uEmissive;
  uniform float uTime;
  uniform float uEnergy;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    float fr   = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.8);
    vec3 core  = uEmissive * (0.5 + 0.5 * sin(uTime * 3.0));
    vec3 col   = mix(core, uBase, 0.55) + uBase * fr * 1.4;
    col *= 0.6 + uEnergy * 0.4;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SphereUniformSet = {
  uTime: THREE.IUniform;
  uFrequency: THREE.IUniform;
  uBase: THREE.IUniform;
  uEmissive: THREE.IUniform;
  uEnergy: THREE.IUniform;
};

interface SphereFieldProps {
  meetingId?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SphereField({ meetingId, className = '' }: SphereFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<SphereUniformSet[]>([]);
  const pulseRingsRef = useRef<Array<{ mesh: THREE.Mesh; born: number; scene: THREE.Scene }>>([]);
  const [activeSphere, setActiveSphere] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // ---- Three.js scene setup ------------------------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene + camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030010);
    scene.fog = new THREE.FogExp2(0x030010, 0.008);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0x1a0a30, 0.8));
    const point = new THREE.PointLight(0x6060ff, 1.5, 40);
    point.position.set(0, 8, 0);
    scene.add(point);

    // Composer + bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 1.1, 0.4, 0.78);
    composer.addPass(bloom);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.target.set(0, 0, 0);
    controls.update();

    // Boundary sphere (inside-out)
    const boundGeo = new THREE.SphereGeometry(30, 64, 64);
    const boundMat = new THREE.MeshBasicMaterial({ color: 0x050025, side: THREE.BackSide });
    scene.add(new THREE.Mesh(boundGeo, boundMat));

    // Nebula particles
    const nbCount = 4000;
    const nbPos = new Float32Array(nbCount * 3);
    const nbCol = new Float32Array(nbCount * 3);
    const palette = ALL_SPHERE_IDS.map((id) => {
      const c = new THREE.Color();
      c.set(SPHERE_FREQUENCY_MAP[id].baseColor);
      return c;
    });
    for (let i = 0; i < nbCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 10 + Math.random() * 18;
      nbPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      nbPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      nbPos[i * 3 + 2] = r * Math.cos(ph);
      const col = palette[i % palette.length];
      nbCol[i * 3]     = col.r;
      nbCol[i * 3 + 1] = col.g;
      nbCol[i * 3 + 2] = col.b;
    }
    const nbGeo = new THREE.BufferGeometry();
    nbGeo.setAttribute('position', new THREE.BufferAttribute(nbPos, 3));
    nbGeo.setAttribute('color', new THREE.BufferAttribute(nbCol, 3));
    const particles = new THREE.Points(nbGeo, new THREE.PointsMaterial({
      size: 0.12, vertexColors: true, transparent: true, opacity: 0.6,
    }));
    scene.add(particles);

    // Council ring ground disc
    const cgGeo = new THREE.RingGeometry(4.8, 5.2, 128);
    const cgMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const cgRing = new THREE.Mesh(cgGeo, cgMat);
    cgRing.rotation.x = -Math.PI / 2;
    cgRing.position.y = 0.01;
    scene.add(cgRing);

    // Build 9 sphere avatars
    const N = ALL_SPHERE_IDS.length;
    const RING_R = 5.0;
    const uniformSets: SphereUniformSet[] = [];

    ALL_SPHERE_IDS.forEach((id, i) => {
      const cfg = SPHERE_FREQUENCY_MAP[id];
      const angle = (i / N) * Math.PI * 2;
      const x = Math.cos(angle) * RING_R;
      const z = Math.sin(angle) * RING_R;

      const base = new THREE.Color(); base.set(cfg.baseColor);
      const emis = new THREE.Color(); emis.set(cfg.emissiveColor);

      const uniforms: SphereUniformSet = {
        uTime:      { value: 0 },
        uFrequency: { value: cfg.frequency_hz },
        uBase:      { value: base },
        uEmissive:  { value: emis },
        uEnergy:    { value: 0.7 },
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

      // Small disc underlight
      const discMat = new THREE.MeshBasicMaterial({ color: cfg.baseColor, transparent: true, opacity: 0.25 });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(x, 0.02, z);
      scene.add(disc);
    });

    uniformsRef.current = uniformSets;

    // Raycasting for click-to-select
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (ev: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x =  ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((ev.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, false);
      const hit = hits.find((h) => h.object.userData.sphereId);
      if (hit) setActiveSphere(hit.object.userData.sphereId as string);
    };
    mount.addEventListener('click', onClick);

    // Animation loop
    let t = 0;
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;

      uniformSets.forEach((u, i) => {
        u.uTime.value = t;
        // Gentle energy oscillation per sphere
        u.uEnergy.value = 0.65 + Math.sin(t * 0.8 + i * 0.7) * 0.15;
      });

      // Council ring slow pulse
      cgMat.opacity = 0.2 + Math.sin(t * 1.2) * 0.12;

      // Expand + fade pulse rings
      const now = Date.now();
      pulseRingsRef.current = pulseRingsRef.current.filter((p) => {
        const age = (now - p.born) / 1200;
        if (age >= 1) {
          p.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          return false;
        }
        p.mesh.scale.setScalar(1 + age * 4);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - age) * 0.7;
        return true;
      });

      particles.rotation.y += 0.0002;
      controls.update();
      composer.render();
    };
    animate();

    // Resize
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
      mount.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      while (mount.firstChild) mount.removeChild(mount.firstChild);
    };
  }, []);

  // ---- SSE live council events -------------------------------------------
  useEffect(() => {
    if (!meetingId) return;
    const es = new EventSource(`/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`);
    setIsLive(true);

    es.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as { kind?: string; agentId?: string };
        const idx = ALL_SPHERE_IDS.indexOf(event.agentId as typeof ALL_SPHERE_IDS[number]);
        if (idx < 0) return;
        const u = uniformsRef.current[idx];
        if (!u) return;

        if (event.kind === 'sphere.signal') {
          u.uEnergy.value = 1.0;
          setActiveSphere(event.agentId ?? null);
        }
        if (event.kind === 'meeting.focus') {
          // ALIGN — lerp all sphere colors toward focal sphere
          const focalBase = u.uBase.value as THREE.Color;
          uniformsRef.current.forEach((other, i) => {
            if (i !== idx) {
              (other.uBase.value as THREE.Color).lerp(focalBase, 0.12);
            }
          });
        }
      } catch { /* ignore */ }
    };

    es.onerror = () => { setIsLive(false); es.close(); };
    return () => es.close();
  }, [meetingId]);

  // ---- Render ------------------------------------------------------------
  const activeConfig = activeSphere ? SPHERE_FREQUENCY_MAP[activeSphere as keyof typeof SPHERE_FREQUENCY_MAP] : null;

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '500px' }}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Live badge */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
        isLive
          ? 'bg-violet-500/20 text-violet-300 border-violet-500'
          : 'bg-zinc-800/70 text-zinc-400 border-zinc-700'
      }`}>
        {isLive ? '● EN VIVO' : '○ DEMO'}
      </div>

      {/* Active sphere tooltip */}
      {activeConfig && (
        <div
          className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 max-w-xs"
          style={{ borderColor: activeConfig.baseColor + '55' }}
        >
          <p className="text-[9px] uppercase tracking-widest text-zinc-400">{activeConfig.locale}</p>
          <p className="text-sm font-bold" style={{ color: activeConfig.baseColor }}>
            {activeConfig.displayName}
          </p>
          <p className="text-[11px] text-zinc-300 mt-0.5">{activeConfig.role}</p>
        </div>
      )}

      {/* Sphere legend */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {ALL_SPHERE_IDS.map((id) => {
          const cfg = SPHERE_FREQUENCY_MAP[id];
          return (
            <button
              key={id}
              onClick={() => setActiveSphere(id)}
              className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.baseColor }}
              />
              {cfg.displayName}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 text-[8px] uppercase tracking-widest text-zinc-600">
        Drag to orbit · Scroll to zoom · Click sphere to inspect
      </div>
    </div>
  );
}
