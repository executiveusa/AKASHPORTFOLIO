"use client";

const RISK_COLOR: Record<string, string> = {
  low:      "#22c55e",
  medium:   "#f59e0b",
  high:     "#ef4444",
  critical: "#7c3aed",
};

const TOOL_ICON: Record<string, string> = {
  "web-search":  "🔍",
  "browser":     "🌐",
  "image-gen":   "🖼️",
  "video-gen":   "🎬",
  "spreadsheet": "📊",
  "email-send":  "✉️",
  "transcribe":  "🎙️",
  "code-exec":   "⚙️",
  "file-read":   "📄",
  "file-write":  "💾",
  "api-call":    "🔗",
  "db-query":    "🗄️",
};

interface ToolActionChipProps {
  toolId: string;
  label: string;
  risk: string;
  running?: boolean;
  done?: boolean;
  onClick?: () => void;
}

export function ToolActionChip({ toolId, label, risk, running, done, onClick }: ToolActionChipProps) {
  const color = RISK_COLOR[risk] ?? "#94a3b8";
  const icon = TOOL_ICON[toolId] ?? "🔧";

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 20,
        border: `1px solid ${color}40`,
        background: done ? `${color}15` : running ? `${color}08` : "#fff",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.2s",
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#0d0d0d", fontWeight: running ? 600 : 400 }}>{label}</span>
      {running && (
        <span style={{ fontSize: 10, color, fontWeight: 700, animation: "pulse 1.5s infinite" }}>●</span>
      )}
      {done && <span style={{ fontSize: 11, color }}>✓</span>}
      <span style={{
        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
        color, letterSpacing: "0.05em",
      }}>
        {risk}
      </span>
    </button>
  );
}
