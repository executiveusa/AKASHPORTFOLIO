"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

export default function DashboardPage() {
  const { locale } = useParams<{ locale: string }>();
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
      <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>El Panorama™</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>
          {locale === "es" ? "Portal de proyectos · Kupuri Media" : "Project portal · Kupuri Media"}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {boards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 14 }}>
              {locale === "es" ? "Sin proyectos activos" : "No active projects"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} locale={locale} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BoardCard({ board, locale }: { board: Board; locale: string }) {
  return (
    <Link href={`/${locale}/kanban/${board.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "14px 16px",
          transition: "border-color 150ms",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>{board.name}</div>
        {board.description && (
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>{board.description}</div>
        )}
        {board.due_date && (
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
            → {new Date(board.due_date).toLocaleDateString()}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-accent)", fontWeight: 600 }}>
          {locale === "es" ? "Abrir tablero →" : "Open board →"}
        </div>
      </div>
    </Link>
  );
}
