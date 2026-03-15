"use client";

import { useState, useEffect } from 'react';

interface BriefData {
  greeting: string;
  trending: string;
  metrics: string;
  schedule: string;
  recommendation: string;
  cta: string;
  fullBrief: string;
}

interface DailyBriefCardProps {
  userId?: string;
  language?: 'es' | 'en';
}

export function DailyBriefCard({ userId, language = 'es' }: DailyBriefCardProps) {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const res = await fetch(`/api/daily-brief?userId=${userId || 'default'}`);
        if (res.ok) {
          const data = await res.json();
          setBrief(data.brief);
        }
      } catch (error) {
        console.error('Error fetching daily brief:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if not dismissed and before 8:05am CDMX
    const cdmxTime = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
    );
    const hour = cdmxTime.getHours();
    const minute = cdmxTime.getMinutes();

    if (!isDismissed && hour === 8 && minute <= 5) {
      fetchBrief();
    } else {
      setIsLoading(false);
    }
  }, [userId, isDismissed]);

  if (isDismissed || !brief || isLoading) {
    return null;
  }

  const labels = {
    es: {
      briefing: '📊 Briefing Ejecutivo de Hoy',
      share: 'Compartir con ALEX™',
      dismiss: 'Descartar',
      showLess: 'Mostrar menos',
      showMore: 'Leer más',
    },
    en: {
      briefing: '📊 Today\'s Executive Brief',
      share: 'Share with ALEX™',
      dismiss: 'Dismiss',
      showLess: 'Show Less',
      showMore: 'Read More',
    },
  };

  const t = labels[language];

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-300 mb-1">{t.briefing}</h3>
          <p className="text-sm text-slate-400">{new Date().toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US')}</p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-300 transition-colors font-bold"
        >
          ✕
        </button>
      </div>

      {/* Greeting Section */}
      {brief.greeting && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded border border-slate-700">
          <p className="text-amber-300 font-semibold text-sm">{brief.greeting}</p>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded ? (
        <div className="space-y-4 mb-4 text-sm">
          {brief.trending && (
            <div>
              <p className="text-amber-400 font-bold mb-2">🔥 {language === 'es' ? 'TRENDING AHORA' : 'TRENDING NOW'}</p>
              <p className="text-slate-300 whitespace-pre-line">{brief.trending}</p>
            </div>
          )}
          {brief.metrics && (
            <div>
              <p className="text-amber-400 font-bold mb-2">📱 {language === 'es' ? 'TUS NÚMEROS' : 'YOUR NUMBERS'}</p>
              <p className="text-slate-300 whitespace-pre-line">{brief.metrics}</p>
            </div>
          )}
          {brief.schedule && (
            <div>
              <p className="text-amber-400 font-bold mb-2">📅 {language === 'es' ? 'TU AGENDA' : 'YOUR SCHEDULE'}</p>
              <p className="text-slate-300 whitespace-pre-line">{brief.schedule}</p>
            </div>
          )}
          {brief.recommendation && (
            <div className="p-3 bg-amber-900/30 border border-amber-700/50 rounded">
              <p className="text-amber-300 font-bold mb-2">💡 {language === 'es' ? 'RECOMENDACIÓN' : 'RECOMMENDATION'}</p>
              <p className="text-slate-200">{brief.recommendation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 text-sm text-slate-300">
          <p className="line-clamp-2">{brief.recommendation || brief.metrics || 'ALEX™ está preparando tu briefing...'}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded transition-colors"
        >
          {isExpanded ? t.showLess : t.showMore}
        </button>
        <button className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 rounded transition-colors flex-1">
          {t.share}
        </button>
      </div>
    </div>
  );
}
