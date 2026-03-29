'use client';

import React, { useState } from 'react';
import type { AudioVisualConfig } from '@/lib/pauli-clip-orchestrator';
import { motion } from 'framer-motion';

interface PauliClipControlsProps {
  onConfigChange: (config: Partial<AudioVisualConfig>) => void;
  currentPhase: string;
  decisionsCount: number;
}

export default function PauliClipControls({ onConfigChange, currentPhase, decisionsCount }: PauliClipControlsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lightMode, setLightMode] = useState<'ambient' | 'dramatic' | 'ethereal' | 'debug'>('dramatic');
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    onConfigChange({ soundEnabled: newValue });
  };

  const handleLightModeChange = (mode: typeof lightMode) => {
    setLightMode(mode);
    onConfigChange({ lightMode: mode });
  };

  const handleParticlesToggle = () => {
    const newValue = !particlesEnabled;
    setParticlesEnabled(newValue);
    onConfigChange({ particlesEnabled: newValue });
  };

  const handleDemoModeToggle = () => {
    const newValue = !demoMode;
    setDemoMode(newValue);
    onConfigChange({ demoMode: newValue });
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    onConfigChange({ playbackSpeed: speed });
  };

  const phaseColors: Record<string, string> = {
    gathering: '#c8a04a',
    deliberation: '#8a4a7a',
    dissolution: '#ff00ff',
    reflection: '#00ffff',
    dismissed: '#404040',
  };

  return (
    <div className="fixed bottom-6 left-6 max-w-sm bg-zinc-950/90 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-sm backdrop-blur">
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">PAULI-CLIP™ Ceremony</span>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: phaseColors[currentPhase] || '#404040' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Phase Status */}
      <div className="bg-zinc-900/50 rounded p-2">
        <div className="text-[10px] text-zinc-500 uppercase">Fase Actual</div>
        <div className="text-sm font-bold text-zinc-200 capitalize">
          {currentPhase === 'dismissed' ? '✓ Concluida' : currentPhase}
        </div>
        <div className="mt-1 text-[9px] text-zinc-500">
          Decisiones registradas: <span className="text-zinc-300 font-bold">{decisionsCount}</span>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-100 transition">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={handleSoundToggle}
            className="w-3 h-3 rounded"
          />
          <span className="text-[10px] uppercase tracking-widest">
            {soundEnabled ? '🔊 Audio' : '🔇 Mudo'}
          </span>
        </label>
      </div>

      {/* Particles Toggle */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-100 transition">
          <input
            type="checkbox"
            checked={particlesEnabled}
            onChange={handleParticlesToggle}
            className="w-3 h-3 rounded"
          />
          <span className="text-[10px] uppercase tracking-widest">
            {particlesEnabled ? '✨ Partículas' : '○ Sin Partículas'}
          </span>
        </label>
      </div>

      {/* Light Mode */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Modo Luz</div>
        <div className="grid grid-cols-2 gap-1">
          {(['ambient', 'dramatic', 'ethereal', 'debug'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleLightModeChange(mode)}
              className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest transition ${
                lightMode === mode
                  ? 'bg-zinc-400 text-zinc-900 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {mode === 'ambient'
                ? '◆ Ambiente'
                : mode === 'dramatic'
                  ? '⚡ Dramático'
                  : mode === 'ethereal'
                    ? '✧ Etéreo'
                    : '◉ Debug'}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Speed */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          Velocidad: {playbackSpeed.toFixed(1)}x
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          value={playbackSpeed}
          onChange={(e) => handlePlaybackSpeedChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded cursor-pointer"
        />
      </div>

      {/* Demo Mode */}
      <div className="pt-2 border-t border-zinc-800 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-100 transition">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={handleDemoModeToggle}
            className="w-3 h-3 rounded"
          />
          <span className="text-[10px] uppercase tracking-widest">
            {demoMode ? '▶ Demo Activo' : '⏸ Demo Off'}
          </span>
        </label>
      </div>

      {/* Info */}
      <div className="text-[9px] text-zinc-600 italic pt-2 border-t border-zinc-800">
        El Panorama™ 3D Council Ceremony Viewer. Observa la ceremonia de disolución de esferas.
      </div>
    </div>
  );
}
