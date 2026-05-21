"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ThreadComposerProps {
  placeholder?: string;
  agentId?: string;
  executionMode?: string;
  onSubmit?: (message: string, mode: string) => void;
}

const EXECUTION_MODES = [
  { id: "auto",              label: "Auto",              desc: "Synthia decide" },
  { id: "plan",              label: "Plan primero",      desc: "Revisa el plan antes" },
  { id: "ask_before_tools",  label: "Preguntar",         desc: "Confirma cada acción" },
];

export function ThreadComposer({ placeholder, agentId = "synthia", executionMode, onSubmit }: ThreadComposerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState(executionMode ?? "auto");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) setMessage(decodeURIComponent(prompt));
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      if (onSubmit) {
        onSubmit(message, mode);
      } else {
        const res = await fetch("/api/synthia/thread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, agent_id: agentId, execution_mode: mode }),
        });
        if (res.ok) {
          const data = await res.json();
          const id = data.thread?.id ?? data.thread_id;
          if (id) router.push(`/thread/${id}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e3df",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
        placeholder={placeholder ?? "¿Qué quieres que Synthia haga hoy?"}
        rows={3}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#0d0d0d",
          background: "transparent",
          fontFamily: "inherit",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
        {/* Mode selector */}
        <div style={{ display: "flex", gap: 6 }}>
          {EXECUTION_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.desc}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: mode === m.id ? "#0d0d0d" : "#e5e3df",
                background: mode === m.id ? "#0d0d0d" : "#fff",
                color: mode === m.id ? "#fff" : "#555",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            background: message.trim() ? "#0d0d0d" : "#e5e3df",
            color: message.trim() ? "#fff" : "#999",
            fontSize: 13,
            fontWeight: 600,
            cursor: message.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Iniciando…" : "Iniciar ↵"}
        </button>
      </div>
    </div>
  );
}
