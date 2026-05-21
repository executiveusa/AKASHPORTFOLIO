"use client";

import { useEffect, useState } from "react";

interface Asset {
  id: string;
  type: string;
  title: string;
  url?: string;
  preview_url?: string;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  document: "📄", image: "🖼️", video: "🎬", audio: "🎙️", webpage: "🌐", data: "📊",
};

interface AssetDockProps {
  threadId: string;
}

export function AssetDock({ threadId }: AssetDockProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    fetch(`/api/synthia/assets?thread_id=${threadId}`)
      .then(r => r.json())
      .then(d => setAssets(Array.isArray(d.assets) ? d.assets : []))
      .catch(() => {});
  }, [threadId]);

  if (assets.length === 0) return null;

  return (
    <div
      style={{
        borderTop: "1px solid #e5e3df",
        padding: "16px 0 8px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        Activos generados
      </div>
      {assets.map(a => (
        <div
          key={a.id}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: "#fff", border: "1px solid #e5e3df", borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>{TYPE_ICON[a.type] ?? "📎"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0d0d0d" }}>{a.title}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{a.type}</div>
          </div>
          {a.url && (
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#0d0d0d", textDecoration: "underline" }}
            >
              Abrir
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
