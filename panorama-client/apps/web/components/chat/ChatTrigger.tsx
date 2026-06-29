"use client";

import { useState, useCallback } from "react";
import { SynthiaChatPane } from "./SynthiaChatPane";

export function ChatTrigger() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <style>{`
        .chat-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
        }
        @media (max-width: 768px) {
          .chat-fab { bottom: 76px; }
        }
      `}</style>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar SYNTHIA" : "Abrir SYNTHIA Chat"}
        aria-expanded={open}
        className="chat-fab"
        style={{
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "background var(--motion-swift), border-color var(--motion-swift), color var(--motion-swift)",
          minHeight: "unset",
        }}
      >
        ◈
      </button>

      {/* Mount once, hide/show to preserve chat history */}
      <div style={{ display: open ? "contents" : "none" }}>
        <SynthiaChatPane onClose={close} />
      </div>
    </>
  );
}
