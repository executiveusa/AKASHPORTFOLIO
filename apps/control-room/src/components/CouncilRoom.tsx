'use client';

/**
 * CouncilRoom — KUPURI MEDIA™
 * LLM Council deliberation UI.
 * Synthia can convene the council and Ivette can see how decisions are made.
 */

import { useState, useEffect } from 'react';

interface CouncilVote {
  member: string;
  vote: string;
  confidence: number;
  reasoning: string;
  concerns?: string[];
  suggestedModifications?: string;
  timestamp: string;
}

interface CouncilSession {
  id: string;
  question: string;
  votes: CouncilVote[];
  synthesis: string;
  finalDecision: string;
  consensusScore: number;
  timestamp: string;
  completedAt?: string;
  actionItems: string[];
}

const MEMBER_STYLES: Record<string, { label: string; color: string; emoji: string }> = {
  synthia: { label: 'Synthia', color: '#ff00ff', emoji: '👑' },
  perplexity: { label: 'Perplexity', color: '#06b6d4', emoji: '🔍' },
  minimax: { label: 'MiniMax', color: '#a855f7', emoji: '🛠️' },
  gemini: { label: 'Gemini', color: '#eab308', emoji: '🌐' },
  'devil-advocate': { label: 'Abogado Diablo', color: '#ef4444', emoji: '😈' },
};

const VOTE_COLORS: Record<string, string> = {
  approve: 'text-green-400 border-green-700 bg-green-950/30',
  reject: 'text-red-400 border-red-700 bg-red-950/30',
  modify: 'text-amber-400 border-amber-700 bg-amber-950/30',
  abstain: 'text-zinc-400 border-zinc-700 bg-zinc-900/30',
};

export default function CouncilRoom() {
  const [sessions, setSessions] = useState<CouncilSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CouncilSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: '', context: '', urgency: 'today' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    console.warn('[TODO] migrate: /api/council');
    setSessions([]);
  }, []);

  const conveneCouncil = async () => {
    if (!form.question || !form.context) return;
    setLoading(true);
    try {
      console.warn('[TODO] migrate: /api/council — use synthiaApi.spheres.council()');
      setShowForm(false);
      setForm({ question: '', context: '', urgency: 'today' });
    } finally {
      setLoading(false);
    }
  };

  const VOTE_LABEL: Record<string, string> = {
    approve: 'APROBAR',
    reject: 'RECHAZAR',
    modify: 'MODIFICAR',
    abstain: 'ABSTENCIÓN',
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <span className="text-zinc-100 font-semibold text-sm">Consejo de LLMs</span>
          <span className="text-xs text-zinc-600">5 miembros · Votación deliberativa</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-800 transition-colors disabled:opacity-50"
        >
          {loading ? '⏳ Deliberando...' : '+ Convocar Consejo'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="space-y-2">
            <input
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Pregunta para el Consejo..."
              className="w-full bg-zinc-800 text-zinc-300 text-xs rounded px-3 py-2 border border-zinc-700 outline-none focus:border-purple-600"
            />
            <textarea
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              placeholder="Contexto, datos relevantes, opciones consideradas..."
              rows={3}
              className="w-full bg-zinc-800 text-zinc-300 text-xs rounded px-3 py-2 border border-zinc-700 outline-none resize-none focus:border-purple-600"
            />
            <div className="flex gap-2 justify-end">
              <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))} className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700">
                <option value="immediate">Inmediato</option>
                <option value="today">Hoy</option>
                <option value="this_week">Esta semana</option>
              </select>
              <button onClick={conveneCouncil} disabled={loading || !form.question || !form.context} className="text-xs px-4 py-1 rounded bg-purple-800/60 text-purple-200 border border-purple-700 hover:bg-purple-700/60 disabled:opacity-40">
                Convocar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-72">
        {/* Sessions sidebar */}
        <div className="w-48 border-r border-zinc-800 overflow-y-auto">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s)}
              className={`w-full text-left px-3 py-2 border-b border-zinc-900 hover:bg-zinc-900 transition-colors ${selectedSession?.id === s.id ? 'bg-zinc-900' : ''}`}
            >
              <div className={`text-xs font-medium mb-0.5 px-1.5 py-0.5 rounded border inline-block ${VOTE_COLORS[s.finalDecision]}`}>
                {VOTE_LABEL[s.finalDecision] || s.finalDecision} {s.consensusScore}%
              </div>
              <div className="text-xs text-zinc-400 truncate mt-1">{s.question.slice(0, 50)}...</div>
              <div className="text-xs text-zinc-700">{new Date(s.timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="px-3 py-4 text-xs text-zinc-600 text-center">
              Sin sesiones.<br />Convoca al consejo.
            </div>
          )}
        </div>

        {/* Session detail */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedSession ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Pregunta</div>
                <div className="text-sm text-zinc-200 font-medium">{selectedSession.question}</div>
              </div>

              <div className={`text-xs font-bold px-2 py-1 rounded border inline-flex items-center gap-1 ${VOTE_COLORS[selectedSession.finalDecision]}`}>
                Decisión: {VOTE_LABEL[selectedSession.finalDecision] || selectedSession.finalDecision} · {selectedSession.consensusScore}% consenso
              </div>

              {/* Votes */}
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 font-medium">Votos del Consejo</div>
                {selectedSession.votes.map((vote, i) => {
                  const style = MEMBER_STYLES[vote.member] || { label: vote.member, color: '#6b7280', emoji: '🤖' };
                  return (
                    <div key={i} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{style.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: style.color }}>{style.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${VOTE_COLORS[vote.vote]}`}>{VOTE_LABEL[vote.vote] || vote.vote}</span>
                        <span className="text-xs text-zinc-600 ml-auto">{vote.confidence}% confianza</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{vote.reasoning}</p>
                      {vote.concerns && vote.concerns.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {vote.concerns.map((c, ci) => (
                            <span key={ci} className="text-xs text-amber-500/70 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/40">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Synthesis */}
              {selectedSession.synthesis && (
                <div className="bg-purple-950/20 rounded-lg p-3 border border-purple-800/40">
                  <div className="text-xs text-purple-400 font-medium mb-1">👑 Síntesis de Synthia</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedSession.synthesis}</p>
                </div>
              )}

              {/* Action items */}
              {selectedSession.actionItems?.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 font-medium mb-1">Acciones a Tomar</div>
                  {selectedSession.actionItems.map((item, i) => (
                    <div key={i} className="flex gap-2 text-xs text-zinc-300 py-0.5">
                      <span className="text-green-500">{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">⚖️</div>
                <div>Selecciona una sesión o convoca al consejo</div>
                <div className="text-xs mt-1 text-zinc-700">5 LLMs deliberan y votan juntos</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
