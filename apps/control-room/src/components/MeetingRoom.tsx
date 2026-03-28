'use client';

/**
 * MeetingRoom — KUPURI MEDIA™
 * Live and replay viewer for Synthia 3.0 agent meetings.
 * Ivette can watch in real-time or replay any past meeting.
 */

import { useState, useEffect, useRef } from 'react';

interface MeetingTurn {
  agent: string;
  role: string;
  message: string;
  timestamp: string;
  type: 'opening' | 'update' | 'decision' | 'action_item' | 'closing' | 'alert';
}

interface Meeting {
  id: string;
  type: string;
  title: string;
  scheduledAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  transcript: MeetingTurn[];
  summary?: string;
  duration?: number;
}

const AGENT_COLORS: Record<string, string> = {
  'synthia-prime': '#ff00ff',
  'ralphy': '#3b82f6',
  'indigo': '#06b6d4',
  'lapina': '#ec4899',
  'clandestino': '#f97316',
  'merlina': '#a855f7',
  'morpho': '#eab308',
  'ivette-voice': '#f59e0b',
};

const TURN_TYPE_ICONS: Record<MeetingTurn['type'], string> = {
  opening: '🎯',
  update: '📊',
  decision: '⚡',
  action_item: '✅',
  closing: '🌙',
  alert: '🚨',
};

function AgentAvatar({ name, color }: { name: string; color: string }) {
  const initials = name.split('-').map(w => w[0]?.toUpperCase()).join('').slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color + '33', border: `1px solid ${color}`, color }}
    >
      {initials}
    </div>
  );
}

function TurnCard({ turn }: { turn: MeetingTurn }) {
  const color = AGENT_COLORS[turn.agent] || '#6b7280';
  const icon = TURN_TYPE_ICONS[turn.type] || '💬';

  return (
    <div className="flex gap-3 py-2 px-1 hover:bg-zinc-900/40 rounded transition-colors">
      <AgentAvatar name={turn.agent} color={color} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold" style={{ color }}>{turn.agent}</span>
          <span className="text-zinc-600 text-xs">{turn.role}</span>
          <span className="text-zinc-700 text-xs ml-auto">{icon}</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{turn.message}</p>
        <span className="text-zinc-700 text-xs">{new Date(turn.timestamp).toLocaleTimeString('es-MX')}</span>
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [liveMeeting, setLiveMeeting] = useState<Meeting | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<MeetingTurn[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Fetch past meetings
  useEffect(() => {
    console.warn('[TODO] migrate: /api/meeting');
    setMeetings([]);
  }, []);

  // SSE for live meetings — TODO: migrate to SYNTHIA™ backend
  useEffect(() => {
    const es = new EventSource('/api/meeting/live');

    es.addEventListener('meeting:start', (e) => {
      const meeting: Meeting = JSON.parse(e.data);
      setLiveMeeting({ ...meeting, transcript: [] });
      setLiveTranscript([]);
      setIsLive(true);
    });

    es.addEventListener('meeting:turn', (e) => {
      const { turn }: { meetingId: string; turn: MeetingTurn } = JSON.parse(e.data);
      setLiveTranscript(prev => [...prev, turn]);
    });

    es.addEventListener('meeting:complete', (e) => {
      const meeting: Meeting = JSON.parse(e.data);
      setLiveMeeting(meeting);
      setMeetings(prev => [meeting, ...prev.filter(m => m.id !== meeting.id)]);
      setTimeout(() => setIsLive(false), 3000);
    });

    return () => es.close();
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const startMeeting = async (type: string) => {
    setIsStarting(true);
    try {
      console.warn('[TODO] migrate: /api/meeting', type);
    } finally {
      setIsStarting(false);
    }
  };

  const displayMeeting = isLive ? liveMeeting : selectedMeeting;
  const displayTranscript = isLive ? liveTranscript : (selectedMeeting?.transcript || []);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙️</span>
          <span className="text-zinc-100 font-semibold text-sm">Sala de Reuniones</span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              EN VIVO
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(['morning_standup', 'midday_pulse', 'evening_wrap'] as const).map((type) => (
            <button
              key={type}
              onClick={() => startMeeting(type)}
              disabled={isStarting || isLive}
              className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 transition-colors"
            >
              {type === 'morning_standup' ? '☀️' : type === 'midday_pulse' ? '⚡' : '🌙'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-80">
        {/* Meeting list sidebar */}
        <div className="w-48 border-r border-zinc-800 overflow-y-auto">
          {isLive && liveMeeting && (
            <div
              className="px-3 py-2 border-b border-zinc-800 cursor-pointer bg-red-950/20"
              onClick={() => setSelectedMeeting(null)}
            >
              <div className="text-xs text-red-400 font-medium truncate">🔴 {liveMeeting.title}</div>
              <div className="text-xs text-zinc-600">En vivo ahora</div>
            </div>
          )}
          {meetings.map(m => (
            <div
              key={m.id}
              onClick={() => { setSelectedMeeting(m); setIsLive(false); }}
              className={`px-3 py-2 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900 transition-colors ${selectedMeeting?.id === m.id ? 'bg-zinc-900' : ''}`}
            >
              <div className="text-xs text-zinc-300 font-medium truncate">
                {m.type === 'morning_standup' ? '☀️' : m.type === 'midday_pulse' ? '⚡' : '🌙'} {m.title.split('—')[0]}
              </div>
              <div className="text-xs text-zinc-600">
                {new Date(m.scheduledAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-zinc-700">{m.transcript?.length || 0} turnos</div>
            </div>
          ))}
          {meetings.length === 0 && !isLive && (
            <div className="px-3 py-4 text-xs text-zinc-600 text-center">
              No hay reuniones todavía.<br />Inicia una arriba.
            </div>
          )}
        </div>

        {/* Transcript area */}
        <div className="flex-1 flex flex-col">
          {displayMeeting ? (
            <>
              <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="text-xs text-zinc-300 font-medium">{displayMeeting.title}</div>
                {displayMeeting.duration && (
                  <div className="text-xs text-zinc-600">{Math.round(displayMeeting.duration / 60)} min · {displayMeeting.transcript?.length || displayTranscript.length} turnos</div>
                )}
              </div>
              <div ref={transcriptRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {displayTranscript.map((turn, i) => (
                  <TurnCard key={i} turn={turn} />
                ))}
                {isLive && (
                  <div className="flex items-center gap-2 py-2 px-1 text-xs text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span>Agentes pensando...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">🎙️</div>
                <div>Selecciona una reunión para ver la transcripción</div>
                <div className="text-xs mt-1">o inicia una nueva arriba</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
