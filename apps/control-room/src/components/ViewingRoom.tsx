"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Agent } from '@/lib/swarm';

interface CouncilMeeting {
  id: string;
  topic: string;
  status: 'pending' | 'live' | 'completed';
  participants: string[];
  decisions: string[];
  createdAt: string;
}

function CouncilPanel() {
  const [meetings, setMeetings] = useState<CouncilMeeting[]>([]);
  const [nextSessions, setNextSessions] = useState<Array<{ label: string; next: string }>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/council?status=live');
      if (res.ok) {
        const data = await res.json();
        setMeetings(Array.isArray(data) ? data : data.meetings ?? []);
      }
    } catch {
      // Silently fail — panel is non-critical
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/council/cron');
      if (res.ok) {
        const data = await res.json();
        setNextSessions(data.schedules ?? []);
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchSchedule();
    intervalRef.current = setInterval(fetchMeetings, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const liveMeeting = meetings.find((m) => m.status === 'live');

  return (
    <div className="w-full mt-2 bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          Sala del Consejo LLM
        </span>
        {liveMeeting && (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EN VIVO
          </span>
        )}
      </div>

      {liveMeeting ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-200 font-medium">{liveMeeting.topic}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {liveMeeting.participants?.map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {p}
              </span>
            ))}
          </div>
          {liveMeeting.decisions?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {liveMeeting.decisions.map((d, i) => (
                <li key={i} className="text-[11px] text-zinc-300">✓ {d}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-500 mb-2">Sin sesión activa. Próximas convocatorias:</p>
          {nextSessions.slice(0, 3).map((s, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">{s.label}</span>
              <span className="text-zinc-600">
                {s.next
                  ? new Date(s.next).toLocaleDateString('es-MX', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ViewingRoomProps {
    agents: Agent[];
}

const AGENT_COLORS: Record<string, string> = {
    'Synthia Prime': '#ff00ff',
    'Agent-Marketing': '#00ffff',
    'Agent-Coder': '#ffff00',
};

export default function ViewingRoom({ agents }: ViewingRoomProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const agentMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x09090b); // Dashboard black
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 15);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Floor Grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x27272a, 0x18181b);
        scene.add(gridHelper);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Sync Agents
    useEffect(() => {
        if (!sceneRef.current) return;

        // Update or Create agent meshes
        agents.forEach((agent, index) => {
            let mesh = agentMeshesRef.current.get(agent.id);

            if (!mesh) {
                const geometry = new THREE.SphereGeometry(0.5, 32, 32);
                const color = AGENT_COLORS[agent.name] || '#71717a';
                const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
                mesh = new THREE.Mesh(geometry, material);

                // Random shell position for demo
                const angle = (index / agents.length) * Math.PI * 2;
                mesh.position.set(Math.cos(angle) * 5, 0.5, Math.sin(angle) * 5);

                sceneRef.current!.add(mesh);
                agentMeshesRef.current.set(agent.id, mesh);
            }

            // Animate status
            if (agent.status === 'working') {
                mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
            } else {
                mesh.scale.setScalar(1);
            }
        });

        // Cleanup stale agents
        agentMeshesRef.current.forEach((mesh, id) => {
            if (!agents.find(a => a.id === id)) {
                sceneRef.current?.remove(mesh);
                agentMeshesRef.current.delete(id);
            }
        });
    }, [agents]);

    return (
        <div className="w-full flex flex-col gap-0">
            <div className="relative w-full h-[400px] bg-zinc-950/50 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="absolute top-4 left-6 z-10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Visualización 3D Enjambre</h3>
                </div>
                <div ref={containerRef} className="w-full h-full" />
            </div>
            <CouncilPanel />
        </div>
    );
}
