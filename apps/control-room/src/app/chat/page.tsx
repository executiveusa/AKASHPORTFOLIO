"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent_used?: string;
  cost_cents?: number;
  bead_id?: string;
  ts: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

// ─── Components ───────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 10, marginBottom: 14, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff" }}>S</div>
      )}
      <div style={{ maxWidth: "80%" }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            background: isUser ? "var(--color-accent)" : "var(--color-surface)",
            border: isUser ? "none" : "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.content}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 3, justifyContent: isUser ? "flex-end" : "flex-start" }}>
          <span style={{ fontSize: 10, color: "var(--color-muted)" }}>{formatTime(msg.ts)}</span>
          {msg.agent_used && <span style={{ fontSize: 10, color: "var(--color-accent)" }}>· {msg.agent_used}</span>}
          {msg.bead_id && <span style={{ fontSize: 10, color: "var(--color-gold)" }}>· {msg.bead_id}</span>}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700 }}>S</div>
      <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-muted)", display: "inline-block", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hola, soy Synthia. ¿En qué te ayudo hoy? Puedo delegar tareas, analizar proyectos, revisar gastos o responder preguntas sobre tu negocio.",
  ts: Date.now(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Try streaming first
      const res = await fetch("/api/synthia/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply ?? "Entendido. Estoy procesando tu solicitud.",
          agent_used: data.agent_used,
          cost_cents: data.cost_cents,
          bead_id: data.bead_id,
          ts: Date.now(),
        };
        setMessages((m) => [...m, assistantMsg]);
      } else {
        throw new Error("API error");
      }
    } catch {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al conectar con el servidor. Por favor intenta de nuevo.",
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 16 }}>S</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>Synthia</div>
          <div style={{ fontSize: 11, color: "#22c55e" }}>● en línea</div>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m) => <Bubble key={m.id} msg={m} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)", flexShrink: 0, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe en español..."
            rows={1}
            style={{
              flex: 1,
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-sans)",
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: input.trim() && !loading ? "var(--color-accent)" : "var(--color-border)",
              border: "none",
              color: input.trim() && !loading ? "#fff" : "var(--color-muted)",
              fontSize: 18,
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 150ms",
            }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 1; }
          30% { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
