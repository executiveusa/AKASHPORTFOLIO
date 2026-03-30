'use client';

import { useState } from 'react';
import { Theater3D } from '@/components/Theater3D';
import LocationPicker from '@/components/LocationPicker';
import MeetingSchedule from '@/components/MeetingSchedule';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MEETING_LOCATIONS,
  WEEKLY_SCHEDULE,
  type MeetingLocation,
  type ScheduledMeeting,
} from '@/lib/meeting-locations';

interface TheaterMeeting {
  id: string;
  status: 'pending' | 'live' | 'completed';
  participants: string[];
  topic: string;
  locationId: string;
}

type Tab = 'theater' | 'locations' | 'schedule';

const T = {
  en: {
    title: 'Council Chamber',
    subtitle: 'Synthia 3.0 — Agentic World Meetings',
    tabs: { theater: '🎭 Theater', locations: '🗺️ Locations', schedule: '📅 Schedule' },
    start: 'Start Meeting',
    end: 'End Meeting',
    interrupt: 'Interrupt',
    approve: 'Approve',
    reject: 'Reject',
    transcript: 'View Transcript',
    noMeeting: 'No active meeting — pick a location and start',
    joinDemo: 'Load Demo Location',
  },
  es: {
    title: 'Sala del Consejo',
    subtitle: 'Synthia 3.0 — Reuniones Mundiales Agénticas',
    tabs: { theater: '🎭 Teatro', locations: '🗺️ Lugares', schedule: '📅 Agenda' },
    start: 'Iniciar Reunión',
    end: 'Terminar Reunión',
    interrupt: 'Interrumpir',
    approve: 'Aprobar',
    reject: 'Rechazar',
    transcript: 'Ver Transcripción',
    noMeeting: 'Sin reunión activa — elige un lugar y comienza',
    joinDemo: 'Cargar Lugar Demo',
  },
};

export default function TheaterPage() {
  const [language, setLanguage] = useState<'en' | 'es'>('es');
  const [activeTab, setActiveTab] = useState<Tab>('theater');
  const [selectedLocation, setSelectedLocation] = useState<MeetingLocation>(
    MEETING_LOCATIONS[1] // Default: Balcón del Zócalo
  );
  const [activeMeeting, setActiveMeeting] = useState<TheaterMeeting | null>(null);
  const [showPanel, setShowPanel] = useState(true);

  const t = T[language];

  const startMeeting = (loc?: MeetingLocation, scheduledMeeting?: ScheduledMeeting) => {
    const l = loc ?? selectedLocation;
    const topic = scheduledMeeting
      ? (language === 'es' ? scheduledMeeting.titleEs : scheduledMeeting.title)
      : (language === 'es' ? 'Reunión del Consejo' : 'Council Meeting');
    const participants = scheduledMeeting?.participants ?? l.defaultParticipants;

    setActiveMeeting({
      id: `meeting-${Date.now()}`,
      status: 'live',
      participants,
      topic,
      locationId: l.id,
    });
    setSelectedLocation(l);
    setActiveTab('theater');
  };

  const handleScheduleMeetingClick = (meeting: ScheduledMeeting) => {
    const loc = MEETING_LOCATIONS.find((l) => l.id === meeting.locationId);
    if (loc) startMeeting(loc, meeting);
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: `#${selectedLocation.bgColor.toString(16).padStart(6, '0')}` }}
    >
      {/* 3D canvas - always rendered behind */}
      <div className="absolute inset-0">
        <Theater3D
          meetingId={activeMeeting?.id}
          bilingual={language === 'es'}
          location={selectedLocation}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-linear-to-b from-black/70 to-transparent">
        {/* Back link */}
        <a
          href="/dashboard"
          className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition flex items-center gap-1"
        >
          ← Dashboard
        </a>

        {/* Title */}
        <div className="text-center hidden md:block">
          <h1
            className="text-xl font-black text-white"
            style={{ fontFamily: 'Playfair Display, serif', color: selectedLocation.accentHex }}
          >
            {t.title}
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400">{t.subtitle}</p>
        </div>

        {/* Language + panel toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-300 hover:border-zinc-400 transition"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-300 hover:border-zinc-400 transition"
          >
            {showPanel ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Bottom panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-xl border-t border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(['theater', 'locations', 'schedule'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'text-white border-b-2'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={activeTab === tab ? { borderColor: selectedLocation.accentHex } : {}}
                >
                  {t.tabs[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-h-[55vh] overflow-y-auto p-6">
              <AnimatePresence mode="wait">

                {/* Theater controls tab */}
                {activeTab === 'theater' && (
                  <motion.div
                    key="theater"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* Current location info */}
                    <div className="flex items-center gap-4 mb-4 p-3 rounded-xl border border-white/10 bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedLocation.referenceImageUrl}
                        alt={selectedLocation.nameEs}
                        crossOrigin="anonymous"
                        className="w-20 h-14 object-cover rounded-lg opacity-80"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: selectedLocation.accentHex }}
                        >
                          {selectedLocation.neighborhood}
                        </p>
                        <p className="text-sm font-bold text-white truncate">{selectedLocation.nameEs}</p>
                        <p className="text-[9px] text-zinc-400 mt-0.5 line-clamp-1">
                          {language === 'es' ? selectedLocation.descriptionEs : selectedLocation.description}
                        </p>
                      </div>
                    </div>

                    {/* Meeting status */}
                    <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      {activeMeeting ? (
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
                            style={{ backgroundColor: selectedLocation.accentHex }}
                          />
                          <div>
                            <p className="text-sm font-bold text-white">{activeMeeting.topic}</p>
                            <p className="text-[9px] text-zinc-400">
                              {activeMeeting.participants.length}{' '}
                              {language === 'es' ? 'participantes' : 'participants'} ·{' '}
                              {activeMeeting.locationId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">{t.noMeeting}</p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-3">
                      {!activeMeeting ? (
                        <motion.button
                          onClick={() => startMeeting()}
                          className="px-6 py-2.5 rounded-lg font-bold text-sm text-black"
                          style={{ backgroundColor: selectedLocation.accentHex }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {t.start}
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            onClick={() => setActiveMeeting(null)}
                            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-zinc-800 text-white border border-zinc-600 hover:bg-zinc-700 transition"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {t.end}
                          </motion.button>
                          <motion.button
                            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30 transition"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {t.interrupt}
                          </motion.button>
                          <motion.button
                            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500/30 transition"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {t.approve}
                          </motion.button>
                          <motion.button
                            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-orange-500/20 text-orange-400 border border-orange-500 hover:bg-orange-500/30 transition"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {t.reject}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Location picker tab */}
                {activeTab === 'locations' && (
                  <motion.div
                    key="locations"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <LocationPicker
                      selected={selectedLocation}
                      onSelect={(loc) => {
                        setSelectedLocation(loc);
                        setActiveTab('theater');
                      }}
                      language={language}
                    />
                  </motion.div>
                )}

                {/* Schedule tab */}
                {activeTab === 'schedule' && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MeetingSchedule
                      language={language}
                      onSelectMeeting={handleScheduleMeetingClick}
                      activeMeetingId={activeMeeting?.id}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

