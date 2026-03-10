'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MEETING_LOCATIONS, type MeetingLocation } from '@/lib/meeting-locations';

interface LocationPickerProps {
  selected: MeetingLocation | null;
  onSelect: (loc: MeetingLocation) => void;
  language?: 'en' | 'es';
}

const LOCATION_EMOJIS: Record<string, string> = {
  'santa-maria-ribera': '🌿',
  'balcon-del-zocalo': '🏛️',
  'manantiales-xochimilco': '🌊',
};

export default function LocationPicker({
  selected,
  onSelect,
  language = 'es',
}: LocationPickerProps) {
  return (
    <div className="w-full">
      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold-400 mb-4">
        {language === 'es' ? '🗺️ Elige el Lugar de Reunión' : '🗺️ Choose Meeting Location'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MEETING_LOCATIONS.map((loc) => {
          const isSelected = selected?.id === loc.id;
          const emoji = LOCATION_EMOJIS[loc.id] ?? '📍';

          return (
            <motion.button
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={`relative group w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                isSelected
                  ? 'border-gold-400 shadow-lg'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
              style={isSelected ? { boxShadow: `0 0 20px ${loc.accentHex}40` } : {}}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Reference image thumbnail */}
              <div className="relative h-36 bg-zinc-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.referenceImageUrl}
                  alt={loc.nameEs}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback gradient if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Color overlay (matches 3D environment) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 50%, #${loc.bgColor.toString(16).padStart(6,'0')}ee 100%)`,
                  }}
                />

                {/* Selected badge */}
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                    style={{ backgroundColor: loc.accentHex, color: '#000' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {language === 'es' ? 'Activo' : 'Active'}
                  </motion.div>
                )}

                {/* Emoji badge */}
                <div className="absolute top-2 left-2 text-xl">{emoji}</div>
              </div>

              {/* Text content */}
              <div className="p-3">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: loc.accentHex }}
                >
                  {loc.neighborhood}
                </p>
                <p className="text-sm font-bold text-white leading-tight mb-2">
                  {language === 'es' ? loc.nameEs : loc.name}
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3">
                  {language === 'es' ? loc.descriptionEs : loc.description}
                </p>

                {/* Agents */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {loc.defaultParticipants.slice(0, 3).map((ag) => (
                    <span
                      key={ag}
                      className="text-[8px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                    >
                      {ag.replace('Agent-', '').replace('Synthia ', 'S.')}
                    </span>
                  ))}
                  {loc.defaultParticipants.length > 3 && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                      +{loc.defaultParticipants.length - 3}
                    </span>
                  )}
                </div>

                {/* Real image caption */}
                <p className="text-[7px] text-zinc-700 mt-2 leading-tight">
                  {loc.referenceImageCaption}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
