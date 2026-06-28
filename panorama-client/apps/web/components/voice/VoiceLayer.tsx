"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseVoiceCommand } from "@/lib/voice-commands";
import { createClient } from "@/lib/supabase";

type VoiceState = "idle" | "listening" | "processing";

const NAVIGATION_COMMANDS: Record<string, string> = {
  "tablero": "kanban",
  "board": "kanban",
  "issues": "issues",
  "problemas": "issues",
  "metas": "goals",
  "goals": "goals",
  "mensajes": "messages",
  "messages": "messages",
  "contactos": "contacts",
  "contacts": "contacts",
  "inicio": "dashboard",
  "home": "dashboard",
  "voz": "voice",
  "voice": "voice",
};

export function VoiceLayer() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("voice");
  const [state, setState] = useState<VoiceState>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Clear feedback after 3s
  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(id);
  }, [feedback]);

  const activate = useCallback(async () => {
    if (state !== "idle") return;
    setState("listening");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        setState("processing");
        stream.getTracks().forEach((t) => t.stop());

        // Determine context from current path
        const isKanban = pathname.includes("/kanban/");
        const boardId = isKanban ? pathname.split("/kanban/")[1] : null;

        // Try navigation command first (no board needed)
        const transcriptGuess = "placeholder"; // In production: send audio to Whisper/Deepgram

        // For now show feedback that voice was received
        setFeedback(t("processing"));
        setState("idle");
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch {
      setFeedback("Micrófono no disponible");
      setState("idle");
    }
  }, [state, pathname, locale, t]);

  // Don't render on login page
  if (!pathname.includes("/en/") && !pathname.includes("/es/")) return null;

  return (
    <>
      {/* Floating voice button — bottom right, above chat trigger */}
      <button
        onClick={activate}
        aria-label={state === "idle" ? t("activate") : state === "listening" ? t("listening") : t("processing")}
        style={{
          position: "fixed",
          bottom: 96,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: state === "listening" ? "#ef4444" : "var(--color-surface)",
          border: `2px solid ${state === "listening" ? "#ef4444" : "var(--color-border)"}`,
          color: state === "listening" ? "#fff" : "var(--color-muted)",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 90,
          transition: "background var(--motion-swift), border-color var(--motion-swift), color var(--motion-swift)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {state === "listening" ? "◉" : state === "processing" ? "…" : "◎"}
      </button>

      {/* Voice feedback toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 160,
            right: 20,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            color: "var(--color-text)",
            zIndex: 91,
            maxWidth: 260,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {feedback}
        </div>
      )}
    </>
  );
}
