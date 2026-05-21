"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

interface Agent {
  id: string;
  name: string;
  description: string;
  theme: string;
  model: string;
  is_active: boolean;
  thread_count?: number;
  created_at: string;
}

const THEME_COLOR: Record<string, string> = {
  crimson:  "#dc2626",
  slate:    "#475569",
  indigo:   "#6366f1",
  rose:     "#f43f5e",
  tropical: "#10b981",
  golden:   "#f59e0b",
};

const BUILT_IN: Agent[] = [
  { id: "synthia",   name: "Synthia",      description: "Coordinadora central de la plataforma",    theme: "indigo",   model: "claude-sonnet-4-6", is_active: true, created_at: "2026-01-01" },
  { id: "alex",      name: "Alex",         description: "Estratega de ventas y proyectos ejecutivos",theme: "crimson",  model: "claude-sonnet-4-6", is_active: true, created_at: "2026-01-01" },
  { id: "cazadora",  name: "Cazadora",     description: "Research e inteligencia de mercado",        theme: "golden",   model: "claude-haiku-4-5",  is_active: true, created_at: "2026-01-01" },
  { id: "forjadora", name: "Forjadora",    description: "Creación de contenido y activos digitales", theme: "tropical", model: "claude-sonnet-4-6", is_active: true, created_at: "2026-01-01" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(BUILT_IN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/synthia/agents")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.agents) && d.agents.length > 0) {
          setAgents([...BUILT_IN, ...d.agents]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Agentes</h1>
          <p style={{ fontSize: 13, color: "#888" }}>Gestiona tus agentes de IA y configura nuevos</p>
        </div>
        <Link
          href="/agents/new"
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: "#0d0d0d", color: "#fff", fontSize: 13,
            fontWeight: 600, textDecoration: "none",
          }}
        >
          + Crear Agente
        </Link>
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando agentes…</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {agents.map(a => {
          const color = THEME_COLOR[a.theme] ?? "#475569";
          return (
            <div
              key={a.id}
              style={{
                padding: "20px", background: "#fff",
                border: "1px solid #e5e3df", borderTop: `3px solid ${color}`,
                borderRadius: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0d0d0d" }}>{a.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                  color: a.is_active ? "#22c55e" : "#94a3b8",
                  background: a.is_active ? "#f0fdf4" : "#f8fafc",
                  padding: "2px 8px", borderRadius: 10,
                }}>
                  {a.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 12 }}>
                {a.description}
              </p>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 14 }}>
                {a.model}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/threads/new?agent=${a.id}`}
                  style={{
                    flex: 1, padding: "7px", borderRadius: 6, border: "none",
                    background: "#0d0d0d", color: "#fff", fontSize: 12,
                    fontWeight: 600, textDecoration: "none", textAlign: "center",
                  }}
                >
                  Nueva tarea
                </Link>
                {a.id !== "synthia" && a.id !== "alex" && a.id !== "cazadora" && a.id !== "forjadora" && (
                  <Link
                    href={`/agents/${a.id}/settings`}
                    style={{
                      padding: "7px 12px", borderRadius: 6, border: "1px solid #e5e3df",
                      background: "#fff", color: "#555", fontSize: 12, textDecoration: "none",
                    }}
                  >
                    ⚙
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
