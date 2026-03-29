'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PauliClipOrchestrator, type CouncilMember, type CeremonyState, type AudioVisualConfig } from '@/lib/pauli-clip-orchestrator';
import PauliClipControls from './PauliClipControls';

interface PauliClipSceneProps {
  councilMembers?: CouncilMember[];
  autoStart?: boolean;
  durationMs?: number;
}

export default function PauliClipScene({
  councilMembers,
  autoStart = true,
  durationMs = 300000
}: PauliClipSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const orchestratorRef = useRef<PauliClipOrchestrator | null>(null);
  const [ceremonyState, setCeremonyState] = useState<CeremonyState | null>(null);
  const stateUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Default council members if not provided
  const defaultMembers: CouncilMember[] = councilMembers || [
    {
      id: 'synthia-prime',
      name: 'Synthia Prime',
      role: 'synthia',
      sphereColor: '#c8a04a',
      position: [3, 5, 3],
      active: true,
    },
    {
      id: 'darya-design',
      name: 'Darya Design',
      role: 'darya',
      sphereColor: '#8a4a7a',
      position: [-3, 5, 3],
      active: true,
    },
    {
      id: 'research-esfera',
      name: 'Research Esfera',
      role: 'research',
      sphereColor: '#4a6a8a',
      position: [-3, 5, -3],
      active: true,
    },
    {
      id: 'deploy-esfera',
      name: 'Deploy Esfera',
      role: 'deploy',
      sphereColor: '#4a8a5a',
      position: [3, 5, -3],
      active: true,
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.Fog(0x09090b, 100, 1000);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 8, 12);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.enableZoom = true;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Ground plane with reflection
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ambient environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Initialize PAULI-CLIP orchestrator
    const orchestrator = new PauliClipOrchestrator(scene);
    orchestratorRef.current = orchestrator;

    // Start ceremony if requested
    if (autoStart) {
      orchestrator.initializeCeremony(defaultMembers, durationMs);
    }

    // Update ceremony state UI every 500ms
    stateUpdateRef.current = setInterval(() => {
      if (orchestratorRef.current) {
        setCeremonyState(orchestratorRef.current.getState());
      }
    }, 500);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (stateUpdateRef.current) clearInterval(stateUpdateRef.current);
      if (orchestratorRef.current) orchestratorRef.current.dispose();
      renderer.dispose();
      controls.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [defaultMembers, autoStart, durationMs]);

  const handleConfigChange = (config: Partial<AudioVisualConfig>) => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setAVConfig(config);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-zinc-950">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Header */}
      <div className="absolute top-6 left-6 font-mono text-sm">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">PAULI-CLIP™</h1>
        <p className="text-xs text-zinc-500">El Panorama™ 3D Council Ceremony Viewer</p>
      </div>

      {/* Controls */}
      {ceremonyState && (
        <PauliClipControls
          onConfigChange={handleConfigChange}
          currentPhase={ceremonyState.phase}
          decisionsCount={ceremonyState.decisions.length}
        />
      )}

      {/* Phase Indicator (Center Top) */}
      {ceremonyState && (
        <div className="absolute top-6 right-6 bg-zinc-950/70 border border-zinc-800 rounded px-4 py-2 font-mono text-xs">
          <div className="text-zinc-500 uppercase">Ceremony Status</div>
          <div className="text-zinc-100 font-bold capitalize mt-1">
            {ceremonyState.phase === 'dismissed' ? 'Concluida ✓' : ceremonyState.phase}
          </div>
          <div className="text-zinc-600 text-[10px] mt-1">
            Particle Intensity: {(ceremonyState.particleIntensity * 100).toFixed(0)}%
          </div>
        </div>
      )}

      {/* Instructions (Bottom Right) */}
      <div className="absolute bottom-6 right-6 bg-zinc-950/70 border border-zinc-800 rounded px-3 py-2 font-mono text-[10px] max-w-xs">
        <div className="text-zinc-500 uppercase mb-1">Controles</div>
        <ul className="text-zinc-400 space-y-0.5">
          <li>🖱 Arrastrar para rotar vista</li>
          <li>🔍 Scroll para zoom</li>
          <li>⚙ Ver panel de controles abajo</li>
        </ul>
      </div>

      {/* Decisions Log (Bottom Left) */}
      {ceremonyState && ceremonyState.decisions.length > 0 && (
        <div className="absolute bottom-6 left-6 bg-zinc-950/70 border border-zinc-800 rounded px-3 py-2 font-mono text-[9px] max-w-xs max-h-32 overflow-y-auto">
          <div className="text-zinc-500 uppercase mb-2">Decisiones Registradas</div>
          <ul className="text-zinc-400 space-y-1">
            {ceremonyState.decisions.slice(-5).map((d, i) => (
              <li key={i} className="text-zinc-500">✓ {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
