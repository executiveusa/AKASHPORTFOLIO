"use client";

import { useState } from "react";

interface ReasoningBlockProps {
  summary?: string;
  steps?: string[];
  collapsed?: boolean;
  tokensUsed?: number;
}

export function ReasoningBlock({ summary, steps = [], collapsed = true, tokensUsed }: ReasoningBlockProps) {
  const [open, setOpen] = useState(!collapsed);

  if (!summary && steps.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid #e5e3df",
        borderLeft: "3px solid #6366f1",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "#f8f7ff", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>🧠</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>Razonamiento extendido</span>
          {tokensUsed && (
            <span style={{ fontSize: 10, color: "#94a3b8", background: "#e0e7ff", padding: "2px 7px", borderRadius: 10 }}>
              {tokensUsed.toLocaleString()} tok
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: "#6366f1" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "12px 14px", background: "#fff" }}>
          {summary && (
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: steps.length > 0 ? 10 : 0 }}>
              {summary}
            </div>
          )}
          {steps.length > 0 && (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {steps.map((s, i) => (
                <li key={i} style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 4 }}>
                  {s}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
