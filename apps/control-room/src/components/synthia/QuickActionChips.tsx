"use client";

interface Chip {
  label: string;
  prompt: string;
  icon: string;
}

const DEFAULT_CHIPS: Chip[] = [
  { icon: "📊", label: "Analizar gastos",        prompt: "Analiza mis gastos del mes y dame un resumen ejecutivo con recomendaciones." },
  { icon: "📧", label: "Redactar propuesta",      prompt: "Redacta una propuesta de servicios profesionales para un cliente potencial." },
  { icon: "🎯", label: "Plan de contenido",       prompt: "Crea un plan de contenido para redes sociales para los próximos 30 días." },
  { icon: "🔍", label: "Investigar mercado",      prompt: "Investiga el mercado de [tu industria] en México y dame oportunidades de negocio." },
  { icon: "📋", label: "Crear checklist",         prompt: "Crea un checklist detallado para lanzar un nuevo producto o servicio." },
  { icon: "💬", label: "Responder clientes",      prompt: "Redacta respuestas profesionales para las últimas consultas de clientes." },
];

interface QuickActionChipsProps {
  onSelect: (prompt: string) => void;
}

export function QuickActionChips({ onSelect }: QuickActionChipsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {DEFAULT_CHIPS.map(chip => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.prompt)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 20,
            border: "1px solid #e5e3df",
            background: "#fff",
            color: "#333",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d0d0d"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e3df"; }}
        >
          <span>{chip.icon}</span>
          {chip.label}
        </button>
      ))}
    </div>
  );
}
