"use client";

import { AppShell } from "@/components/synthia/AppShell";
import { LearningCenter } from "@/components/synthia/LearningCenter";

export default function LearningPage() {
  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>
          Centro de Aprendizaje
        </h1>
        <p style={{ fontSize: 13, color: "#888" }}>
          Todo lo que Synthia ha aprendido sobre ti, tu equipo y tu negocio.
          Acepta o rechaza sugerencias para moldear su comportamiento.
        </p>
      </div>
      <LearningCenter />
    </AppShell>
  );
}
