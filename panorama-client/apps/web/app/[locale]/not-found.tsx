import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "calc(100vh - 44px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", color: "var(--color-text)", padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: "var(--color-muted)" }}>◈</div>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Página no encontrada</h1>
      <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 24 }}>
        Esta página no existe o fue movida.
      </p>
      <Link href="/es/dashboard" style={{ padding: "10px 20px", background: "var(--color-accent)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        Volver al inicio
      </Link>
    </div>
  );
}
