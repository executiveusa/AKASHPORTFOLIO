"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Phase } from "./PhaseTabs";

type GateStatus = "pending" | "approved" | "blocked";

interface Props {
  boardId: string;
  phase: Phase;
  status: GateStatus;
  approvedAt?: string | null;
  onStatusChange?: (status: GateStatus) => void;
}

const PHASE_COLORS: Record<Phase, string> = {
  iniciacion:    "var(--phase-iniciacion)",
  planificacion: "var(--phase-planificacion)",
  ejecucion:     "var(--phase-ejecucion)",
  cierre:        "var(--phase-cierre)",
};

const STATUS_CONFIG: Record<GateStatus, { icon: string; label: string; bg: string; color: string }> = {
  pending:  { icon: "⏳", label: "Pendiente de aprobación", bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  approved: { icon: "✓",  label: "Fase aprobada",           bg: "rgba(34,197,94,0.1)",  color: "#22c55e" },
  blocked:  { icon: "🔒", label: "Bloqueado",               bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
};

export function PhaseGate({ boardId, phase, status: initialStatus, approvedAt, onStatusChange }: Props) {
  const [status, setStatus] = useState<GateStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const config = STATUS_CONFIG[status];
  const phaseColor = PHASE_COLORS[phase];

  async function requestApproval() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("phase_gates").upsert(
      { board_id: boardId, phase, status: "pending" },
      { onConflict: "board_id,phase" }
    );
    setLoading(false);
    if (!error) {
      setSent(true);
      onStatusChange?.("pending");
    }
  }

  return (
    <div
      role="status"
      aria-label={`Estado de fase: ${config.label}`}
      style={{
        margin: "0 16px 12px",
        padding: "10px 14px",
        borderRadius: 10,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        position: "relative",
      }}
    >
      <span
        className={status === "approved" ? "check-pop" : undefined}
        style={{ fontSize: 16, color: config.color, flexShrink: 0 }}
      >
        {config.icon}
      </span>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: config.color }}>{config.label}</div>
        {approvedAt && status === "approved" && (
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>
            {new Date(approvedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Left phase accent line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: phaseColor,
          borderRadius: "3px 0 0 3px",
        }}
      />

      {status === "pending" && (
        sent ? (
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Solicitud enviada ✓</span>
        ) : (
          <button
            onClick={requestApproval}
            disabled={loading}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: "var(--color-accent)",
              border: "none",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              whiteSpace: "nowrap",
              minHeight: "unset",
              height: 32,
            }}
          >
            {loading ? "…" : "Solicitar aprobación"}
          </button>
        )
      )}
    </div>
  );
}
