"use client";

const MODES = [
  {
    id: "plan",
    label: "Plan",
    icon: "🗺️",
    desc: "Synthia te muestra el plan antes de ejecutar",
    color: "#6366f1",
  },
  {
    id: "auto",
    label: "Auto",
    icon: "⚡",
    desc: "Ejecución autónoma sin interrupciones",
    color: "#22c55e",
  },
  {
    id: "ask",
    label: "Preguntar",
    icon: "🤝",
    desc: "Synthia pregunta antes de usar herramientas",
    color: "#f59e0b",
  },
  {
    id: "admin",
    label: "Kernel Admin",
    icon: "🔐",
    desc: "Acceso completo — solo para administradores",
    color: "#ef4444",
  },
];

interface ExecutionModePickerProps {
  value: string;
  onChange: (mode: string) => void;
}

export function ExecutionModePicker({ value, onChange }: ExecutionModePickerProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {MODES.map(m => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            title={m.desc}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 14px", borderRadius: 8, border: "2px solid",
              borderColor: active ? m.color : "#e5e3df",
              background: active ? `${m.color}12` : "#fff",
              cursor: "pointer", minWidth: 72,
            }}
          >
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 400,
              color: active ? m.color : "#888",
            }}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
