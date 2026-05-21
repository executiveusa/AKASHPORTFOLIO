"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

interface Thread {
  id: string;
  title: string;
  agent_id: string;
  status: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  active:    "#22c55e",
  completed: "#94a3b8",
  failed:    "#ef4444",
  paused:    "#f59e0b",
};

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/synthia/thread")
      .then(r => r.json())
      .then(d => setThreads(Array.isArray(d.threads) ? d.threads : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filters = ["all", "active", "completed", "failed"];
  const visible = filter === "all" ? threads : threads.filter(t => t.status === filter);

  return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Hilos</h1>
          <p style={{ fontSize: 13, color: "#888" }}>Historial de tareas y conversaciones</p>
        </div>
        <Link
          href="/threads/new"
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: "#0d0d0d", color: "#fff", fontSize: 13,
            fontWeight: 600, textDecoration: "none",
          }}
        >
          + Nueva Tarea
        </Link>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", borderRadius: 20, border: "1px solid",
              borderColor: filter === f ? "#0d0d0d" : "#e5e3df",
              background: filter === f ? "#0d0d0d" : "#fff",
              color: filter === f ? "#fff" : "#555",
              fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            }}
          >
            {f === "all" ? "Todos" : f}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando hilos…</div>}

      {!loading && visible.length === 0 && (
        <div style={{ padding: 40, background: "#f8f7f5", borderRadius: 10, textAlign: "center", color: "#888", fontSize: 14 }}>
          No hay hilos aún.{" "}
          <Link href="/threads/new" style={{ color: "#0d0d0d", fontWeight: 600 }}>
            Crea tu primera tarea →
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map(t => (
          <Link
            key={t.id}
            href={`/thread/${t.id}`}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 18px", background: "#fff",
              border: "1px solid #e5e3df", borderRadius: 10,
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#0d0d0d")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e3df")}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: STATUS_COLOR[t.status] ?? "#94a3b8",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0d0d0d", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.title || "Sin título"}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {t.agent_id} · {t.message_count} mensajes
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>
              {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString("es-MX") : ""}
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
