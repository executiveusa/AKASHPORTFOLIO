"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/synthia/AppShell";

interface LibraryItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  created_at: string;
  tags?: string[];
}

const TYPE_ICON: Record<string, string> = {
  document: "📄", image: "🖼️", video: "🎬",
  audio: "🎙️", webpage: "🌐", data: "📊",
  template: "📋", code: "⚙️",
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/synthia/assets?scope=library")
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d.assets) ? d.assets : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = ["all", ...Array.from(new Set(items.map(i => i.type)))];
  const visible = items.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Biblioteca</h1>
        <p style={{ fontSize: 13, color: "#888" }}>Todos los activos generados por tus agentes</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar activos…"
          style={{
            flex: 1, padding: "9px 14px", border: "1px solid #e5e3df",
            borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "1px solid",
                borderColor: typeFilter === t ? "#0d0d0d" : "#e5e3df",
                background: typeFilter === t ? "#0d0d0d" : "#fff",
                color: typeFilter === t ? "#fff" : "#555",
                fontSize: 12, cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {t === "all" ? "Todos" : t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando biblioteca…</div>}

      {!loading && visible.length === 0 && (
        <div style={{ padding: 40, background: "#f8f7f5", borderRadius: 10, textAlign: "center", color: "#888", fontSize: 14 }}>
          {search
            ? `No se encontraron activos para "${search}"`
            : "La biblioteca está vacía. Los activos aparecen aquí cuando Synthia los genera."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {visible.map(item => (
          <div
            key={item.id}
            style={{
              padding: "16px", background: "#fff",
              border: "1px solid #e5e3df", borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{TYPE_ICON[item.type] ?? "📎"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", marginBottom: 4 }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 8 }}>
                {item.description}
              </div>
            )}
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                {item.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, padding: "2px 7px", background: "#f0ede8", borderRadius: 10, color: "#555" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#bbb" }}>
              {new Date(item.created_at).toLocaleDateString("es-MX")}
            </div>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", marginTop: 10, fontSize: 12, color: "#0d0d0d", textDecoration: "underline" }}
              >
                Abrir →
              </a>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
