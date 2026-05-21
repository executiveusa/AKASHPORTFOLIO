"use client";

import { useState } from "react";

interface SubagentJob {
  id: string;
  agent_name: string;
  task: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
  started_at?: string;
  finished_at?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#94a3b8",
  running: "#f59e0b",
  done:    "#22c55e",
  error:   "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En cola",
  running: "Ejecutando",
  done:    "Completado",
  error:   "Error",
};

interface SubagentDispatchCardProps {
  jobs: SubagentJob[];
}

export function SubagentDispatchCard({ jobs }: SubagentDispatchCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (jobs.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
        Subagentes activos ({jobs.length})
      </div>
      {jobs.map(job => {
        const color = STATUS_COLOR[job.status];
        const isOpen = expanded === job.id;
        return (
          <div
            key={job.id}
            style={{
              border: "1px solid #e5e3df",
              borderLeft: `3px solid ${color}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : job.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", background: "#fff", border: "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                color, background: `${color}15`,
                padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap",
              }}>
                {STATUS_LABEL[job.status]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d" }}>{job.agent_name}</span>
              <span style={{ fontSize: 12, color: "#888", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.task}
              </span>
              <span style={{ fontSize: 11, color: "#bbb" }}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && job.result && (
              <div style={{ padding: "10px 14px", borderTop: "1px solid #e5e3df", background: "#f8f7f5", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                {job.result}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
