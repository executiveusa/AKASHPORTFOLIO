"use client";
/**
 * AlexChat — ALEX™ text conversation interface
 * Not a chatbot. A strategic partner with a floating sphere presence.
 * Uses the /api/alex endpoint.
 */
import { useState, useRef, useEffect, FormEvent } from "react";

interface Msg {
  role: "user" | "alex";
  text: string;
}

interface Props {
  onClose?: () => void;
  initialMessage?: string;
}

export default function AlexChat({ onClose, initialMessage }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "alex",
      text: initialMessage ??
        "Cuéntame — ¿qué es lo más urgente para Kupuri Media hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/alex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId: "cockpit-user" }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply ?? data.response ?? data.message ?? "…";
      setMessages((prev) => [...prev, { role: "alex", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "alex", text: "Hubo un problema con la conexión. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        right: 24,
        width: 360,
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-charcoal-800)",
        border: "1px solid var(--color-charcoal-600)",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        zIndex: 200,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-charcoal-600)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Sphere indicator */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-gold-400)",
              boxShadow: "0 0 6px var(--color-gold-400)",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-cream-100)",
              fontFamily: "var(--font-display)",
            }}
          >
            ALEX™
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-cream-600)",
              marginLeft: 2,
            }}
          >
            Chief Advisor
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-cream-600)",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
            }}
          >
            {m.role === "alex" && (
              <div
                style={{
                  fontSize: 10,
                  color: "var(--color-gold-400)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                ALEX™
              </div>
            )}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "2px 10px 10px 10px",
                background:
                  m.role === "user"
                    ? "var(--color-charcoal-700)"
                    : "var(--color-charcoal-700)",
                border:
                  m.role === "alex"
                    ? "1px solid var(--color-charcoal-600)"
                    : "none",
                fontSize: 13,
                color: "var(--color-cream-300)",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-gold-400)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              ALEX™
            </div>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "2px 10px 10px 10px",
                border: "1px solid var(--color-charcoal-600)",
                background: "var(--color-charcoal-700)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--color-cream-600)",
                    display: "inline-block",
                    animation: `alexPulse 1s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={send}
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          borderTop: "1px solid var(--color-charcoal-600)",
          flexShrink: 0,
          background: "var(--color-charcoal-800)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Escribe algo…"
          disabled={loading}
          style={{
            flex: 1,
            background: "var(--color-charcoal-700)",
            border: "1px solid var(--color-charcoal-600)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "var(--color-cream-100)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 14px",
            background: "transparent",
            border: "1px solid var(--color-gold-400)",
            borderRadius: 8,
            color: "var(--color-gold-400)",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.4 : 1,
          }}
        >
          →
        </button>
      </form>

      <style>{`
        @keyframes alexPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
