"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface ToolEvent {
  tool_name: string;
  status: string;
  input_summary?: string;
  output_summary?: string;
}

interface ThreadViewProps {
  threadId: string;
  initialMessages?: Message[];
}

const ROLE_STYLE: Record<string, { bg: string; label: string; color: string }> = {
  user:      { bg: "#f0ede8", label: "Tú",      color: "#0d0d0d" },
  assistant: { bg: "#fff",    label: "Synthia",  color: "#0d0d0d" },
  tool:      { bg: "#f8f7f5", label: "Herramienta", color: "#555" },
  system:    { bg: "#fff8ed", label: "Sistema",  color: "#b45309" },
};

export function ThreadView({ threadId, initialMessages = [] }: ThreadViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/synthia/thread/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map(msg => {
          const style = ROLE_STYLE[msg.role] ?? ROLE_STYLE.system;
          return (
            <div key={msg.id} style={{ padding: "14px 18px", background: style.bg, borderRadius: 10, border: "1px solid #e5e3df" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {style.label}
              </div>
              <div style={{ fontSize: 14, color: style.color, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div style={{ padding: "14px 18px", background: "#fff", borderRadius: 10, border: "1px solid #e5e3df" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 6 }}>SYNTHIA</div>
            <div style={{ fontSize: 14, color: "#888" }}>Pensando…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #e5e3df", padding: "16px 0", display: "flex", gap: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Continuar la conversación…"
          style={{
            flex: 1, border: "1px solid #e5e3df", borderRadius: 8,
            padding: "10px 14px", fontSize: 14, outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: input.trim() ? "#0d0d0d" : "#e5e3df",
            color: input.trim() ? "#fff" : "#999",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
