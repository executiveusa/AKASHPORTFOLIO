'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface TheaterProps {
  meetingId?: string;
  bilingual?: boolean;
}

export function Theater3D({ meetingId, bilingual = true }: TheaterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [councilState, setCouncilState] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1208); // charcoal-900

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 10, 7);
    light.castShadow = true;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Create placeholder avatars (spheres) for 5 council members
    const avatars: THREE.Mesh[] = [];
    const colors = [0xf5d78c, 0xd4af37, 0xb8a485, 0x9a8b6e, 0x7d6f57];
    const positions = [
      [-3, 0, 0],
      [-1.5, 1.5, -1],
      [0, 0, -2],
      [1.5, 1.5, -1],
      [3, 0, 0],
    ];

    positions.forEach((pos, i) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: colors[i],
        metalness: 0.6,
        roughness: 0.4,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(pos[0], pos[1], pos[2]);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);
      avatars.push(sphere);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle rotation of avatars
      avatars.forEach((avatar, i) => {
        avatar.rotation.y += 0.002 + i * 0.0005;
        // Pulse animation
        avatar.scale.x = 1 + Math.sin(Date.now() * 0.002 + i) * 0.05;
        avatar.scale.y = avatar.scale.x;
        avatar.scale.z = avatar.scale.x;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Connect to SSE for real-time updates
    if (meetingId) {
      const eventSource = new EventSource(`/api/theater/stream?meetingId=${meetingId}`);
      setIsConnected(true);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setCouncilState(data);
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
      };

      return () => {
        eventSource.close();
        window.removeEventListener('resize', handleResize);
        containerRef.current?.removeChild(renderer.domElement);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [meetingId]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-screen bg-charcoal-900" />

      {/* Status indicator */}
      <motion.div
        className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${
          isConnected
            ? 'bg-green-500/20 text-green-400 border border-green-500'
            : 'bg-red-500/20 text-red-400 border border-red-500'
        }`}
        animate={{ opacity: isConnected ? 1 : 0.5 }}
        transition={{ duration: 0.5, repeat: isConnected ? Infinity : 0 }}
      >
        {isConnected ? '● En vivo' : '○ Desconectado'}
      </motion.div>
    </div>
  );
}
