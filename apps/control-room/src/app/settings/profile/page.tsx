"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 24 }}>Perfil</h1>

      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ fontSize: 13, color: "#555" }}>
          Nombre completo
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }}
          />
        </label>

        <button
          onClick={save}
          style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
        >
          {saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>
    </AppShell>
  );
}
