"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  theme: string;
  is_active: boolean;
}

const MODEL_OPTIONS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-8",
];

export default function AgentSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/synthia/agents?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        const found = d.agent ?? d.agents?.find((a: AgentConfig) => a.id === id);
        if (found) setAgent(found);
        else setError("Agente no encontrado");
      })
      .catch(() => setError("Error al cargar agente"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!agent) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/synthia/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          model: agent.model,
          system_prompt: agent.system_prompt,
          is_active: agent.is_active,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ color: "#888", fontSize: 13 }}>Cargando…</div>
      </AppShell>
    );
  }

  if (error && !agent) {
    return (
      <AppShell>
        <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</div>
        <Link href="/agents" style={{ fontSize: 13, color: "#8b5cf6" }}>← Volver a agentes</Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/agents" style={{ fontSize: 20, color: "#888", textDecoration: "none", lineHeight: 1 }}>←</Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 2 }}>
            Ajustes: {agent?.name}
          </h1>
          <p style={{ fontSize: 12, color: "#888" }}>Configura comportamiento, modelo y prompts del agente</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name */}
        <div style={{ background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, padding: "18px 20px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
            Nombre
          </label>
          <input
            value={agent?.name ?? ""}
            onChange={(e) => setAgent((a) => a ? { ...a, name: e.target.value } : a)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 7, fontSize: 14, color: "#0d0d0d", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Description */}
        <div style={{ background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, padding: "18px 20px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
            Descripción
          </label>
          <input
            value={agent?.description ?? ""}
            onChange={(e) => setAgent((a) => a ? { ...a, description: e.target.value } : a)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 7, fontSize: 14, color: "#0d0d0d", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Model */}
        <div style={{ background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, padding: "18px 20px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
            Modelo
          </label>
          <select
            value={agent?.model ?? "claude-sonnet-4-6"}
            onChange={(e) => setAgent((a) => a ? { ...a, model: e.target.value } : a)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 7, fontSize: 14, color: "#0d0d0d", background: "#fff", outline: "none", boxSizing: "border-box" }}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div style={{ background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, padding: "18px 20px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
            Prompt del sistema
          </label>
          <textarea
            value={agent?.system_prompt ?? ""}
            onChange={(e) => setAgent((a) => a ? { ...a, system_prompt: e.target.value } : a)}
            rows={8}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 7, fontSize: 13, color: "#0d0d0d", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.5 }}
          />
        </div>

        {/* Active toggle */}
        <div style={{ background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0d0d0d" }}>Agente activo</div>
            <div style={{ fontSize: 12, color: "#888" }}>Desactiva para suspender sin eliminar</div>
          </div>
          <button
            type="button"
            onClick={() => setAgent((a) => a ? { ...a, is_active: !a.is_active } : a)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
              background: agent?.is_active ? "#22c55e" : "#e5e3df",
              transition: "background 150ms",
              position: "relative",
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: agent?.is_active ? 22 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 150ms",
            }} />
          </button>
        </div>

        {error && <div style={{ fontSize: 13, color: "#ef4444", padding: "10px 14px", background: "#fef2f2", borderRadius: 7 }}>{error}</div>}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 24px", background: saving ? "#888" : "#0d0d0d",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer",
            transition: "background 150ms",
          }}
        >
          {saved ? "✓ Guardado" : saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </AppShell>
  );
}
