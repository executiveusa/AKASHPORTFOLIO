"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  thread_count: number;
  created_at: string;
  color?: string;
}

const STATUS_COLOR: Record<string, string> = {
  active:    "#22c55e",
  completed: "#94a3b8",
  paused:    "#f59e0b",
  archived:  "#e5e3df",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/synthia/projects")
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d.projects) ? d.projects : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/synthia/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (data.project) {
        setProjects(p => [data.project, ...p]);
        setNewName("");
        setNewDesc("");
        setShowNew(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Proyectos</h1>
          <p style={{ fontSize: 13, color: "#888" }}>Organiza tus hilos y tareas por proyecto</p>
        </div>
        <button
          onClick={() => setShowNew(s => !s)}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: "#0d0d0d", color: "#fff", fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          + Nuevo Proyecto
        </button>
      </div>

      {showNew && (
        <div style={{ padding: 20, background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, marginBottom: 20 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nombre del proyecto"
            style={{ display: "block", width: "100%", marginBottom: 10, padding: "9px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }}
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            style={{ display: "block", width: "100%", marginBottom: 12, padding: "9px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 13, resize: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={createProject}
              disabled={saving || !newName.trim()}
              style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, cursor: "pointer" }}
            >
              {saving ? "Guardando…" : "Crear"}
            </button>
            <button
              onClick={() => setShowNew(false)}
              style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid #e5e3df", background: "#fff", color: "#555", fontSize: 13, cursor: "pointer" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando proyectos…</div>}

      {!loading && projects.length === 0 && (
        <div style={{ padding: 40, background: "#f8f7f5", borderRadius: 10, textAlign: "center", color: "#888", fontSize: 14 }}>
          No hay proyectos aún. Crea uno para organizar tus tareas.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {projects.map(p => (
          <Link
            key={p.id}
            href={`/threads?project=${p.id}`}
            style={{
              display: "block", padding: "18px 20px", background: "#fff",
              border: "1px solid #e5e3df", borderRadius: 10, textDecoration: "none",
              borderLeft: `4px solid ${p.color ?? "#0d0d0d"}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#0d0d0d")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e3df")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0d0d0d" }}>{p.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                color: STATUS_COLOR[p.status] ?? "#94a3b8",
              }}>
                {p.status}
              </span>
            </div>
            {p.description && (
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 10 }}>{p.description}</p>
            )}
            <div style={{ fontSize: 11, color: "#bbb" }}>
              {p.thread_count} hilos · {new Date(p.created_at).toLocaleDateString("es-MX")}
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
