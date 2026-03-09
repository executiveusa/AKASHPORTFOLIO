/**
 * Avatar Voice Synchronization
 * Maps phonemes to mouth shapes and coordinates VRM avatar animation
 */

interface Viseme {
  name: string;
  morphTarget: string; // VRM blend shape name
  intensity: number; // 0-1
  duration: number; // milliseconds
}

interface PhonemeFrame {
  time: number; // ms from start
  phoneme: string;
  viseme: Viseme;
}

interface AudioTimestamp {
  timestamp: number; // ms
  viseme: string;
}

export class AvatarVoiceSync {
  private phonemeToVisemeMap: Map<string, Viseme> = new Map();
  private currentAnimationTimeline: PhonemeFrame[] = [];

  constructor() {
    this.initializePhonemeMap();
  }

  /**
   * Initialize phoneme to VRM blend shape mapping
   */
  private initializePhonemeMap() {
    const mappings: [string, Partial<Viseme>][] = [
      ['a', { morphTarget: 'Aa', intensity: 1, duration: 100 }],
      ['e', { morphTarget: 'Ee', intensity: 0.8, duration: 100 }],
      ['i', { morphTarget: 'Ih', intensity: 0.7, duration: 100 }],
      ['o', { morphTarget: 'Oh', intensity: 1, duration: 100 }],
      ['u', { morphTarget: 'Ou', intensity: 0.9, duration: 100 }],
      ['p', { morphTarget: 'Pp', intensity: 1, duration: 80 }],
      ['b', { morphTarget: 'Bb', intensity: 1, duration: 80 }],
      ['m', { morphTarget: 'Mm', intensity: 0.9, duration: 100 }],
      ['f', { morphTarget: 'Ff', intensity: 0.7, duration: 90 }],
      ['v', { morphTarget: 'Vv', intensity: 0.8, duration: 90 }],
      ['th', { morphTarget: 'TH', intensity: 0.8, duration: 100 }],
      ['s', { morphTarget: 'Ss', intensity: 0.6, duration: 100 }],
      ['z', { morphTarget: 'Zz', intensity: 0.6, duration: 100 }],
      ['n', { morphTarget: 'Nn', intensity: 0.5, duration: 80 }],
      ['l', { morphTarget: 'Ll', intensity: 0.6, duration: 90 }],
      ['r', { morphTarget: 'Rr', intensity: 0.5, duration: 100 }],
      ['j', { morphTarget: 'Jj', intensity: 0.7, duration: 100 }],
      ['g', { morphTarget: 'Gg', intensity: 0.6, duration: 100 }],
      ['k', { morphTarget: 'Kk', intensity: 0.5, duration: 80 }],
      ['silence', { morphTarget: 'Neutral', intensity: 0, duration: 50 }],
    ];

    mappings.forEach(([phoneme, viseme]) => {
      this.phonemeToVisemeMap.set(phoneme, {
        name: phoneme,
        morphTarget: viseme.morphTarget || 'Neutral',
        intensity: viseme.intensity || 0.5,
        duration: viseme.duration || 100,
      });
    });
  }

  /**
   * Generate animation timeline from lip-sync data
   */
  generateAnimationTimeline(lipSyncData: AudioTimestamp[]): PhonemeFrame[] {
    const timeline: PhonemeFrame[] = [];

    lipSyncData.forEach((frame, idx) => {
      const viseme = this.phonemeToVisemeMap.get(frame.viseme) || this.phonemeToVisemeMap.get('silence')!;

      timeline.push({
        time: frame.timestamp,
        phoneme: frame.viseme,
        viseme,
      });

      // Add transition frame
      if (idx < lipSyncData.length - 1) {
        const nextTime = lipSyncData[idx + 1].timestamp;
        const transitionTime = frame.timestamp + viseme.duration;

        if (transitionTime < nextTime) {
          timeline.push({
            time: transitionTime,
            phoneme: 'silence',
            viseme: this.phonemeToVisemeMap.get('silence')!,
          });
        }
      }
    });

    this.currentAnimationTimeline = timeline;
    return timeline;
  }

  /**
   * Get viseme at specific time
   */
  getVisemeAtTime(timeMs: number): Viseme | null {
    const frame = this.currentAnimationTimeline.find(
      f => f.time <= timeMs && timeMs < f.time + f.viseme.duration
    );

    return frame?.viseme || null;
  }

  /**
   * Apply viseme to VRM avatar blend shapes
   */
  applyVisemeToAvatar(
    avatar: any, // THREE.Object3D
    viseme: Viseme,
    transitionDuration: number = 50
  ) {
    if (!avatar.morphTargetInfluences) return;

    // Find blend shape index
    const blendShapeIndex = avatar.morphTargetDictionary?.[viseme.morphTarget];
    if (blendShapeIndex === undefined) return;

    // Smoothly transition to target intensity
    const startIntensity = avatar.morphTargetInfluences[blendShapeIndex] || 0;
    const targetIntensity = viseme.intensity;
    const steps = Math.ceil(transitionDuration / 16); // 16ms per frame (~60fps)

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const intensity = startIntensity + (targetIntensity - startIntensity) * progress;

      // Use requestAnimationFrame equivalent timing
      setTimeout(() => {
        if (avatar.morphTargetInfluences) {
          avatar.morphTargetInfluences[blendShapeIndex] = intensity;
        }
      }, i * 16);
    }
  }

  /**
   * Sync entire animation with audio playback
   */
  syncWithAudio(
    avatar: any,
    audioElement: HTMLAudioElement,
    lipSyncData: AudioTimestamp[]
  ) {
    const timeline = this.generateAnimationTimeline(lipSyncData);

    const updateViseme = () => {
      const currentTime = audioElement.currentTime * 1000; // Convert to ms
      const viseme = this.getVisemeAtTime(currentTime);

      if (viseme) {
        this.applyVisemeToAvatar(avatar, viseme, 50);
      }

      if (!audioElement.paused) {
        requestAnimationFrame(updateViseme);
      }
    };

    // Start sync when audio plays
    audioElement.addEventListener('play', () => {
      updateViseme();
    });
  }

  /**
   * Get debug visualization of animation timeline
   */
  getTimelineVisualization(maxTime: number = 5000): string {
    const barLength = 40;
    const bars = [];

    this.currentAnimationTimeline.slice(0, Math.ceil(maxTime / 100)).forEach(frame => {
      const position = Math.round((frame.time / maxTime) * barLength);
      const bar = '.'.repeat(position) + frame.viseme.morphTarget[0] + '.'.repeat(barLength - position);
      bars.push(`[${bar}] ${frame.phoneme} @ ${frame.time}ms`);
    });

    return bars.join('\n');
  }
}

export default new AvatarVoiceSync();
