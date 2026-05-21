"use client";

import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  description: string;
  theme: string;
  is_active: boolean;
}

const THEME_COLOR: Record<string, string> = {
  crimson: "#dc2626",
  slate:   "#475569",
  indigo:  "#6366f1",
  rose:    "#f43f5e",
  tropical:"#10b981",
  golden:  "#f59e0b",
};

const BUILT_IN_AGENTS: Agent[] = [
  { id: "synthia",   name: "Synthia",     description: "Agente de coordinación central",      theme: "indigo",  is_active: true },
  { id: "alex",      name: "Alex",        description: "Especialista en ventas y proyectos",   theme: "crimson", is_active: true },
  { id: "cazadora",  name: "Cazadora",    description: "Research e inteligencia de mercado",   theme: "golden",  is_active: true },
  { id: "forjadora", name: "Forjadora",   description: "Creación de contenido y activos",      theme: "tropical",is_active: true },
];

interface AgentPickerProps {
  selected: string;
  onSelect: (agentId: string) => void;
}

export function AgentPicker({ selected, onSelect }: AgentPickerProps) {
  const [agents, setAgents] = useState<Agent[]>(BUILT_IN_AGENTS);

  useEffect(() => {
    fetch("/api/synthia/agents")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.agents) && d.agents.length > 0) {
          setAgents([...BUILT_IN_AGENTS, ...d.agents.filter((a: Agent) => a.is_active)]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {agents.map(a => {
        const color = THEME_COLOR[a.theme] ?? "#475569";
        const active = selected === a.id;
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            title={a.description}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 8, border: "2px solid",
              borderColor: active ? color : "#e5e3df",
              background: active ? `${color}10` : "#fff",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: color, flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? color : "#555" }}>
              {a.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
