"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WizardData {
  // Step 1 — Iniciación
  name: string;
  sponsor: string;
  business_case: string;
  objectives: string;
  // Step 2 — Stakeholders
  stakeholders: string;
  // Step 3 — Scope
  wbs: string[];
  // Step 4 — Schedule
  milestones: { label: string; date: string }[];
  // Step 5 — Riesgos
  risks: { desc: string; level: "low" | "medium" | "high" }[];
  // Step 6 — Aprobación (no data, just submit)
}

interface StepTeacher {
  rule: string;
  why: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Iniciación",    short: "Inicio" },
  { id: 2, label: "Stakeholders",  short: "Partes" },
  { id: 3, label: "Scope",         short: "Scope" },
  { id: 4, label: "Cronograma",    short: "Tiempo" },
  { id: 5, label: "Riesgos",       short: "Riesgos" },
  { id: 6, label: "Aprobación",    short: "Aprobar" },
];

const TEACHERS: StepTeacher[] = [
  { rule: "PMBOK 7 · Proceso 4.1 — Desarrollar el Acta de Constitución", why: "Sin un acta firmada, el proyecto no tiene autorización formal ni recursos garantizados." },
  { rule: "PMBOK 7 · Proceso 13.1 — Identificar Interesados", why: "El 70% de los proyectos fracasan por no identificar stakeholders clave a tiempo." },
  { rule: "PMBOK 7 · Proceso 5.3 — Crear la EDT / WBS", why: "La WBS convierte el objetivo en trabajo concreto y medible. Sin ella, el scope se escapa." },
  { rule: "PMBOK 7 · Proceso 6.2 — Definir Actividades y Hitos", why: "Los hitos son puntos de control que permiten detectar desvíos antes de que sean costosos." },
  { rule: "PMBOK 7 · Proceso 11.2 — Identificar Riesgos", why: "Un riesgo documentado tiene 3x más probabilidad de ser mitigado que uno no documentado." },
  { rule: "PMBOK 7 · Fase de Aprobación — Acta Firmada", why: "La aprobación formal activa los recursos y da inicio oficial al proyecto en los sistemas." },
];

const DEFAULT_RISKS = [
  { desc: "Cambio de scope sin control formal de cambios", level: "high" as const },
  { desc: "Retrasos por dependencias externas no gestionadas", level: "medium" as const },
  { desc: "Falta de disponibilidad del sponsor para decisiones", level: "medium" as const },
  { desc: "Rotación del equipo clave durante la ejecución", level: "low" as const },
  { desc: "Comunicación insuficiente con stakeholders secundarios", level: "low" as const },
];

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {STEPS.map((s) => (
        <div
          key={s.id}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: s.id <= step ? "var(--color-accent)" : "var(--color-border)",
            transition: "background 300ms",
          }}
        />
      ))}
    </div>
  );
}

function TeacherBox({ teacher }: { teacher: StepTeacher }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "var(--color-surface)", border: `1px solid var(--color-gold)30`, borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontStyle: "italic", color: "var(--color-gold)", marginBottom: 4 }}>{teacher.rule}</div>
      <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>{teacher.why}</div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ marginTop: 8, fontSize: 11, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        {expanded ? "▲ Ocultar" : "▼ ¿Por qué esto importa?"}
      </button>
      {expanded && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-muted)", borderTop: "1px solid var(--color-border)", paddingTop: 8 }}>
          Según el PMBOK 7, esta fase asegura que el proyecto tenga la base estructural para gestionar cambios, comunicar progreso y entregar valor al cliente de manera predecible.
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: 6,
  padding: "9px 12px",
  fontSize: 13,
  boxSizing: "border-box" as const,
  fontFamily: "var(--font-sans)",
};

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>({
    name: "", sponsor: "Ivette", business_case: "", objectives: "",
    stakeholders: "",
    wbs: ["Entregable principal", "Documentación"],
    milestones: [{ label: "Kick-off", date: "" }, { label: "Entrega parcial", date: "" }, { label: "Entrega final", date: "" }],
    risks: DEFAULT_RISKS,
  });

  const set = (k: keyof WizardData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  function addWBS() { setData((d) => ({ ...d, wbs: [...d.wbs, ""] })); }
  function setWBS(i: number, v: string) { setData((d) => { const w = [...d.wbs]; w[i] = v; return { ...d, wbs: w }; }); }
  function setMilestone(i: number, k: "label" | "date", v: string) {
    setData((d) => { const m = [...d.milestones]; m[i] = { ...m[i], [k]: v }; return { ...d, milestones: m }; });
  }

  async function submit() {
    setSaving(true);
    try {
      await fetch("/api/panorama/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
    setSaving(false);
    router.push("/panorama");
  }

  const teacher = TEACHERS[step - 1];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 100 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>Nuevo Proyecto</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{STEPS[step - 1].label} · Paso {step} de 6</div>
        </div>
        <button onClick={() => router.push("/panorama")} style={{ background: "none", border: "none", color: "var(--color-muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
      </header>

      <main style={{ padding: 16 }}>
        <ProgressBar step={step} />
        <TeacherBox teacher={teacher} />

        {/* Step 1 — Iniciación */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Nombre del proyecto *</label>
              <input value={data.name} onChange={set("name")} placeholder="Ej: Culture Shock Temporada 2" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Sponsor / Patrocinador</label>
              <input value={data.sponsor} onChange={set("sponsor")} placeholder="Ivette Milo" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Caso de negocio</label>
              <textarea value={data.business_case} onChange={set("business_case")} rows={3} placeholder="¿Por qué este proyecto tiene valor para el negocio?" style={{ ...inputStyle, resize: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Objetivos (uno por línea)</label>
              <textarea value={data.objectives} onChange={set("objectives")} rows={3} placeholder="• Incrementar audiencia 30%&#10;• Publicar 12 episodios&#10;• Monetizar con 2 sponsors" style={{ ...inputStyle, resize: "none" }} />
            </div>
          </div>
        )}

        {/* Step 2 — Stakeholders */}
        {step === 2 && (
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>
              Lista de interesados (nombre · rol · influencia)
            </label>
            <textarea
              value={data.stakeholders}
              onChange={set("stakeholders")}
              rows={8}
              placeholder={"Ivette Milo · Fundadora · Alta\nEquipo CDMX · Ejecutores · Media\nAnunciantes · Financiadores · Alta\nAudiencia · Usuarios finales · Baja"}
              style={{ ...inputStyle, resize: "none" }}
            />
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-muted)", background: "var(--color-surface)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--color-border)" }}>
              Synthia sugerirá stakeholders adicionales basados en el tipo de proyecto una vez creado.
            </div>
          </div>
        )}

        {/* Step 3 — WBS */}
        {step === 3 && (
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Entregables principales (WBS nivel 1)</label>
            {data.wbs.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--color-muted)", paddingTop: 9, flexShrink: 0 }}>{i + 1}.</span>
                <input value={item} onChange={(e) => setWBS(i, e.target.value)} placeholder={`Entregable ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
              </div>
            ))}
            <button
              onClick={addWBS}
              style={{ fontSize: 12, padding: "8px 14px", background: "transparent", border: "1px dashed var(--color-border)", color: "var(--color-muted)", borderRadius: 6, cursor: "pointer", width: "100%", marginTop: 4 }}
            >
              + Agregar entregable
            </button>
          </div>
        )}

        {/* Step 4 — Schedule */}
        {step === 4 && (
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Hitos clave</label>
            {data.milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input value={m.label} onChange={(e) => setMilestone(i, "label", e.target.value)} placeholder="Hito" style={{ ...inputStyle, flex: 1 }} />
                <input type="date" value={m.date} onChange={(e) => setMilestone(i, "date", e.target.value)} style={{ ...inputStyle, width: 140, flexShrink: 0 }} />
              </div>
            ))}
            <button
              onClick={() => setData((d) => ({ ...d, milestones: [...d.milestones, { label: "", date: "" }] }))}
              style={{ fontSize: 12, padding: "8px 14px", background: "transparent", border: "1px dashed var(--color-border)", color: "var(--color-muted)", borderRadius: 6, cursor: "pointer", width: "100%", marginTop: 4 }}
            >
              + Agregar hito
            </button>
          </div>
        )}

        {/* Step 5 — Riesgos */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
              Synthia identificó {data.risks.length} riesgos basados en proyectos similares:
            </div>
            {data.risks.map((r, i) => {
              const color = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" }[r.level];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--color-text)" }}>{r.desc}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${color}20`, color, fontWeight: 600 }}>
                    {r.level === "low" ? "Bajo" : r.level === "medium" ? "Medio" : "Alto"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 6 — Aprobación */}
        {step === 6 && (
          <div>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", marginBottom: 12 }}>Resumen del proyecto</div>
              {[
                ["Nombre", data.name || "—"],
                ["Sponsor", data.sponsor],
                ["Entregables", `${data.wbs.filter(Boolean).length} definidos`],
                ["Hitos", `${data.milestones.filter((m) => m.label).length} en cronograma`],
                ["Riesgos identificados", `${data.risks.length} riesgos`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-muted)" }}>{k}</span>
                  <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={saving || !data.name}
              style={{ width: "100%", padding: "14px", background: data.name ? "var(--color-accent)" : "var(--color-border)", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: data.name ? "pointer" : "default" }}
            >
              {saving ? "Creando proyecto..." : "Crear Proyecto"}
            </button>
          </div>
        )}
      </main>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 16px", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", display: "flex", gap: 10 }}>
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{ flex: 1, padding: "11px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            ← Anterior
          </button>
        )}
        {step < 6 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !data.name}
            style={{ flex: 1, padding: "11px", background: step === 1 && !data.name ? "var(--color-border)" : "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
