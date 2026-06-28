"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import { resolveAction } from "@/lib/synthia-chat";
import { QuickActionChips } from "./QuickActionChips";

interface Message {
  id: string;
  role: "user" | "synthia";
  text: string;
  timestamp: Date;
}

interface Props {
  onClose: () => void;
}

export function SynthiaChatPane({ onClose }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const { tenantId } = useSessionStore();
  const router = useRouter();
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "synthia", text: "¡Hola! ¿En qué te ayudo hoy?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive boardId from current URL so chat works in context of open board
  const boardId = pathname.includes("/kanban/") ? pathname.split("/kanban/")[1]?.split("/")[0] : undefined;

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), timestamp: new Date() };
    setMessages((prev) => {
      // Build history for API from current messages before adding userMsg
      const historyForApi = prev.slice(-6).map((m) => ({
        role: (m.role === "synthia" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
      }));
      // Kick off async work with the snapshot
      (async () => {
        try {
          const { action, reply } = await resolveAction(text.trim(), {
            tenantId: tenantId ?? "",
            locale: locale ?? "es",
            boardId,
            history: historyForApi,
          });
          const synthiaMsg: Message = { id: (Date.now() + 1).toString(), role: "synthia", text: reply, timestamp: new Date() };
          setMessages((m) => [...m, synthiaMsg]);
          setBusy(false);
          if (action.type === "navigate") {
            navigateTimerRef.current = setTimeout(() => { onClose(); router.push(action.path); }, 800);
          }
        } catch {
          setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: "synthia", text: "Error al procesar. Intenta de nuevo.", timestamp: new Date() }]);
          setBusy(false);
        }
      })();
      return [...prev, userMsg];
    });
    setInput("");
    setBusy(true);
  }, [busy, tenantId, locale, boardId, onClose, router]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 199,
        }}
      />

      {/* Pane */}
      <div
        className="chat-pane-enter"
        role="dialog"
        aria-label="SYNTHIA Chat"
        aria-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 40px))",
          height: "min(640px, calc(100vh - 80px))",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--color-accent)", fontSize: 18, fontWeight: 800 }}>◈</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>SYNTHIA</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Asistente de Proyecto</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: "var(--color-muted)",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 6,
              minHeight: "unset",
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              {msg.role === "synthia" && (
                <span style={{ fontSize: 14, color: "var(--color-accent)", flexShrink: 0, marginBottom: 2 }}>◈</span>
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "8px 12px",
                  borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: msg.role === "user" ? "var(--color-accent)" : "var(--color-bg)",
                  border: msg.role === "user" ? "none" : "1px solid var(--color-border)",
                  color: msg.role === "user" ? "#fff" : "var(--color-text)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {busy && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <span style={{ fontSize: 14, color: "var(--color-accent)" }}>◈</span>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "12px 12px 12px 2px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted)",
                  fontSize: 13,
                }}
              >
                …
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        <QuickActionChips onChipClick={(prompt) => send(prompt)} />

        {/* Input */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Escribe o habla con SYNTHIA…"
            aria-label="Mensaje para SYNTHIA"
            style={{
              flex: 1,
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: "var(--color-text)",
              outline: "none",
              height: 40,
              minHeight: "unset",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            aria-label="Enviar mensaje"
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: input.trim() ? "var(--color-accent)" : "var(--color-border)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              cursor: input.trim() ? "pointer" : "default",
              flexShrink: 0,
              minHeight: "unset",
              transition: "background var(--motion-swift)",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
