"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Presence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export function PresenceBar({ boardId }: { boardId: string }) {
  const [presences, setPresences] = useState<Presence[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`board-presence:${boardId}`, {
      config: { presence: { key: boardId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Presence>();
        const all = Object.values(state).flat();
        setPresences(all);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId: "current", displayName: "Me" });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [boardId]);

  if (presences.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 6, padding: "6px 16px", borderBottom: "1px solid var(--color-border)", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--color-muted)" }}>Viendo ahora:</span>
      <div style={{ display: "flex", gap: 4 }}>
        {presences.slice(0, 5).map((p, i) => (
          <div
            key={i}
            title={p.displayName}
            style={{
              width: 24, height: 24, borderRadius: "50%",
              background: p.avatarUrl ? "transparent" : "var(--color-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",
              backgroundImage: p.avatarUrl ? `url(${p.avatarUrl})` : undefined,
              backgroundSize: "cover",
            }}
          >
            {!p.avatarUrl && p.displayName.charAt(0).toUpperCase()}
          </div>
        ))}
        {presences.length > 5 && (
          <span style={{ fontSize: 11, color: "var(--color-muted)", paddingLeft: 4 }}>+{presences.length - 5}</span>
        )}
      </div>
    </div>
  );
}
