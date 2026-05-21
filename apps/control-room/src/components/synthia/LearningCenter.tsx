"use client";

import { useEffect, useState } from "react";

interface Memory {
  id: string;
  memory_type: string;
  content: string;
  source: string;
  accepted?: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  fact:       "Hecho",
  preference: "Preferencia",
  skill:      "Habilidad",
  rubric:     "Rúbrica",
  suggestion: "Sugerencia",
};

const TYPE_COLOR: Record<string, string> = {
  fact:       "#3b82f6",
  preference: "#8b5cf6",
  skill:      "#22c55e",
  rubric:     "#f59e0b",
  suggestion: "#f43f5e",
};

export function LearningCenter() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<string>("all");

  useEffect(() => {
    fetch("/api/synthia/memory")
      .then(r => r.json())
      .then(d => setMemories(Array.isArray(d.memories) ? d.memories : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const accept = async (id: string) => {
    await fetch("/api/synthia/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, accepted: true }),
    });
    setMemories(m => m.map(x => x.id === id ? { ...x, accepted: true } : x));
  };

  const reject = async (id: string) => {
    await fetch("/api/synthia/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, accepted: false }),
    });
    setMemories(m => m.filter(x => x.id !== id));
  };

  const filtered = filter === "all" ? memories : memories.filter(m => m.memory_type === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {["all", ...Object.keys(TYPE_LABELS)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid",
              borderColor: filter === f ? "#0d0d0d" : "#e5e3df",
              background: filter === f ? "#0d0d0d" : "#fff",
              color: filter === f ? "#fff" : "#555",
              fontSize: 12, cursor: "pointer",
            }}
          >
            {f === "all" ? "Todo" : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando…</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: "32px", background: "#f8f7f5", borderRadius: 10, color: "#888", fontSize: 14, textAlign: "center" }}>
          No hay memorias aún. Synthia aprende con cada tarea que completa.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(m => (
          <div
            key={m.id}
            style={{ padding: "14px 16px", background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, display: "flex", gap: 14 }}
          >
            <div
              style={{
                width: 4, borderRadius: 4, flexShrink: 0,
                background: TYPE_COLOR[m.memory_type] ?? "#94a3b8",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  color: TYPE_COLOR[m.memory_type] ?? "#94a3b8",
                }}>
                  {TYPE_LABELS[m.memory_type] ?? m.memory_type}
                </span>
                <span style={{ fontSize: 11, color: "#bbb" }}>{m.source}</span>
              </div>
              <div style={{ fontSize: 13, color: "#0d0d0d", lineHeight: 1.6 }}>{m.content}</div>
            </div>
            {m.memory_type === "suggestion" && m.accepted === undefined && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <button onClick={() => accept(m.id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 12, cursor: "pointer" }}>Aceptar</button>
                <button onClick={() => reject(m.id)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e3df", background: "#fff", color: "#555", fontSize: 12, cursor: "pointer" }}>Ignorar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
