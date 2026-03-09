'use client';

import { useState } from 'react';
import { Theater3D } from '@/components/Theater3D';
import { motion } from 'framer-motion';

interface TheaterMeeting {
  id: string;
  status: 'pending' | 'live' | 'completed';
  participants: number;
  topic: string;
}

export default function TheaterPage() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [activeMeeting, setActiveMeeting] = useState<TheaterMeeting | null>(null);
  const [showControls, setShowControls] = useState(true);

  const translations = {
    en: {
      title: 'Council Chamber',
      subtitle: 'Synthia 3.0 Agentic Meetings',
      startMeeting: 'Start Council Meeting',
      interrupt: 'Interrupt',
      approve: 'Approve Decision',
      reject: 'Reject Decision',
      viewTranscript: 'View Transcript',
      language: 'Language',
      noActiveMeeting: 'No active meeting',
    },
    es: {
      title: 'Sala del Consejo',
      subtitle: 'Reuniones Agentes Synthia 3.0',
      startMeeting: 'Iniciar Reunión del Consejo',
      interrupt: 'Interrumpir',
      approve: 'Aprobar Decisión',
      reject: 'Rechazar Decisión',
      viewTranscript: 'Ver Transcripción',
      language: 'Idioma',
      noActiveMeeting: 'No hay reunión activa',
    },
  };

  const t = translations[language];

  return (
    <div className="relative w-full h-screen bg-charcoal-900 overflow-hidden">
      {/* Theater Canvas */}
      <Theater3D meetingId={activeMeeting?.id} bilingual={language === 'es'} />

      {/* Language Toggle */}
      <motion.button
        onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
        className="absolute top-4 left-4 px-4 py-2 bg-gold-pulse/20 hover:bg-gold-pulse/40 border border-gold-pulse rounded-lg font-semibold text-cream-400 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {language.toUpperCase()}
      </motion.button>

      {/* Control Panel */}
      {showControls && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/80 to-transparent p-6 border-t border-gold-pulse/30"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-gold-pulse mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  {t.title}
                </h1>
                <p className="text-cream-400 text-sm">{t.subtitle}</p>
              </div>
              <motion.button
                onClick={() => setShowControls(false)}
                className="text-cream-400 hover:text-gold-pulse transition"
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Status */}
            <div className="mb-6 p-4 rounded-lg bg-glass-panel border border-gold-pulse/20">
              <p className="text-cream-400 text-sm">
                {activeMeeting ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {activeMeeting.topic} • {activeMeeting.participants} {language === 'en' ? 'participants' : 'participantes'}
                  </>
                ) : (
                  <>{t.noActiveMeeting}</>
                )}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setActiveMeeting({
                  id: `meeting-${Date.now()}`,
                  status: 'live',
                  participants: 5,
                  topic: language === 'en' ? 'Council Discussion' : 'Discusión del Consejo',
                })}
                className="px-6 py-3 bg-gold-pulse text-charcoal-900 font-bold rounded-lg hover:bg-gold-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!!activeMeeting}
              >
                {t.startMeeting}
              </motion.button>

              {activeMeeting && (
                <>
                  <motion.button
                    className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500 font-bold rounded-lg hover:bg-red-500/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t.interrupt}
                  </motion.button>
                  <motion.button
                    className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500 font-bold rounded-lg hover:bg-green-500/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t.approve}
                  </motion.button>
                  <motion.button
                    className="px-6 py-3 bg-orange-500/20 text-orange-400 border border-orange-500 font-bold rounded-lg hover:bg-orange-500/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t.reject}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
