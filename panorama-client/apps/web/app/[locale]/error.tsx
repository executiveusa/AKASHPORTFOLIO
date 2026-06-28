"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", color: "var(--color-text)", padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Algo salió mal</h2>
      <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 24, maxWidth: 320 }}>
        Ocurrió un error inesperado. Intenta de nuevo o recarga la página.
      </p>
      <button
        onClick={reset}
        style={{ padding: "10px 20px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
      >
        Reintentar
      </button>
    </div>
  );
}
