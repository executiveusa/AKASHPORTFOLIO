"use client";

type Phase = "iniciacion" | "planificacion" | "ejecucion" | "cierre";

interface Props {
  activePhase: Phase;
  onChange: (phase: Phase) => void;
}

const PHASES: Array<{ key: Phase; label: string; color: string; icon: string }> = [
  { key: "iniciacion",    label: "Iniciación",    color: "var(--phase-iniciacion)",    icon: "◉" },
  { key: "planificacion", label: "Planificación", color: "var(--phase-planificacion)", icon: "◎" },
  { key: "ejecucion",     label: "Ejecución",     color: "var(--phase-ejecucion)",     icon: "⬡" },
  { key: "cierre",        label: "Cierre",        color: "var(--phase-cierre)",        icon: "✓" },
];

export function PhaseTabs({ activePhase, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Fases PMBOK"
      style={{
        display: "flex",
        padding: "12px 16px 0",
        gap: 2,
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      {PHASES.map((phase) => {
        const active = phase.key === activePhase;
        return (
          <button
            key={phase.key}
            role="tab"
            aria-selected={active}
            aria-controls={`phase-panel-${phase.key}`}
            onClick={() => onChange(phase.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: active ? `${phase.color}18` : "transparent",
              border: "none",
              borderBottom: active ? `2px solid ${phase.color}` : "2px solid transparent",
              color: active ? phase.color : "var(--color-muted)",
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              borderRadius: "6px 6px 0 0",
              transition: "color var(--motion-swift), background var(--motion-swift)",
              whiteSpace: "nowrap",
              minHeight: "unset",
              height: 40,
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = phase.color;
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "var(--color-muted)";
            }}
          >
            <span style={{ fontSize: 11 }}>{phase.icon}</span>
            {phase.label}
          </button>
        );
      })}
    </div>
  );
}
