'use client';

/**
 * AgentMailbox — KUPURI MEDIA™
 * Inbox/outbox UI for the agent mail system.
 * Shows unread mails, allows sending, and tracks accountability.
 */

import { useState, useEffect } from 'react';

interface AgentMail {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  type: string;
  priority: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-400 border-red-800',
  high: 'text-amber-400 border-amber-800',
  normal: 'text-zinc-400 border-zinc-700',
  low: 'text-zinc-600 border-zinc-800',
};

const TYPE_ICONS: Record<string, string> = {
  task: '📋',
  report: '📊',
  alert: '🚨',
  council_vote: '⚖️',
  coaching: '⚡',
  broadcast: '📢',
  reply: '↩️',
};

const AGENTS = ['synthia-prime', 'ralphy', 'indigo', 'lapina', 'clandestino', 'merlina', 'morpho', 'ivette-voice'];

export default function AgentMailbox() {
  const [selectedAgent, setSelectedAgent] = useState('synthia-prime');
  const [inbox, setInbox] = useState<AgentMail[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMail, setSelectedMail] = useState<AgentMail | null>(null);
  const [systemSummary, setSystemSummary] = useState<{ totalUnread: number; urgentUnread: number; byAgent: Record<string, number> } | null>(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ to: '', subject: '', body: '', priority: 'normal', type: 'task' });

  const fetchInbox = async () => {
    try {
      const res = await fetch(`/api/mail?agentId=${selectedAgent}`);
      const data = await res.json();
      setInbox(data.inbox || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /**/ }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/mail');
      const data = await res.json();
      setSystemSummary(data.summary);
    } catch { /**/ }
  };

  useEffect(() => {
    fetchInbox();
    fetchSummary();
    const interval = setInterval(() => { fetchInbox(); fetchSummary(); }, 10000);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const markRead = async (mailId: string) => {
    await fetch('/api/mail', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mailId, agentId: selectedAgent }),
    });
    fetchInbox();
  };

  const sendMail = async () => {
    if (!draft.to || !draft.subject || !draft.body) return;
    await fetch('/api/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: selectedAgent, to: [draft.to], subject: draft.subject, body: draft.body, type: draft.type, priority: draft.priority }),
    });
    setComposing(false);
    setDraft({ to: '', subject: '', body: '', priority: 'normal', type: 'task' });
    fetchInbox();
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📬</span>
          <span className="text-zinc-100 font-semibold text-sm">Agent Mail</span>
          {systemSummary && systemSummary.totalUnread > 0 && (
            <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
              {systemSummary.totalUnread} sin leer
            </span>
          )}
        </div>
        <button
          onClick={() => setComposing(true)}
          className="text-xs px-3 py-1 rounded bg-cyan-900/40 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-800 transition-colors"
        >
          ✉️ Redactar
        </button>
      </div>

      <div className="flex h-80">
        {/* Agent selector sidebar */}
        <div className="w-40 border-r border-zinc-800 overflow-y-auto">
          {AGENTS.map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left px-3 py-2 border-b border-zinc-900 hover:bg-zinc-900 transition-colors ${selectedAgent === agent ? 'bg-zinc-900 border-l-2 border-l-cyan-500' : ''}`}
            >
              <div className="text-xs text-zinc-300 font-medium truncate">{agent}</div>
              {systemSummary?.byAgent?.[agent] ? (
                <div className="text-xs text-cyan-400">{systemSummary.byAgent[agent]} sin leer</div>
              ) : (
                <div className="text-xs text-zinc-700">Limpio</div>
              )}
            </button>
          ))}
        </div>

        {/* Mail list + detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {composing ? (
            <div className="p-4 flex flex-col gap-2 h-full overflow-y-auto">
              <div className="text-xs font-medium text-zinc-300 mb-1">Nuevo mensaje — de: {selectedAgent}</div>
              <select value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))} className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700">
                <option value="">Para: (selecciona agente)</option>
                {AGENTS.filter(a => a !== selectedAgent).map(a => <option key={a} value={a}>{a}</option>)}
                <option value="ivette">ivette</option>
              </select>
              <input value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} placeholder="Asunto" className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700 outline-none" />
              <div className="flex gap-2">
                <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700 flex-1">
                  {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
                </select>
                <select value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value }))} className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700 flex-1">
                  {['urgent', 'high', 'normal', 'low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))} placeholder="Mensaje..." rows={4} className="bg-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 border border-zinc-700 outline-none resize-none flex-1" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setComposing(false)} className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700">Cancelar</button>
                <button onClick={sendMail} className="text-xs px-3 py-1 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/60">Enviar</button>
              </div>
            </div>
          ) : selectedMail ? (
            <div className="p-4 overflow-y-auto h-full">
              <button onClick={() => setSelectedMail(null)} className="text-xs text-zinc-500 hover:text-zinc-300 mb-3 flex items-center gap-1">← Volver</button>
              <div className="text-zinc-100 text-sm font-medium mb-1">{selectedMail.subject}</div>
              <div className="flex gap-3 text-xs text-zinc-500 mb-3">
                <span>De: <span className="text-zinc-300">{selectedMail.from}</span></span>
                <span>Para: <span className="text-zinc-300">{selectedMail.to.join(', ')}</span></span>
                <span className={`ml-auto px-1.5 py-0.5 rounded border text-xs ${PRIORITY_COLORS[selectedMail.priority]}`}>{selectedMail.priority}</span>
              </div>
              <div className="text-zinc-300 text-xs whitespace-pre-wrap leading-relaxed bg-zinc-900/50 rounded p-3 border border-zinc-800">
                {selectedMail.body}
              </div>
              <div className="text-xs text-zinc-700 mt-2">{new Date(selectedMail.timestamp).toLocaleString('es-MX')}</div>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              {inbox.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                  <div className="text-center"><div className="text-3xl mb-2">📭</div>Sin mensajes</div>
                </div>
              ) : inbox.map(mail => (
                <button
                  key={mail.id}
                  onClick={() => { setSelectedMail(mail); markRead(mail.id); }}
                  className={`w-full text-left px-3 py-2 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors ${mail.status === 'unread' ? 'bg-zinc-900/30' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs">{TYPE_ICONS[mail.type] || '💬'}</span>
                    <span className={`text-xs font-medium truncate flex-1 ${mail.status === 'unread' ? 'text-zinc-100' : 'text-zinc-400'}`}>{mail.subject}</span>
                    <span className={`text-xs px-1 rounded border ${PRIORITY_COLORS[mail.priority]}`}>{mail.priority}</span>
                  </div>
                  <div className="text-xs text-zinc-600 truncate">de: {mail.from} · {new Date(mail.timestamp).toLocaleTimeString('es-MX')}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
