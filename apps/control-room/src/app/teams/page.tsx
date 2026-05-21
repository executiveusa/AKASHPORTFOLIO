"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/synthia/AppShell";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  last_active?: string;
}

const ROLE_COLOR: Record<string, string> = {
  admin:    "#0d0d0d",
  operator: "#6366f1",
  viewer:   "#94a3b8",
};

const ROLE_LABEL: Record<string, string> = {
  admin:    "Admin",
  operator: "Operador",
  viewer:   "Observador",
};

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"operator" | "viewer">("operator");
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  useEffect(() => {
    fetch("/api/synthia/teams")
      .then(r => r.json())
      .then(d => setMembers(Array.isArray(d.members) ? d.members : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await fetch("/api/synthia/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInviteEmail("");
      setInvited(true);
      setTimeout(() => setInvited(false), 3000);
    } finally {
      setInviting(false);
    }
  };

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Equipo</h1>
        <p style={{ fontSize: 13, color: "#888" }}>Gestiona quién tiene acceso a Synthia</p>
      </div>

      {/* Invite */}
      <div style={{ padding: 20, background: "#fff", border: "1px solid #e5e3df", borderRadius: 10, marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", marginBottom: 12 }}>Invitar a alguien</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="correo@empresa.com"
            style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }}
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as "operator" | "viewer")}
            style={{ padding: "9px 12px", border: "1px solid #e5e3df", borderRadius: 8, fontSize: 13, background: "#fff" }}
          >
            <option value="operator">Operador</option>
            <option value="viewer">Observador</option>
          </select>
          <button
            onClick={invite}
            disabled={inviting || !inviteEmail.trim()}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: "#0d0d0d", color: "#fff", fontSize: 13, cursor: "pointer",
            }}
          >
            {inviting ? "Enviando…" : invited ? "✓ Enviado" : "Invitar"}
          </button>
        </div>
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando equipo…</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {members.map(m => (
          <div
            key={m.id}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 18px", background: "#fff",
              border: "1px solid #e5e3df", borderRadius: 10,
            }}
          >
            <div
              style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#555",
              }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d" }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{m.email}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, textTransform: "uppercase",
              color: ROLE_COLOR[m.role],
              background: `${ROLE_COLOR[m.role]}12`,
              padding: "3px 10px", borderRadius: 10,
            }}>
              {ROLE_LABEL[m.role]}
            </span>
            {m.last_active && (
              <span style={{ fontSize: 11, color: "#bbb" }}>
                {new Date(m.last_active).toLocaleDateString("es-MX")}
              </span>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
