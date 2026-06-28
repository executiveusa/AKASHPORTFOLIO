"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { useSessionStore } from "@/lib/session-store";
import type { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function MessagesPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("messages");
  const { tenantId, loadProfile } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenantId) loadProfile();
    loadMessages();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at");
    setMessages(data ?? []);
  }

  function subscribeToMessages() {
    const supabase = createClient();
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSending(false); return; }

    const tid = tenantId ?? "";
    await supabase.from("messages").insert({
      sender_id: user.user.id,
      body: body.trim(),
      original_lang: locale as "en" | "es",
      tenant_id: tid,
      thread_id: tid,
      pending_translation: locale !== "en",
    });
    setBody("");
    setSending(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontWeight: 700, fontSize: 15 }}>
        {locale === "es" ? "Mensajes" : "Messages"}
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg) => {
          const displayBody = locale === "es"
            ? (msg.body_translated ?? msg.body)
            : msg.body;
          const wasTranslated = msg.body_translated && locale !== msg.original_lang;

          return (
            <div key={msg.id} style={{ maxWidth: "80%", alignSelf: "flex-start" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>{displayBody}</p>
                {msg.pending_translation && (
                  <p style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>{t("pendingTranslation")}</p>
                )}
                {wasTranslated && !msg.pending_translation && (
                  <p style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>{t("autoTranslated")}</p>
                )}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 2, paddingLeft: 4 }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={t("placeholder")}
          style={{ flex: 1, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          style={{ padding: "10px 16px", background: body.trim() ? "var(--color-accent)" : "var(--color-border)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
