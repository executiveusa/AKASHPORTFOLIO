"use client";

import { AppShell } from "@/components/synthia/AppShell";
import { AgentCreationWizard } from "@/components/synthia/AgentCreationWizard";

export default function NewAgentPage() {
  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 6 }}>
          Crear Agente
        </h1>
        <p style={{ fontSize: 13, color: "#888" }}>
          Configura un nuevo agente especializado para tu equipo.
        </p>
      </div>
      <AgentCreationWizard />
    </AppShell>
  );
}
