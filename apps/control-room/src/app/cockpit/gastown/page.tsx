"use client";

import { useState, useEffect } from "react";

interface AgentWorkstream {
  id: string;
  name: string;
  assignedAgent: string;
  agentColor: string;
  status: "active" | "waiting" | "completed" | "failed";
  task: string;
  progress: number;
  startedAt: string;
  output?: string;
  handoffTo?: string;
}

interface MailboxMessage {
  id: string;
  from: string;
  fromColor: string;
  to: string;
  subject: string;
  preview: string;
  timestamp: string;
  type: "handoff" | "report" | "alert" | "sync";
  read: boolean;
}

const demoWorkstreams: AgentWorkstream[] = [
  {
    id: "ws1",
    name: "Expansión México — Restaurantes",
    assignedAgent: "CAZADORA™",
    agentColor: "#ef4444",
    status: "active",
    task: "Prospectando 47 restaurantes en CDMX. Extrayendo datos de contacto y calificando fit.",
    progress: 62,
    startedAt: "14:30",
    handoffTo: "SEDUCTORA™",
  },
  {
    id: "ws2",
    name: "Contenido LinkedIn — España",
    assignedAgent: "DRA. CULTURA™",
    agentColor: "#f43f5e",
    status: "active",
    task: "Generando 5 posts para LinkedIn España. Adaptando tono formal para mercado europeo.",
    progress: 85,
    startedAt: "14:15",
    handoffTo: "FORJADORA™",
  },
  {
    id: "ws3",
    name: "Análisis Financiero Q2",
    assignedAgent: "DR. ECONOMÍA™",
    agentColor: "#f97316",
    status: "waiting",
    task: "Esperando datos de Stripe. Preparando proyección de ingresos Q2-Q3.",
    progress: 30,
    startedAt: "13:45",
  },
  {
    id: "ws4",
    name: "Propuesta — ModaLatina Shop",
    assignedAgent: "SEDUCTORA™",
    agentColor: "#eab308",
    status: "completed",
    task: "Propuesta personalizada generada y enviada. ROI proyectado: 3x en 90 días.",
    progress: 100,
    startedAt: "13:00",
    output: "Propuesta enviada: $3,200/mo — incluye 20 agentes + social media automation.",
  },
  {
    id: "ws5",
    name: "Infraestructura CI/CD",
    assignedAgent: "ING. TEKNOS™",
    agentColor: "#06b6d4",
    status: "completed",
    task: "Pipeline CI/CD optimizado. Deploy a Vercel en 90s. Tests E2E pasando.",
    progress: 100,
    startedAt: "12:00",
    output: "All 23 tests passing. Deploy time: 87s avg.",
  },
  {
    id: "ws6",
    name: "Research — Puerto Rico Market",
    assignedAgent: "ALEX™",
    agentColor: "#d4af37",
    status: "failed",
    task: "Error al acceder a datos de mercado. Reintentando con fuente alternativa.",
    progress: 45,
    startedAt: "14:00",
  },
];

const demoMailbox: MailboxMessage[] = [
  { id: "m1", from: "CAZADORA™", fromColor: "#ef4444", to: "SEDUCTORA™", subject: "Handoff: 3 prospectos calificados", preview: "He calificado 3 restaurantes con fit score >85%. Adjunto datos de contacto y notas de calificación.", timestamp: "14:32", type: "handoff", read: false },
  { id: "m2", from: "DR. ECONOMÍA™", fromColor: "#f97316", to: "SYNTHIA™", subject: "Alerta: Stripe webhook fallido", preview: "El webhook de Stripe no ha respondido en 15 min. Posible impacto en métricas de revenue.", timestamp: "14:20", type: "alert", read: false },
  { id: "m3", from: "DRA. CULTURA™", fromColor: "#f43f5e", to: "FORJADORA™", subject: "Contenido listo para publicación", preview: "5 posts LinkedIn España completados. Adjunto calendario de publicación sugerido.", timestamp: "14:18", type: "handoff", read: true },
  { id: "m4", from: "ING. TEKNOS™", fromColor: "#06b6d4", to: "SYNTHIA™", subject: "Deploy exitoso v1.4.2", preview: "Control room actualizado. Nuevas features: Theater 3D, Gastown view, Pomelli analyzer.", timestamp: "13:55", type: "report", read: true },
  { id: "m5", from: "ALEX™", fromColor: "#d4af37", to: "CONSEJO™", subject: "Estrategia Puerto Rico — revisión", preview: "Propongo retrasar la expansión PR hasta tener 3 clientes en CDMX. Reducir riesgo.", timestamp: "13:40", type: "sync", read: true },
  { id: "m6", from: "SEDUCTORA™", fromColor: "#eab308", to: "DR. ECONOMÍA™", subject: "Propuesta aceptada — ModaLatina", preview: "Confirmado $3,200/mo. Primer pago procesado. Revenue proyectado Q2: +$9,600.", timestamp: "13:05", type: "report", read: true },
];

const TYPE_LABELS: Record<MailboxMessage["type"], string> = {
  handoff: "Handoff",
  report: "Reporte",
  alert: "Alerta",
  sync: "Sync",
};

const TYPE_COLORS: Record<MailboxMessage["type"], string> = {
  handoff: "var(--color-gold-400)",
  report: "var(--color-status-ok)",
  alert: "var(--color-status-error)",
  sync: "var(--color-status-info)",
};

const STATUS_COLORS: Record<AgentWorkstream["status"], string> = {
  active: "var(--color-status-ok)",
  waiting: "var(--color-status-warn)",
  completed: "var(--color-cream-400)",
  failed: "var(--color-status-error)",
};

const STATUS_LABELS: Record<AgentWorkstream["status"], string> = {
  active: "Activo",
  waiting: "Esperando",
  completed: "Completado",
  failed: "Fallido",
};

export default function GastownPage() {
  const [workstreams] = useState<AgentWorkstream[]>(demoWorkstreams);
  const [mailbox, setMailbox] = useState<MailboxMessage[]>(demoMailbox);
  const [filter, setFilter] = useState<"all" | AgentWorkstream["status"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredWs = filter === "all" ? workstreams : workstreams.filter(w => w.status === filter);
  const unreadCount = mailbox.filter(m => !m.read).length;

  function markRead(id: string) {
    setMailbox(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }

  const activeCount = workstreams.filter(w => w.status === "active").length;
  const completedCount = workstreams.filter(w => w.status === "completed").length;
  const failedCount = workstreams.filter(w => w.status === "failed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-gold-400)" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", margin: 0 }}>
            Gastown™ — Orquestación Multi-Agente
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
          Workstreams activos, handoffs y buzón de mensajes inter-agente
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[
          { label: "Workstreams Activos", value: activeCount, color: "var(--color-status-ok)" },
          { label: "Completados Hoy", value: completedCount, color: "var(--color-cream-400)" },
          { label: "Fallos", value: failedCount, color: failedCount > 0 ? "var(--color-status-error)" : "var(--color-cream-400)" },
          { label: "Mensajes sin leer", value: unreadCount, color: unreadCount > 0 ? "var(--color-status-warn)" : "var(--color-cream-400)" },
        ].map(k => (
          <div key={k.label} className="panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: k.color, letterSpacing: "-0.02em" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Workstreams */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>Workstreams</h2>
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "active", "waiting", "completed", "failed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px", fontSize: 11, fontWeight: filter === f ? 700 : 400,
                  background: filter === f ? "var(--color-charcoal-600)" : "transparent",
                  border: `1px solid ${filter === f ? "var(--color-charcoal-500, var(--color-charcoal-600))" : "var(--color-charcoal-600)"}`,
                  borderRadius: 6,
                  color: filter === f ? "var(--color-cream-100)" : "var(--color-cream-400)",
                  cursor: "pointer", textTransform: "capitalize",
                }}
              >
                {f === "all" ? "Todos" : STATUS_LABELS[f as AgentWorkstream["status"]]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredWs.map((ws, i) => (
            <div key={ws.id} style={{ borderBottom: i < filteredWs.length - 1 ? "1px solid var(--color-charcoal-700)" : "none" }}>
              <div
                onClick={() => setExpanded(expanded === ws.id ? null : ws.id)}
                style={{ padding: "16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", cursor: "pointer" }}
              >
                {/* Agent dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ws.agentColor }} />
                </div>

                {/* Main content */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-100)" }}>{ws.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ws.agentColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>{ws.assignedAgent}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-cream-400)", lineHeight: 1.5 }}>{ws.task}</div>

                  {/* Progress bar */}
                  {ws.status !== "waiting" && ws.status !== "failed" && (
                    <div style={{ marginTop: 8, height: 3, background: "var(--color-charcoal-600)", borderRadius: 2, maxWidth: 300 }}>
                      <div style={{
                        width: `${ws.progress}%`, height: "100%",
                        background: ws.status === "completed" ? "var(--color-cream-400)" : "var(--color-gold-600)",
                        borderRadius: 2,
                      }} />
                    </div>
                  )}
                </div>

                {/* Status + time */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[ws.status], textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {STATUS_LABELS[ws.status]}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{ws.startedAt}</span>
                  {ws.handoffTo && ws.status !== "completed" && (
                    <span style={{ fontSize: 10, color: "var(--color-cream-400)" }}>→ {ws.handoffTo}</span>
                  )}
                </div>
              </div>

              {/* Expanded output */}
              {expanded === ws.id && ws.output && (
                <div style={{ padding: "0 16px 16px 40px" }}>
                  <div style={{ padding: "10px 14px", background: "var(--color-charcoal-700)", borderRadius: 6, fontSize: 13, color: "var(--color-cream-200)", lineHeight: 1.6 }}>
                    {ws.output}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent Mailbox */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Buzón Inter-Agente
            {unreadCount > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "var(--color-charcoal-900)", background: "var(--color-gold-400)", borderRadius: 4, padding: "1px 6px" }}>
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {mailbox.map((msg, i) => (
            <div
              key={msg.id}
              onClick={() => markRead(msg.id)}
              style={{
                padding: "14px 16px",
                borderBottom: i < mailbox.length - 1 ? "1px solid var(--color-charcoal-700)" : "none",
                background: msg.read ? "transparent" : "rgba(197,168,76,0.04)",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                alignItems: "start",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: msg.fromColor, marginTop: 5, flexShrink: 0, opacity: msg.read ? 0.4 : 1 }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: msg.read ? "var(--color-cream-400)" : "var(--color-cream-100)" }}>{msg.subject}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TYPE_COLORS[msg.type], textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {TYPE_LABELS[msg.type]}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginBottom: 4 }}>
                  <span style={{ color: msg.fromColor }}>{msg.from}</span> → {msg.to}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-cream-600)", lineHeight: 1.5 }}>
                  {msg.preview.length > 120 ? msg.preview.slice(0, 120) + "…" : msg.preview}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--color-cream-600)", whiteSpace: "nowrap" }}>{msg.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
