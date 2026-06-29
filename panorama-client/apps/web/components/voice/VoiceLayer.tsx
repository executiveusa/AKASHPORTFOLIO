"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/lib/session-store";
import { resolveAction } from "@/lib/synthia-chat";

type VoiceState = "idle" | "listening" | "processing";

// Browser SpeechRecognition type augmentation
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function VoiceLayer() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { tenantId } = useSessionStore();
  const t = useTranslations("voice");
  const [state, setState] = useState<VoiceState>("idle");
  const [liveText, setLiveText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef<string>("");

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(id);
  }, [feedback]);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const activate = useCallback(async () => {
    // Tap while listening → cancel
    if (state === "listening") {
      recognitionRef.current?.abort();
      setState("idle");
      setLiveText(null);
      return;
    }
    if (state !== "idle") return;

    const SR = (window.SpeechRecognition ?? window.webkitSpeechRecognition) as typeof SpeechRecognition | undefined;
    if (!SR) {
      setFeedback(locale === "es" ? "Voz no disponible. Usa Chrome." : "Voice not available. Use Chrome.");
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = locale === "es" ? "es-MX" : "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    finalTextRef.current = "";

    recognition.onstart = () => setState("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalTextRef.current += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      setLiveText(finalTextRef.current || interim);
    };

    recognition.onend = async () => {
      const text = finalTextRef.current.trim();
      finalTextRef.current = "";
      setLiveText(null);

      if (!text) {
        setState("idle");
        return;
      }

      setState("processing");

      const boardId = pathname.includes("/kanban/")
        ? pathname.split("/kanban/")[1]?.split("/")[0]
        : undefined;

      try {
        const { action, reply } = await resolveAction(text, {
          tenantId: tenantId ?? "",
          locale: locale ?? "es",
          boardId,
        });

        setFeedback(reply);

        if (action.type === "navigate") {
          setTimeout(() => router.push(action.path), 1200);
        }
      } catch {
        setFeedback(locale === "es" ? "Error al procesar. Intenta de nuevo." : "Error processing. Try again.");
      }

      setState("idle");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setFeedback(locale === "es" ? "Error de micrófono. Intenta de nuevo." : "Mic error. Try again.");
      }
      setState("idle");
      setLiveText(null);
    };

    recognition.start();
  }, [state, locale, pathname, tenantId, router]);

  // Don't render on login/auth pages
  if (!pathname.includes("/en/") && !pathname.includes("/es/")) return null;

  return (
    <>
      {/* Floating voice button */}
      <button
        onClick={activate}
        aria-label={
          state === "idle"
            ? t("activate")
            : state === "listening"
            ? t("listening")
            : t("processing")
        }
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
          cursor: state === "processing" ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 90,
          transition: "background var(--motion-swift), border-color var(--motion-swift), color var(--motion-swift)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          minHeight: "unset",
        }}
      >
        {state === "listening" ? "◉" : state === "processing" ? "…" : "◎"}
      </button>

      {/* Live transcript bubble — shows partial speech as user speaks */}
      {liveText && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 154,
            right: 20,
            background: "var(--color-surface)",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "var(--color-text)",
            zIndex: 91,
            maxWidth: 260,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            fontStyle: "italic",
          }}
        >
          {liveText}
        </div>
      )}

      {/* Action feedback toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 154,
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
