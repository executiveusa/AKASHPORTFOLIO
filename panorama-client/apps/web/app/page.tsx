"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

type View = "login" | "check-email";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setView("check-email");
    }
  }

  if (view === "check-email") {
    return (
      <div style={centered}>
        <Logo />
        <div style={card}>
          <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>✉️</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            Revisa tu correo
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-muted)", textAlign: "center", lineHeight: 1.6 }}>
            Enviamos un enlace de acceso a <strong>{email}</strong>.
            <br />
            Haz clic en el enlace para ingresar a El Panorama.
          </p>
          <button
            onClick={() => setView("login")}
            style={{ marginTop: 20, width: "100%", padding: "10px", background: "none", border: "1px solid var(--color-border)", color: "var(--color-muted)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
          >
            ← Usar otro correo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={centered}>
      <Logo />
      <div style={card}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
          El Panorama™
        </h1>
        <p style={{ fontSize: 12, color: "var(--color-muted)", textAlign: "center", marginBottom: 24 }}>
          Portal de proyectos · Kupuri Media
        </p>

        <form onSubmit={sendMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoFocus
              style={{
                width: "100%",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                borderRadius: 8,
                padding: "11px 14px",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", padding: "8px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 6 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              width: "100%",
              padding: "12px",
              background: email.trim() ? "var(--color-accent)" : "var(--color-border)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: email.trim() ? "pointer" : "default",
              transition: "background 200ms",
            }}
          >
            {loading ? "Enviando…" : "Enviar enlace de acceso"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 11, color: "var(--color-muted)", textAlign: "center" }}>
          Sin contraseña · Enlace seguro por correo
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>◈</div>
      <div style={{ fontSize: 11, color: "var(--color-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        SYNTHIA™ · Kupuri Media
      </div>
    </div>
  );
}

const centered: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--color-bg)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "28px 24px",
};
