"use client";

import { AppShell } from "@/components/synthia/AppShell";
import { ThreadComposer } from "@/components/synthia/ThreadComposer";
import { QuickActionChips } from "@/components/synthia/QuickActionChips";
import { FeaturedExamplesGrid } from "@/components/synthia/FeaturedExamplesGrid";
import { AgentPicker } from "@/components/synthia/AgentPicker";
import { ExecutionModePicker } from "@/components/synthia/ExecutionModePicker";
import { useState } from "react";

export default function NewThreadPage() {
  const [agent, setAgent] = useState("synthia");
  const [mode, setMode] = useState("auto");

  return (
    <AppShell>
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0d0d0d", marginBottom: 6 }}>
            Nueva Tarea
          </h1>
          <p style={{ fontSize: 14, color: "#888" }}>
            Dile a Synthia qué necesitas. Coordinará los agentes necesarios automáticamente.
          </p>
        </div>

        {/* Agent + Mode pickers */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Agente
          </div>
          <AgentPicker selected={agent} onSelect={setAgent} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Modo de ejecución
          </div>
          <ExecutionModePicker value={mode} onChange={setMode} />
        </div>

        <ThreadComposer agentId={agent} executionMode={mode} />

        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Acciones rápidas
          </div>
          <QuickActionChips />
        </div>

        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Ejemplos destacados
          </div>
          <FeaturedExamplesGrid />
        </div>
      </div>
    </AppShell>
  );
}
