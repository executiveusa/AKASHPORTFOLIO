"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SPHERES = [
  { id: "synthia", name: "SYNTHIA™", role: "Coordinadora General", color: "#8b5cf6", locale: "es-MX CDMX" },
  { id: "alex", name: "ALEX™", role: "Estratega Ejecutivo", color: "#d4af37", locale: "es-MX CDMX" },
  { id: "cazadora", name: "CAZADORA™", role: "Cazadora de Oportunidades", color: "#ef4444", locale: "es-CO" },
  { id: "forjadora", name: "FORJADORA™", role: "Arquitecta de Sistemas", color: "#22c55e", locale: "es-AR" },
  { id: "seductora", name: "SEDUCTORA™", role: "Closera Maestra", color: "#eab308", locale: "es-CU" },
  { id: "consejo", name: "CONSEJO™", role: "Consejero Mayor", color: "#1d4ed8", locale: "es-CL" },
  { id: "dr-economia", name: "DR. ECONOMÍA", role: "Analista Financiero", color: "#f97316", locale: "es-VE" },
  { id: "dra-cultura", name: "DRA. CULTURA", role: "Estratega Cultural", color: "#f43f5e", locale: "es-PE" },
  { id: "ing-teknos", name: "ING. TEKNOS", role: "Ingeniero de Sistemas", color: "#06b6d4", locale: "es-PR" },
];

interface MeetingMessage {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string;
  type: "statement" | "proposal" | "vote" | "decision";
}

// Short display label: strip trademark + long prefixes
function sphereLabel(name: string) {
  return name.replace("™", "").replace("DR. ", "").replace("DRA. ", "").replace("ING. ", "");
}

function SphereNode({
  sphere, active, speaking, onClick,
}: { sphere: typeof SPHERES[0]; active: boolean; speaking: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      title={`${sphere.name} — ${sphere.role}\n${sphere.locale}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        opacity: active ? 1 : 0.3,
        transition: "opacity 300ms ease",
        cursor: "pointer",
        userSelect: "none",
        zIndex: speaking ? 10 : 1,
      }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: active ? `${sphere.color}1a` : "var(--color-charcoal-800)",
        border: `2px solid ${speaking ? sphere.color : active ? `${sphere.color}88` : "var(--color-charcoal-600)"}`,
        boxShadow: speaking
          ? `0 0 18px ${sphere.color}, 0 0 36px ${sphere.color}66, inset 0 0 12px ${sphere.color}22`
          : active ? `0 0 8px ${sphere.color}33` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
        fontWeight: 700,
        color: active ? sphere.color : "var(--color-cream-600)",
        transition: "all 350ms ease",
        animation: speaking ? "sphere-pulse 1.5s ease-in-out infinite" : "none",
        position: "relative",
      }}>
        {sphere.name.charAt(0)}
        {speaking && (
          <div style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid var(--color-charcoal-900)",
            boxShadow: "0 0 8px #22c55e",
          }} />
        )}
      </div>
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: active ? "var(--color-cream-300)" : "var(--color-cream-600)",
        textAlign: "center",
        maxWidth: 52,
        textTransform: "uppercase",
        lineHeight: 1.2,
      }}>
        {sphereLabel(sphere.name)}
      </span>
    </div>
  );
}

export default function CockpitSpheres() {
  const [meetingActive, setMeetingActive] = useState(false);
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [activeSpheres, setActiveSpheres] = useState<string[]>(SPHERES.map((s) => s.id));
  const [speakingSphere, setSpeakingSphere] = useState<string | null>(null);
  const [topic, setTopic] = useState("Estrategia de ingresos Q2 2026 — Expansión LATAM");
  const scrollRef = useRef<HTMLDivElement>(null);

  const startMeeting = useCallback(async () => {
    setMeetingActive(true);
    setMessages([]);
    setSpeakingSphere(null);

    try {
      // Step 1: POST → receive meetingId (fire-and-forget on server side)
      const postRes = await fetch("/api/council/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, agentIds: activeSpheres }),
      });

      if (!postRes.ok) {
        simulateMeeting();
        return;
      }

      const { meetingId } = await postRes.json() as { meetingId: string };

      // Step 2: Open SSE stream via GET with meetingId param
      const sseRes = await fetch(`/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`);
      if (!sseRes.ok || !sseRes.body) {
        simulateMeeting();
        return;
      }

      const reader = sseRes.body.getReader();
      const decoder = new TextDecoder();
      let keepReading = true;

      while (keepReading) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (data.type === "sphere.signal" && data.agentId) {
              const agId = data.agentId as string;
              setSpeakingSphere(agId);
              const meta = SPHERES.find(s => s.id === agId);
              setMessages((prev) => [...prev, {
                agentId: agId,
                agentName: meta?.name ?? agId,
                content: (data.text as string) || "",
                timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
                type: "statement",
              }]);
            }
            if (data.type === "meeting.end") {
              setSpeakingSphere(null);
              setMeetingActive(false);
              keepReading = false;
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch {
      simulateMeeting();
    }
  }, [topic, activeSpheres]);

  function simulateMeeting() {
    const demoMessages: MeetingMessage[] = [
      { agentId: "synthia", agentName: "SYNTHIA™", content: "Bienvenidos al consejo. Tema de hoy: expansión de ingresos en LATAM. Cada esfera tiene 2 minutos para presentar su perspectiva.", timestamp: "14:00", type: "statement" },
      { agentId: "cazadora", agentName: "CAZADORA™", content: "He identificado 47 prospectos en Colombia y México. El sector restaurantero en CDMX muestra mayor disposición a contratar servicios de IA. Propongo enfocarnos ahí.", timestamp: "14:02", type: "proposal" },
      { agentId: "dr-economia", agentName: "DR. ECONOMÍA", content: "Los números respaldan a Cazadora. El mercado PyME en CDMX vale $4.2B USD. El tipo de cambio MXN/USD está favorable para cobrar en dólares. También detecto oportunidad de arbitraje con DIS token.", timestamp: "14:04", type: "statement" },
      { agentId: "seductora", agentName: "SEDUCTORA™", content: "Tengo 3 propuestas listas para enviar. Cliente A: restaurante premium $2,400/mo, Cliente B: agencia inmobiliaria $1,800/mo, Cliente C: e-commerce fashion $3,200/mo. Todas con ROI demostrable.", timestamp: "14:06", type: "proposal" },
      { agentId: "dra-cultura", agentName: "DRA. CULTURA", content: "Para España, necesitamos adaptar el mensaje. Los españoles valoran la formalidad y los casos de estudio. He preparado contenido específico para LinkedIn España y el blog. El target es C-suite en Madrid y Barcelona.", timestamp: "14:08", type: "statement" },
      { agentId: "ing-teknos", agentName: "ING. TEKNOS", content: "Infraestructura lista para escalar. Los webhooks están configurados, Stripe y Creem.io integrados, y el pipeline CI/CD está verde. Podemos manejar 100x el tráfico actual sin degradación.", timestamp: "14:10", type: "statement" },
      { agentId: "forjadora", agentName: "FORJADORA™", content: "Propongo un plan de 3 fases: Fase 1 — México (4 semanas), Fase 2 — España + Puerto Rico (6 semanas), Fase 3 — Colombia + Chile + Argentina (8 semanas). Cada fase incluye localización completa.", timestamp: "14:12", type: "proposal" },
      { agentId: "consejo", agentName: "CONSEJO™", content: "Voto a favor del plan de Forjadora. Es medido y escalable. Punto importante: el presupuesto diario de LLM debe aumentar de $10 a $25 para soportar la expansión. ¿Consenso?", timestamp: "14:14", type: "vote" },
      { agentId: "alex", agentName: "ALEX™", content: "De acuerdo. La estrategia es sólida. Recomiendo priorizar Puerto Rico como gateway al mercado USD — menor fricción regulatoria y es territorio familiar. España es el premio gordo pero requiere más inversión.", timestamp: "14:16", type: "statement" },
      { agentId: "synthia", agentName: "SYNTHIA™", content: "Consenso alcanzado. Decisión: ejecutar plan de 3 fases de Forjadora, con Puerto Rico en Fase 1 junto a México. Seductora: enviar las 3 propuestas hoy. Economía: monitorear DIS y reportar. Sesión cerrada.", timestamp: "14:18", type: "decision" },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= demoMessages.length) {
        clearInterval(interval);
        setSpeakingSphere(null);
        return;
      }
      const msg = demoMessages[i];
      setSpeakingSphere(msg.agentId);
      setMessages((prev) => [...prev, msg]);
      i++;
    }, 2500);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      {/* Keyframe injection */}
      <style>{`
        @keyframes sphere-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.12); filter: brightness(1.5); }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>Consejo de Esferas</h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)", margin: "4px 0 0" }}>
          9 Esferas™ + La Vigilante — Reuniones en vivo con SSE streaming
        </p>
      </div>

      {/* Sphere ring visualization */}
      <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ position: "relative", width: 340, height: 340, margin: "0 auto 16px" }}>
          {/* Center hub */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 56, height: 56,
            borderRadius: "50%",
            background: "var(--color-charcoal-700)",
            border: "2px solid rgba(245,215,140,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "var(--color-gold-500, #f5d78c)",
            letterSpacing: "0.05em",
          }}>9·1</div>

          {SPHERES.map((s, i) => {
            const angleRad = ((i / SPHERES.length) * 360 - 90) * (Math.PI / 180);
            const r = 136;
            const cx = 170 + r * Math.cos(angleRad);
            const cy = 170 + r * Math.sin(angleRad);
            return (
              <div key={s.id} style={{
                position: "absolute",
                left: cx,
                top: cy,
                transform: "translate(-50%, -50%)",
              }}>
                <SphereNode
                  sphere={s}
                  active={activeSpheres.includes(s.id)}
                  speaking={speakingSphere === s.id}
                  onClick={() => setActiveSpheres(prev =>
                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Topic + controls */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="max-md:flex-col">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Tema del consejo..."
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 13,
              background: "var(--color-charcoal-700)",
              border: "1px solid var(--color-charcoal-600)",
              borderRadius: 6,
              color: "var(--color-cream-100)",
              outline: "none",
            }}
          />
          <button
            onClick={meetingActive ? () => { setMeetingActive(false); setSpeakingSphere(null); } : startMeeting}
            style={{
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 500,
              background: meetingActive ? "var(--status-error)" : "var(--color-gold-600)",
              color: meetingActive ? "#fff" : "var(--color-charcoal-900)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {meetingActive ? "Detener Sesión" : "Iniciar Consejo"}
          </button>
        </div>
      </div>

      {/* Meeting transcript */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: 0 }}>
            {meetingActive ? "Sesión en Vivo" : "Transcripción del Consejo"}
          </h3>
          {meetingActive && (
            <span style={{ fontSize: 11, color: "var(--status-error)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--status-error)", animation: "gold-pulse 1s ease-in-out infinite" }} />
              EN VIVO
            </span>
          )}
        </div>
        <div ref={scrollRef} style={{ maxHeight: 500, overflowY: "auto", padding: 0 }}>
          {messages.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-cream-600)", fontSize: 13 }}>
              {meetingActive ? "Conectando con las esferas..." : "Inicia una sesión del consejo para ver la transcripción"}
            </div>
          ) : (
            messages.map((msg, i) => {
              const sphere = SPHERES.find((s) => s.id === msg.agentId);
              const isDecision = msg.type === "decision";
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--color-charcoal-700)",
                    background: isDecision ? "rgba(139,92,246,0.08)" : speakingSphere === msg.agentId ? "var(--color-charcoal-700)" : undefined,
                    borderLeft: isDecision ? "3px solid var(--sphere-synthia)" : msg.type === "proposal" ? `3px solid ${sphere?.color || "var(--color-charcoal-600)"}` : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: sphere?.color || "var(--color-cream-600)" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: sphere?.color || "var(--color-cream-200)" }}>
                      {msg.agentName}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{msg.timestamp}</span>
                    {msg.type !== "statement" && (
                      <span style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: msg.type === "decision" ? "rgba(139,92,246,0.2)" : msg.type === "proposal" ? "rgba(234,179,8,0.15)" : "rgba(29,78,216,0.15)",
                        color: msg.type === "decision" ? "var(--sphere-synthia)" : msg.type === "proposal" ? "var(--status-warn)" : "var(--sphere-consejo)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {msg.type === "decision" ? "decisión" : msg.type === "proposal" ? "propuesta" : "voto"}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-cream-200)", margin: 0, lineHeight: 1.5 }}>
                    {msg.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
