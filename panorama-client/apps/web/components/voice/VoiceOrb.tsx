"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CommandBubble } from "./CommandBubble";
import { parseVoiceCommand, resolveColumnName, type VoiceIntent } from "@/lib/voice-commands";
import type { BoardData } from "@/app/[locale]/kanban/[boardId]/page";

type VoiceState = "idle" | "listening" | "processing";

const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

interface Props {
  locale: "en" | "es";
  board: BoardData;
  onBoardUpdate: (board: BoardData) => void;
}

export function VoiceOrb({ locale, board, onBoardUpdate }: Props) {
  const t = useTranslations("voice");
  const [state, setState] = useState<VoiceState>("idle");
  const [lastIntent, setLastIntent] = useState<VoiceIntent | null>(null);

  const activate = useCallback(async () => {
    setState("listening");

    try {
      const { Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);

      vapi.on("speech-end", async (transcript: string) => {
        setState("processing");
        const intent = parseVoiceCommand(transcript, locale);
        setLastIntent(intent);

        if (intent.confidence >= 0.7) {
          await executeIntent(intent);
        }

        setState("idle");
        vapi.stop();
      });

      await vapi.start({
        transcriber: { provider: "deepgram", language: locale === "es" ? "es" : "en" },
        voice: { provider: "elevenlabs", voiceId: ELEVENLABS_VOICE_ID },
        model: { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
      });
    } catch {
      setState("idle");
    }
  }, [locale, board]);

  async function executeIntent(intent: VoiceIntent) {
    const apiUrl = process.env.NEXT_PUBLIC_PANORAMA_API_URL;
    if (!apiUrl) return;

    if (intent.action.kind === "move_card") {
      const targetColName = resolveColumnName(intent.action.to_column);
      const targetCol = board.columns.find(
        (c) => c.title_en === targetColName || c.title_es === targetColName
      );
      const matchCard = board.columns
        .flatMap((c) => c.cards)
        .find((c) => c.title.toLowerCase().includes(intent.action.kind === "move_card" ? intent.action.target.toLowerCase() : ""));

      if (matchCard && targetCol) {
        await fetch(`${apiUrl}/api/v1/cards/${matchCard.id}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to_column_id: targetCol.id, position: targetCol.cards.length }),
        });
      }
    }

    if (intent.action.kind === "add_issue") {
      await fetch(`${apiUrl}/api/v1/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board_id: board.id,
          title: intent.action.title,
          severity: intent.action.severity,
        }),
      });
    }
  }

  const label = state === "listening" ? t("listening") : state === "processing" ? t("processing") : t("activate");

  return (
    <>
      {lastIntent && <CommandBubble intent={lastIntent} locale={locale} onDismiss={() => setLastIntent(null)} />}

      <button
        onClick={activate}
        disabled={state !== "idle"}
        aria-label={label}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: state === "listening" ? "#ef4444" : state === "processing" ? "#f59e0b" : "var(--color-accent)",
          border: "none",
          cursor: state === "idle" ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          boxShadow: state === "listening" ? "0 0 0 8px rgba(239,68,68,0.2)" : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "all 300ms",
          animation: state === "listening" ? "pulse 1s infinite" : "none",
          zIndex: 100,
        }}
      >
        {state === "listening" ? "⏹" : state === "processing" ? "⌛" : "🎤"}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
      `}</style>
    </>
  );
}
