"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Thread {
  id: string;
  title: string;
  status: string;
  created_at: string;
  cost_usd?: number;
}

const STATUS_COLOR: Record<string, string> = {
  completed: "#22c55e",
  running:   "#f59e0b",
  failed:    "#ef4444",
  pending:   "#94a3b8",
  cancelled: "#94a3b8",
};

export function RecentThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/synthia/thread?limit=5")
      .then(r => r.json())
      .then(data => setThreads(Array.isArray(data.threads) ? data.threads : []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "#999", fontSize: 13 }}>Cargando hilos recientes…</div>;
  }

  if (threads.length === 0) {
    return (
      <div style={{ color: "#999", fontSize: 13, padding: "16px 0" }}>
        Aún no hay hilos. ¡Crea tu primera tarea arriba!
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {threads.map(t => (
        <Link
          key={t.id}
          href={`/thread/${t.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#fff",
            border: "1px solid #e5e3df",
            borderRadius: 8,
            textDecoration: "none",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: STATUS_COLOR[t.status] ?? "#94a3b8",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: "#0d0d0d", fontWeight: 500 }}>
              {t.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {t.cost_usd != null && (
              <span style={{ fontSize: 11, color: "#888" }}>${t.cost_usd.toFixed(2)}</span>
            )}
            <span style={{ fontSize: 11, color: "#bbb" }}>
              {new Date(t.created_at).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
