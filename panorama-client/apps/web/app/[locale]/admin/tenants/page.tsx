"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: 6,
  padding: "9px 12px",
  fontSize: 13,
  boxSizing: "border-box",
};

export default function TenantsAdminPage() {
  const { locale } = useParams<{ locale: string }>();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", owner_email: "", locale_default: "es" });
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadTenants(); }, []);

  async function loadTenants() {
    const supabase = createClient();
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    setTenants(data ?? []);
    setLoading(false);
  }

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_PANORAMA_API_URL;
    const res = await fetch(`${apiUrl}/api/v1/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("✅ Tenant creado");
      setShowForm(false);
      setForm({ name: "", slug: "", owner_email: "", locale_default: "es" });
      loadTenants();
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg(`❌ ${err.error ?? "Error al crear"}`);
    }
  }

  async function sendInvite(tenantId: string) {
    const email = inviteEmail[tenantId];
    if (!email?.trim()) return;
    const apiUrl = process.env.NEXT_PUBLIC_PANORAMA_API_URL;
    const res = await fetch(`${apiUrl}/api/v1/tenants/${tenantId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setMsg(`✅ Invitación enviada a ${email}`);
      setInviteEmail((prev) => ({ ...prev, [tenantId]: "" }));
    } else {
      setMsg("❌ Error al enviar invitación");
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)" }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Gestión de Tenants</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Solo propietarios y PMs</div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 14px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + Nuevo cliente
        </button>
      </header>

      {msg && (
        <div style={{ padding: "10px 16px", fontSize: 13, color: msg.startsWith("✅") ? "#10b981" : "#ef4444", borderBottom: "1px solid var(--color-border)" }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ marginLeft: 10, background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}>✕</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={createTenant} style={{ padding: 16, borderBottom: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Nombre *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Slug * (solo letras-y-guiones)</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} required pattern="[a-z0-9-]+" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Email del propietario *</label>
              <input type="email" value={form.owner_email} onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))} required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Idioma por defecto</label>
              <select value={form.locale_default} onChange={(e) => setForm((f) => ({ ...f, locale_default: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{ padding: "9px 18px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Creando…" : "Crear tenant"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 14px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <main style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: "var(--color-muted)" }}>Cargando…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tenants.map((t) => (
              <div key={t.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--color-border)", color: "var(--color-muted)", borderRadius: 4 }}>{t.slug}</span>
                  <span style={{ fontSize: 11, color: "var(--color-muted)", marginLeft: "auto" }}>{t.locale_default.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 10 }}>{t.owner_email}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={inviteEmail[t.id] ?? ""}
                    onChange={(e) => setInviteEmail((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    placeholder="cliente@empresa.com"
                    type="email"
                    style={{ ...inputStyle, flex: 1, padding: "7px 10px" }}
                  />
                  <button
                    onClick={() => sendInvite(t.id)}
                    style={{ padding: "7px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Invitar
                  </button>
                </div>
              </div>
            ))}
            {tenants.length === 0 && (
              <p style={{ color: "var(--color-muted)", textAlign: "center", padding: "40px 0" }}>Sin tenants. Crea el primero.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
