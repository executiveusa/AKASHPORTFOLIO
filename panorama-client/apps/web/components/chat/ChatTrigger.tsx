"use client";

import { useState, useCallback } from "react";
import { SynthiaChatPane } from "./SynthiaChatPane";

export function ChatTrigger() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar SYNTHIA" : "Abrir SYNTHIA Chat"}
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "var(--color-accent)" : "var(--color-surface)",
          border: `2px solid ${open ? "var(--color-accent)" : "var(--color-border)"}`,
          color: open ? "#fff" : "var(--color-accent)",
          fontSize: 22,
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 198,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          transition: "background var(--motion-swift), border-color var(--motion-swift), color var(--motion-swift)",
        }}
      >
        ◈
      </button>

      {open && <SynthiaChatPane onClose={close} />}
    </>
  );
}
