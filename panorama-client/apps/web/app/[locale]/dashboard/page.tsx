"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

export default function DashboardPage() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("boards")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setBoards(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>El Panorama™</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>SYNTHIA™ · PMBOK 7</div>
        </div>
        <LocaleToggle />
      </header>

      <nav style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
        {[
          { href: "dashboard", label: t("dashboard") },
          { href: "issues", label: t("issues") },
          { href: "goals", label: t("goals") },
          { href: "contacts", label: t("contacts") },
          { href: "messages", label: t("messages") },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-muted)", textDecoration: "none", whiteSpace: "nowrap", borderBottom: item.href === "dashboard" ? "2px solid var(--color-accent)" : "2px solid transparent" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main style={{ padding: 16 }}>
        {boards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>Sin proyectos activos</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BoardCard({ board }: { board: Board }) {
  return (
    <Link href={`kanban/${board.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>{board.name}</div>
        {board.description && (
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>{board.description}</div>
        )}
        {board.due_date && (
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
            → {new Date(board.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
}

function LocaleToggle() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <Link href="/es/dashboard" style={{ fontSize: 11, padding: "4px 8px", background: "var(--color-border)", color: "var(--color-text)", borderRadius: 4, textDecoration: "none" }}>ES</Link>
      <Link href="/en/dashboard" style={{ fontSize: 11, padding: "4px 8px", background: "var(--color-border)", color: "var(--color-text)", borderRadius: 4, textDecoration: "none" }}>EN</Link>
    </div>
  );
}
