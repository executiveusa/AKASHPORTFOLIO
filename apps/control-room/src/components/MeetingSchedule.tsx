'use client';

import { motion } from 'framer-motion';
import {
  WEEKLY_SCHEDULE,
  MEETING_LOCATIONS,
  DAY_NAMES,
  DAY_NAMES_ES,
  type ScheduledMeeting,
} from '@/lib/meeting-locations';

interface MeetingScheduleProps {
  language?: 'en' | 'es';
  onSelectMeeting?: (meeting: ScheduledMeeting) => void;
  activeMeetingId?: string | null;
}

const TODAY_DOW = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

const LOCATION_EMOJIS: Record<string, string> = {
  'santa-maria-ribera': '🌿',
  'balcon-del-zocalo': '🏛️',
  'manantiales-xochimilco': '🌊',
};

export default function MeetingSchedule({
  language = 'es',
  onSelectMeeting,
  activeMeetingId,
}: MeetingScheduleProps) {
  const dayNames = language === 'es' ? DAY_NAMES_ES : DAY_NAMES;
  const workDays: Array<0 | 1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];

  const getMeetingsForDay = (dow: number) =>
    WEEKLY_SCHEDULE.filter((m) => m.dayOfWeek === dow);

  const getLocation = (locationId: string) =>
    MEETING_LOCATIONS.find((l) => l.id === locationId);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold-400">
          {language === 'es' ? '📅 Agenda de Reuniones del Consejo' : '📅 Council Meeting Schedule'}
        </h3>
        <span className="text-[9px] uppercase tracking-widest text-zinc-500">
          {language === 'es' ? 'Hoy: ' : 'Today: '}
          {dayNames[TODAY_DOW]}
        </span>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {workDays.map((dow) => {
          const dayMeetings = getMeetingsForDay(dow);
          const isToday = dow === TODAY_DOW;

          return (
            <div
              key={dow}
              className={`rounded-xl border transition-all ${
                isToday
                  ? 'border-gold-400/60 bg-gold-400/5'
                  : 'border-zinc-800 bg-zinc-950/50'
              }`}
            >
              {/* Day header */}
              <div
                className={`px-3 py-2 rounded-t-xl text-center ${
                  isToday ? 'bg-gold-400/10' : 'bg-zinc-900/50'
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isToday ? 'text-gold-400' : 'text-zinc-400'
                  }`}
                >
                  {dayNames[dow]}
                  {isToday && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 bg-gold-400 rounded-full align-middle" />
                  )}
                </p>
              </div>

              {/* Meetings */}
              <div className="p-2 flex flex-col gap-2 min-h-[80px]">
                {dayMeetings.length === 0 ? (
                  <p className="text-[9px] text-zinc-700 text-center mt-3">
                    {language === 'es' ? 'Sin reunión' : 'No meeting'}
                  </p>
                ) : (
                  dayMeetings.map((meeting) => {
                    const loc = getLocation(meeting.locationId);
                    const isActive = meeting.id === activeMeetingId;
                    const emoji = LOCATION_EMOJIS[meeting.locationId] ?? '📍';

                    return (
                      <motion.button
                        key={meeting.id}
                        onClick={() => onSelectMeeting?.(meeting)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          isActive
                            ? 'border-gold-400 bg-gold-400/10 scale-105 shadow-gold'
                            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs">{emoji}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            {meeting.timeStart}
                          </span>
                        </div>
                        <p
                          className="text-[9px] font-bold leading-tight text-white truncate"
                          title={language === 'es' ? meeting.titleEs : meeting.title}
                        >
                          {language === 'es' ? meeting.titleEs : meeting.title}
                        </p>
                        {loc && (
                          <p
                            className="text-[8px] mt-0.5 truncate"
                            style={{ color: loc.accentHex }}
                          >
                            {loc.neighborhood.split(',')[0]}
                          </p>
                        )}
                        <div className="flex gap-0.5 mt-1 flex-wrap">
                          {meeting.participants.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="text-[7px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400"
                            >
                              {p.replace('Agent-', '').replace('Synthia ', 'S.')}
                            </span>
                          ))}
                          {meeting.participants.length > 3 && (
                            <span className="text-[7px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-500">
                              +{meeting.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {MEETING_LOCATIONS.map((loc) => (
          <div key={loc.id} className="flex items-center gap-1.5">
            <span className="text-xs">{LOCATION_EMOJIS[loc.id]}</span>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: loc.accentHex }}>
              {loc.neighborhood.split(',')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
