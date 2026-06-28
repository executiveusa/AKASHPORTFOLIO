"use client";

import { usePathname } from "next/navigation";

interface Chip {
  label: string;
  prompt: string;
  icon: string;
}

const CHIPS_BY_PATH: Record<string, Chip[]> = {
  kanban: [
    { label: "Crear tarea", prompt: "Crear una tarea nueva en el tablero", icon: "＋" },
    { label: "Mover tarea", prompt: "Mover una tarea a otra columna", icon: "→" },
    { label: "Ver bloqueadas", prompt: "¿Qué tareas están bloqueadas?", icon: "⚠" },
  ],
  issues: [
    { label: "Reportar issue", prompt: "Reportar un issue nuevo", icon: "⚑" },
    { label: "Ver críticos", prompt: "Mostrar issues críticos abiertos", icon: "🔴" },
    { label: "Cerrar issue", prompt: "Cerrar un issue con resolución", icon: "✓" },
  ],
  goals: [
    { label: "Crear meta", prompt: "Crear una nueva meta o hito", icon: "◎" },
    { label: "Ver progreso", prompt: "¿Cómo van las metas activas?", icon: "%" },
    { label: "Meta en riesgo", prompt: "¿Cuáles metas están en riesgo?", icon: "⚠" },
  ],
  messages: [
    { label: "Resumen", prompt: "Resume los últimos mensajes", icon: "≡" },
    { label: "Mensaje nuevo", prompt: "Redactar un mensaje nuevo", icon: "✉" },
  ],
  contacts: [
    { label: "Buscar contacto", prompt: "Buscar un contacto por nombre", icon: "⊡" },
    { label: "Agregar contacto", prompt: "Agregar un contacto nuevo", icon: "＋" },
  ],
  default: [
    { label: "Crear tarea", prompt: "Crear una tarea nueva", icon: "＋" },
    { label: "Ver issues", prompt: "Mostrar issues abiertos", icon: "⚑" },
    { label: "Ver metas", prompt: "Mostrar metas activas", icon: "◎" },
    { label: "Ir al tablero", prompt: "Abrir el tablero principal", icon: "◎" },
  ],
};

interface Props {
  onChipClick: (prompt: string) => void;
}

export function QuickActionChips({ onChipClick }: Props) {
  const pathname = usePathname();

  function getChips(): Chip[] {
    if (pathname.includes("/kanban")) return CHIPS_BY_PATH.kanban;
    if (pathname.includes("/issues")) return CHIPS_BY_PATH.issues;
    if (pathname.includes("/goals")) return CHIPS_BY_PATH.goals;
    if (pathname.includes("/messages")) return CHIPS_BY_PATH.messages;
    if (pathname.includes("/contacts")) return CHIPS_BY_PATH.contacts;
    return CHIPS_BY_PATH.default;
  }

  const chips = getChips();

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "8px 12px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onChipClick(chip.prompt)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--color-text)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            height: 32,
            flexShrink: 0,
            transition: "border-color var(--motion-swift)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
        >
          <span style={{ fontSize: 11 }}>{chip.icon}</span>
          {chip.label}
        </button>
      ))}
    </div>
  );
}
