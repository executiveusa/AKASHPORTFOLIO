"use client";

import { useState } from "react";

interface BrandDNA {
  url: string;
  companyName: string;
  industry: string;
  colors: string[];
  tone: string;
  targetAudience: string;
  keyMessages: string[];
  campaignAngles: string[];
  platforms: string[];
}

interface Prospect {
  id: string;
  companyName: string;
  url: string;
  industry: string;
  estimatedRevenue: string;
  fitScore: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "closed";
  note?: string;
}

const demoProspects: Prospect[] = [
  { id: "p1", companyName: "Restaurante La Buena Vida", url: "labuena.mx", industry: "Restaurantes", estimatedRevenue: "$2,400/mo", fitScore: 94, status: "proposal", note: "Propuesta enviada — esperando aprobación del dueño" },
  { id: "p2", companyName: "Studio Arcana CDMX", url: "arcana.mx", industry: "Wellness & Spa", estimatedRevenue: "$1,800/mo", fitScore: 88, status: "contacted", note: "Llamada agendada para el martes" },
  { id: "p3", companyName: "ModaLatina Shop", url: "modalatina.com", industry: "E-commerce Fashion", estimatedRevenue: "$3,200/mo", fitScore: 91, status: "qualified" },
  { id: "p4", companyName: "Inmobiliaria Prado", url: "pradoinmuebles.mx", industry: "Real Estate", estimatedRevenue: "$2,800/mo", fitScore: 79, status: "new" },
  { id: "p5", companyName: "Consultoría Nexo", url: "nexo.lat", industry: "Business Consulting", estimatedRevenue: "$4,500/mo", fitScore: 96, status: "closed", note: "Cerrado — $4,500/mo ✓" },
];

const STATUS_LABELS: Record<Prospect["status"], string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  proposal: "Propuesta",
  closed: "Cerrado",
};

const STATUS_COLORS: Record<Prospect["status"], string> = {
  new: "var(--color-cream-400)",
  contacted: "var(--color-status-info)",
  qualified: "var(--color-gold-400)",
  proposal: "var(--color-status-warn)",
  closed: "var(--color-status-ok)",
};

export default function CazadoraPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandDNA | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prospects] = useState<Prospect[]>(demoProspects);
  const [activeTab, setActiveTab] = useState<"pipeline" | "analyze">("pipeline");

  async function analyzeBrand() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.warn('[TODO] migrate: /api/pomelli/analyze');
      throw new Error('Pomelli analyzer migrating to SYNTHIA™ backend');
    } catch {
      // Simulate a result for demo if API is not running
      setResult({
        url: url.trim(),
        companyName: url.replace(/https?:\/\//, "").split(".")[0],
        industry: "Detectando...",
        colors: ["#1a1208", "#f5d78c", "#f5efe4"],
        tone: "Profesional, aspiracional, cercano",
        targetAudience: "Empresarias 30-50 años, LATAM",
        keyMessages: ["Automatización sin esfuerzo", "Resultados medibles", "Soporte 24/7"],
        campaignAngles: ["Caso estudio con ROI real", "Antes/después de implementar IA", "Testimonio del cliente"],
        platforms: ["LinkedIn", "Instagram", "Email"],
      });
    } finally {
      setLoading(false);
    }
  }

  const pipeline = ["new", "contacted", "qualified", "proposal", "closed"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--sphere-cazadora)" }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", margin: 0 }}>
              CAZADORA™
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            Pipeline de prospectos + Análisis de ADN de marca (Open-Pomelli)
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setActiveTab("pipeline")}
            style={{
              padding: "6px 16px", fontSize: 13, fontWeight: activeTab === "pipeline" ? 700 : 400,
              border: `1px solid ${activeTab === "pipeline" ? "var(--color-gold-600)" : "var(--color-charcoal-600)"}`,
              borderRadius: 8,
              background: activeTab === "pipeline" ? "var(--color-charcoal-700)" : "transparent",
              color: activeTab === "pipeline" ? "var(--color-gold-400)" : "var(--color-cream-400)",
              cursor: "pointer",
            }}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab("analyze")}
            style={{
              padding: "6px 16px", fontSize: 13, fontWeight: activeTab === "analyze" ? 700 : 400,
              border: `1px solid ${activeTab === "analyze" ? "var(--color-gold-600)" : "var(--color-charcoal-600)"}`,
              borderRadius: 8,
              background: activeTab === "analyze" ? "var(--color-charcoal-700)" : "transparent",
              color: activeTab === "analyze" ? "var(--color-gold-400)" : "var(--color-cream-400)",
              cursor: "pointer",
            }}
          >
            Analizar Marca
          </button>
        </div>
      </div>

      {activeTab === "pipeline" && (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Pipeline Total", value: "$14,700/mo", sub: "5 prospectos activos" },
              { label: "Fit Score Prom.", value: "89.6", sub: "↑ calificación alta" },
              { label: "Cerrados", value: "$4,500/mo", sub: "1 cliente activo" },
              { label: "Tasa de Cierre", value: "20%", sub: "1 de 5 prospectos" },
            ].map(k => (
              <div key={k.label} className="panel" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-gold-400)", letterSpacing: "-0.02em" }}>{k.value}</div>
                <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Kanban Pipeline */}
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-charcoal-600)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>Pipeline de Ventas</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", gap: 0, minWidth: 900 }}>
                {pipeline.map((stage, si) => {
                  const stageProspects = prospects.filter(p => p.status === stage);
                  return (
                    <div key={stage} style={{
                      flex: 1,
                      borderRight: si < pipeline.length - 1 ? "1px solid var(--color-charcoal-600)" : "none",
                      minWidth: 160,
                    }}>
                      <div style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid var(--color-charcoal-600)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[stage], textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {STATUS_LABELS[stage]}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--color-cream-600)", background: "var(--color-charcoal-700)", borderRadius: 4, padding: "1px 6px" }}>
                          {stageProspects.length}
                        </span>
                      </div>
                      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
                        {stageProspects.map(p => (
                          <div key={p.id} style={{
                            background: "var(--color-charcoal-700)",
                            border: "1px solid var(--color-charcoal-600)",
                            borderRadius: 6, padding: "12px",
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-100)", marginBottom: 4 }}>{p.companyName}</div>
                            <div style={{ fontSize: 11, color: "var(--color-cream-400)", marginBottom: 6 }}>{p.industry}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)" }}>{p.estimatedRevenue}</span>
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: p.fitScore >= 90 ? "var(--color-status-ok)" : p.fitScore >= 80 ? "var(--color-status-warn)" : "var(--color-cream-400)",
                              }}>
                                {p.fitScore}%
                              </span>
                            </div>
                            {p.note && (
                              <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 6, lineHeight: 1.4 }}>{p.note}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "analyze" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Analyze Form */}
          <div className="panel" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: "0 0 6px" }}>
              Extraer ADN de Marca — Open-Pomelli™
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginBottom: 16, lineHeight: 1.5 }}>
              Ingresa la URL de tu prospecto. El agente analizará su identidad visual, tono de voz y genera ángulos de campaña personalizados.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && analyzeBrand()}
                placeholder="https://restaurante.mx"
                style={{
                  flex: 1, padding: "10px 14px", fontSize: 14,
                  background: "var(--color-charcoal-700)",
                  border: "1px solid var(--color-charcoal-600)",
                  borderRadius: 8, color: "var(--color-cream-100)",
                  outline: "none",
                }}
              />
              <button
                onClick={analyzeBrand}
                disabled={loading || !url.trim()}
                style={{
                  padding: "10px 24px", fontSize: 14, fontWeight: 700,
                  background: loading || !url.trim() ? "var(--color-charcoal-600)" : "var(--color-gold-600)",
                  color: loading || !url.trim() ? "var(--color-cream-600)" : "var(--color-charcoal-900)",
                  border: "none", borderRadius: 8, cursor: loading || !url.trim() ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Analizando..." : "Analizar"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--color-status-error)" }}>
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="panel" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-cream-100)", margin: 0 }}>{result.companyName}</h3>
                  <span style={{ fontSize: 12, color: "var(--color-cream-400)" }}>{result.industry}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                  {/* Colors */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Paleta de Marca</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {result.colors.map((c, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 6, background: c, border: "1px solid var(--color-charcoal-600)" }} />
                          <span style={{ fontSize: 10, color: "var(--color-cream-600)", fontFamily: "var(--font-mono)" }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Tono de Voz</div>
                    <p style={{ fontSize: 14, color: "var(--color-cream-200)", lineHeight: 1.5, margin: 0 }}>{result.tone}</p>
                  </div>

                  {/* Audience */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Audiencia Objetivo</div>
                    <p style={{ fontSize: 14, color: "var(--color-cream-200)", lineHeight: 1.5, margin: 0 }}>{result.targetAudience}</p>
                  </div>
                </div>
              </div>

              {/* Campaign Angles */}
              <div className="panel" style={{ padding: "24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                  Ángulos de Campaña Sugeridos
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.campaignAngles.map((angle, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "var(--color-charcoal-700)", borderRadius: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-gold-500)", minWidth: 20 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 14, color: "var(--color-cream-200)" }}>{angle}</span>
                      <button style={{
                        marginLeft: "auto", flexShrink: 0,
                        padding: "4px 12px", fontSize: 12, fontWeight: 600,
                        background: "transparent", border: "1px solid var(--color-charcoal-600)",
                        borderRadius: 6, color: "var(--color-cream-400)", cursor: "pointer",
                      }}>
                        Crear Post
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Messages */}
              <div className="panel" style={{ padding: "24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                  Mensajes Clave
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.keyMessages.map((msg, i) => (
                    <span key={i} style={{
                      padding: "6px 14px", fontSize: 13,
                      background: "var(--color-charcoal-700)",
                      border: "1px solid var(--color-charcoal-600)",
                      borderRadius: 6, color: "var(--color-cream-200)",
                    }}>
                      {msg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
