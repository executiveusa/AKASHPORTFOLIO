"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Identidad", "Modelo", "Invocaciones", "Herramientas", "Skills", "Conocimiento"];

const THEMES = [
  { id: "crimson",  label: "Crimson Glow",     color: "#dc2626" },
  { id: "slate",    label: "Slate Coast",       color: "#475569" },
  { id: "indigo",   label: "Indigo Rose",       color: "#6366f1" },
  { id: "rose",     label: "Rose Petal",        color: "#f43f5e" },
  { id: "tropical", label: "Tropical Garden",   color: "#10b981" },
  { id: "golden",   label: "Golden Hour",       color: "#f59e0b" },
];

const MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", desc: "Balance velocidad/calidad" },
  { id: "claude-opus-4-7",   label: "Claude Opus 4.7",   desc: "Máxima capacidad" },
  { id: "claude-haiku-4-5",  label: "Claude Haiku 4.5",  desc: "Ultra rápido y económico" },
];

const TOOLS_LIST = [
  { id: "web-search",   label: "Búsqueda Web",      risk: "low" },
  { id: "browser",      label: "Navegador",          risk: "medium" },
  { id: "image-gen",    label: "Imágenes",           risk: "low" },
  { id: "video-gen",    label: "Video",              risk: "medium" },
  { id: "spreadsheet",  label: "Hojas de Cálculo",   risk: "low" },
  { id: "email-send",   label: "Enviar Correo",      risk: "medium" },
  { id: "transcribe",   label: "Transcribir",        risk: "low" },
  { id: "code-exec",    label: "Ejecutar Código",    risk: "high" },
];

export function AgentCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", description: "", theme: "slate",
    model: "claude-sonnet-4-6", extended_thinking: false,
    budget_per_query: 5,
    invocations: ["thread"] as string[],
    tools: [] as string[],
    system_prompt: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/synthia/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/agents");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Stepper */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => i <= step && setStep(i)}
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: i < step ? "#0d0d0d" : i === step ? "#0d0d0d" : "#e5e3df",
                color: i <= step ? "#fff" : "#999",
                fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
              }}
            >
              {i < step ? "✓" : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div style={{ width: 40, height: 1, background: i < step ? "#0d0d0d" : "#e5e3df" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{STEPS[step]}</div>

      {/* Step 0 — Identity */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ fontSize: 13, color: "#555" }}>
            Nombre del agente
            <input
              value={form.name}
              onChange={e => update("name", e.target.value)}
              placeholder="Ej. Mi Asistente de Ventas"
              style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 14, fontFamily: "inherit" }}
            />
          </label>
          <label style={{ fontSize: 13, color: "#555" }}>
            Descripción
            <textarea
              value={form.description}
              onChange={e => update("description", e.target.value)}
              rows={3}
              placeholder="¿Para qué sirve este agente?"
              style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 14, resize: "none", fontFamily: "inherit" }}
            />
          </label>
          <div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Tema</div>
            <div style={{ display: "flex", gap: 8 }}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => update("theme", t.id)}
                  title={t.label}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", border: form.theme === t.id ? "3px solid #0d0d0d" : "3px solid transparent",
                    background: t.color, cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Model */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => update("model", m.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", border: "2px solid",
                borderColor: form.model === m.id ? "#0d0d0d" : "#e5e3df",
                borderRadius: 10, background: "#fff", cursor: "pointer", textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{m.desc}</div>
              </div>
              {form.model === m.id && <span>✓</span>}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <input type="checkbox" checked={form.extended_thinking} onChange={e => update("extended_thinking", e.target.checked)} />
            <span style={{ fontSize: 13 }}>Habilitar razonamiento extendido</span>
          </div>
        </div>
      )}

      {/* Step 3 — Tools */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TOOLS_LIST.map(t => {
            const active = form.tools.includes(t.id);
            const riskColor = t.risk === "high" ? "#ef4444" : t.risk === "medium" ? "#f59e0b" : "#22c55e";
            return (
              <button
                key={t.id}
                onClick={() => update("tools", active ? form.tools.filter(x => x !== t.id) : [...form.tools, t.id])}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", border: "1px solid",
                  borderColor: active ? "#0d0d0d" : "#e5e3df",
                  borderRadius: 8, background: active ? "#f8f7f5" : "#fff", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{t.label}</span>
                <span style={{ fontSize: 11, color: riskColor, fontWeight: 600, textTransform: "uppercase" }}>{t.risk}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Generic placeholder for steps 2, 4, 5 */}
      {[2, 4, 5].includes(step) && (
        <div style={{ padding: "32px", background: "#f8f7f5", borderRadius: 10, color: "#888", fontSize: 14, textAlign: "center" }}>
          Configuración avanzada — próximamente
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e3df", background: "#fff", fontSize: 13, cursor: step === 0 ? "not-allowed" : "pointer", color: "#555" }}
        >
          Atrás
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {saving ? "Guardando…" : "Crear Agente"}
          </button>
        )}
      </div>
    </div>
  );
}
