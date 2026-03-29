/**
 * PAULI-CLIP™ Orchestrator
 * 3D Council Ceremony System for El Panorama™ Agent Orchestration
 *
 * Manages:
 * - Sphere dissolution ceremonies
 * - Council member orchestration
 * - Sound/light choreography
 * - Demo mode simulations
 */

import * as THREE from 'three';

export interface CouncilMember {
  id: string;
  name: string;
  role: 'synthia' | 'darya' | 'research' | 'deploy' | 'observer';
  sphereColor: string;
  position: [number, number, number];
  active: boolean;
}

export interface CeremonyState {
  phase: 'gathering' | 'deliberation' | 'dissolution' | 'reflection' | 'dismissed';
  startTime: number;
  durationMs: number;
  members: CouncilMember[];
  decisions: string[];
  particleIntensity: number;
}

export interface AudioVisualConfig {
  soundEnabled: boolean;
  lightMode: 'ambient' | 'dramatic' | 'ethereal' | 'debug';
  particlesEnabled: boolean;
  demoMode: boolean;
  playbackSpeed: number;
}

export class PauliClipOrchestrator {
  private scene: THREE.Scene;
  private audioContext: AudioContext | null = null;
  private ceremonyState: CeremonyState;
  private avConfig: AudioVisualConfig;
  private sphereMeshes: Map<string, THREE.Mesh> = new Map();
  private particleSystem: ParticleEmitter | null = null;
  private lightRigs: Map<string, THREE.Light[]> = new Map();
  private animationFrameId: number | null = null;
  private ceremonyStartTime: number = 0;
  private demoSchedule: DemoEvent[] = [];
  private demoIndex: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.ceremonyState = {
      phase: 'gathering',
      startTime: Date.now(),
      durationMs: 300000, // 5 minutes
      members: [],
      decisions: [],
      particleIntensity: 0,
    };
    this.avConfig = {
      soundEnabled: true,
      lightMode: 'dramatic',
      particlesEnabled: true,
      demoMode: false,
      playbackSpeed: 1.0,
    };
    this.initializeAudioContext();
    this.buildLightRigs();
  }

  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch {
      console.warn('[PAULI-CLIP] AudioContext not available');
    }
  }

  /**
   * Initialize council ceremony with members
   */
  public initializeCeremony(members: CouncilMember[], durationMs: number = 300000): void {
    this.ceremonyState.members = members;
    this.ceremonyState.durationMs = durationMs;
    this.ceremonyState.startTime = Date.now();
    this.ceremonyStartTime = Date.now();
    this.ceremonyState.phase = 'gathering';
    this.ceremonyState.decisions = [];
    this.ceremonyState.particleIntensity = 0;

    // Create sphere meshes for each member
    members.forEach((member) => {
      this.createMemberSphere(member);
    });

    // Initialize particle system
    if (this.avConfig.particlesEnabled) {
      this.particleSystem = new ParticleEmitter(this.scene);
    }

    // Start animation loop
    this.startCeremonyAnimation();

    // Setup demo if enabled
    if (this.avConfig.demoMode) {
      this.setupDemoPlayback(members);
    }
  }

  /**
   * Create threejs sphere mesh for council member
   */
  private createMemberSphere(member: CouncilMember): void {
    const geometry = new THREE.IcosahedronGeometry(1.5, 16);
    const material = new THREE.MeshPhongMaterial({
      color: member.sphereColor,
      emissive: member.sphereColor,
      emissiveIntensity: 0.3,
      wireframe: false,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...member.position);
    sphere.userData.memberId = member.id;

    this.scene.add(sphere);
    this.sphereMeshes.set(member.id, sphere);

    // Add glow for active members
    if (member.active) {
      this.addSphereGlow(sphere, member.sphereColor);
    }
  }

  /**
   * Add bloom/glow effect to sphere
   */
  private addSphereGlow(sphere: THREE.Mesh, color: string): void {
    const glowGeometry = new THREE.IcosahedronGeometry(1.7, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.1,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(sphere.position);
    this.scene.add(glowMesh);
  }

  /**
   * Orchestrate ceremony phases
   */
  private startCeremonyAnimation(): void {
    const animate = () => {
      const elapsed = Date.now() - this.ceremonyStartTime;
      const progress = elapsed / this.ceremonyState.durationMs;

      // Phase progression
      if (progress < 0.15) {
        this.ceremonyState.phase = 'gathering';
        this.animateGathering(progress / 0.15);
      } else if (progress < 0.6) {
        this.ceremonyState.phase = 'deliberation';
        this.animateDeliberation((progress - 0.15) / 0.45);
      } else if (progress < 0.85) {
        this.ceremonyState.phase = 'dissolution';
        this.animateDissolution((progress - 0.6) / 0.25);
      } else if (progress < 0.95) {
        this.ceremonyState.phase = 'reflection';
        this.animateReflection((progress - 0.85) / 0.1);
      } else {
        this.ceremonyState.phase = 'dismissed';
      }

      // Update light mode
      this.updateLighting();

      // Update particles
      if (this.particleSystem) {
        this.particleSystem.update(this.ceremonyState.particleIntensity);
      }

      // Play procedural audio cues
      if (this.avConfig.soundEnabled) {
        this.playAudioCue(this.ceremonyState.phase, progress);
      }

      if (progress < 1.0) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Gathering phase: spheres converge toward center
   */
  private animateGathering(t: number): void {
    this.ceremonyState.members.forEach((member) => {
      const mesh = this.sphereMeshes.get(member.id);
      if (!mesh) return;

      // Interpolate toward center
      const centerPos = new THREE.Vector3(0, 5, 0);
      const startPos = new THREE.Vector3(...member.position);
      mesh.position.lerpVectors(startPos, centerPos, Math.pow(t, 0.5));

      // Gentle rotation
      mesh.rotation.x += 0.001;
      mesh.rotation.y += 0.002;

      // Particle intensity grows
      this.ceremonyState.particleIntensity = Math.min(0.3, t * 0.5);
    });
  }

  /**
   * Deliberation phase: spheres orbit and interact
   */
  private animateDeliberation(t: number): void {
    this.ceremonyState.members.forEach((member, idx) => {
      const mesh = this.sphereMeshes.get(member.id);
      if (!mesh) return;

      const angle = (Date.now() - this.ceremonyStartTime) * 0.0002 + (idx * Math.PI * 2) / Math.max(1, this.ceremonyState.members.length);
      const radius = 4 + Math.sin(t * Math.PI) * 1.5;
      const height = 5 + Math.cos(angle * 2) * 1.5;

      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = height;
      mesh.position.z = Math.sin(angle) * radius;

      // Rotation increases
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;

      // Particle intensity peaks
      this.ceremonyState.particleIntensity = Math.min(0.7, 0.3 + t * 0.5);
    });
  }

  /**
   * Dissolution phase: sphere particles dissipate
   */
  private animateDissolution(t: number): void {
    this.ceremonyState.members.forEach((member) => {
      const mesh = this.sphereMeshes.get(member.id);
      if (!mesh) return;

      // Spheres expand and fade
      const scale = 1 + t * 2;
      mesh.scale.set(scale, scale, scale);
      (mesh.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - t);

      // Intense rotation
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.015;
    });

    // Particle system peaks during dissolution
    this.ceremonyState.particleIntensity = Math.min(1.0, 0.7 + t * 0.3);
  }

  /**
   * Reflection phase: gentle conclusion
   */
  private animateReflection(t: number): void {
    // Slow fade to black
    this.ceremonyState.members.forEach((member) => {
      const mesh = this.sphereMeshes.get(member.id);
      if (!mesh) return;
      (mesh.material as THREE.MeshPhongMaterial).opacity *= 0.95;
    });

    this.ceremonyState.particleIntensity *= 0.95;
  }

  /**
   * Update lighting based on mode
   */
  private buildLightRigs(): void {
    // Dramatic rig
    const dramaticlights = [
      new THREE.DirectionalLight(0xffffff, 1),
      new THREE.PointLight(0xff00ff, 0.8),
      new THREE.PointLight(0x00ffff, 0.6),
    ];
    dramaticlights[0].position.set(10, 15, 10);
    dramaticlights[1].position.set(-5, 8, 5);
    dramaticlights[2].position.set(5, 8, -5);
    this.lightRigs.set('dramatic', dramaticlights);

    // Ethereal rig
    const etherealLights = [
      new THREE.HemisphereLight(0x00ffff, 0xff00ff, 0.8),
      new THREE.PointLight(0xffff00, 0.4),
    ];
    etherealLights[1].position.set(0, 20, 0);
    this.lightRigs.set('ethereal', etherealLights);

    // Ambient rig
    const ambientLights = [
      new THREE.AmbientLight(0xffffff, 0.5),
    ];
    this.lightRigs.set('ambient', ambientLights);
  }

  private updateLighting(): void {
    const lights = this.lightRigs.get(this.avConfig.lightMode) || this.lightRigs.get('dramatic')!;

    // Clear existing lights
    this.scene.children = this.scene.children.filter((child) => !(child instanceof THREE.Light));

    // Add new rig
    lights.forEach((light) => this.scene.add(light));
  }

  /**
   * Procedural audio generation
   */
  private playAudioCue(phase: string, progress: number): void {
    if (!this.audioContext || this.audioContext.state === 'closed') return;

    const time = this.audioContext.currentTime;

    try {
      switch (phase) {
        case 'gathering':
          this.playTone(time, 220, 0.1, 'sine'); // A3
          break;
        case 'deliberation':
          this.playTone(time, 330 + Math.sin(progress * Math.PI * 4) * 50, 0.05, 'triangle');
          break;
        case 'dissolution':
          this.playTone(time, 440 + Math.random() * 220, 0.08, 'sawtooth');
          break;
        case 'reflection':
          this.playTone(time, 110, 0.15, 'sine');
          break;
      }
    } catch (e) {
      // Silently handle audio errors
    }
  }

  private playTone(time: number, frequency: number, duration: number, waveform: OscillatorType): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = waveform;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Register ceremony decision
   */
  public recordDecision(decision: string): void {
    this.ceremonyState.decisions.push(decision);
  }

  /**
   * Set audio/visual configuration
   */
  public setAVConfig(config: Partial<AudioVisualConfig>): void {
    this.avConfig = { ...this.avConfig, ...config };
  }

  /**
   * Get current ceremony state
   */
  public getState(): CeremonyState {
    return { ...this.ceremonyState };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.particleSystem) {
      this.particleSystem.dispose();
    }
    this.sphereMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
  }

  /**
   * Setup demo playback with predefined events
   */
  private setupDemoPlayback(members: CouncilMember[]): void {
    this.demoSchedule = [
      { timeMs: 1000, action: 'decision', value: 'Iniciando sesión del consejo' },
      { timeMs: 5000, action: 'decision', value: 'Analizando datos de misiones' },
      { timeMs: 10000, action: 'decision', value: 'Aprobando presupuesto' },
      { timeMs: 15000, action: 'decision', value: 'Actualizando esferas' },
    ];
  }
}

/**
 * Particle emitter for sphere dissolution effects
 */
class ParticleEmitter {
  private scene: THREE.Scene;
  private particles: THREE.Points[] = [];
  private emissionRate: number = 100;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(intensity: number): void {
    // Emit particles based on intensity
    const particleCount = Math.floor(this.emissionRate * intensity);
    for (let i = 0; i < particleCount; i++) {
      this.emitParticle();
    }

    // Update existing particles
    this.particles.forEach((p) => {
      p.rotation.x += 0.01;
      p.rotation.y += 0.02;
    });
  }

  private emitParticle(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(300); // 100 particles * 3 coords
    for (let i = 0; i < positions.length; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xff00ff,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.particles.push(points);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.scene.remove(points);
      geometry.dispose();
      material.dispose();
      this.particles = this.particles.filter((p) => p !== points);
    }, 3000);
  }

  public dispose(): void {
    this.particles.forEach((p) => {
      this.scene.remove(p);
      p.geometry.dispose();
      (p.material as THREE.Material).dispose();
    });
    this.particles = [];
  }
}

interface DemoEvent {
  timeMs: number;
  action: string;
  value?: string;
}
