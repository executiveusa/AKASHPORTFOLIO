"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { IssueTable } from "@/components/issues/IssueTable";
import { IssueForm } from "@/components/issues/IssueForm";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Issue = Database["public"]["Tables"]["issues"]["Row"];

export default function IssuesPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("issues");
  const tc = useTranslations("common");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadIssues(); }, []);

  async function loadIssues() {
    const supabase = createClient();
    const { data } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });
    setIssues(data ?? []);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{t("register")}</div>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "8px 14px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + {t("raise")}
        </button>
      </header>

      <main style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>{tc("loading")}</p>
        ) : issues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 14 }}>{t("noIssues")}</p>
          </div>
        ) : (
          <IssueTable issues={issues} locale={locale as "en" | "es"} onUpdate={loadIssues} />
        )}
      </main>

      {showForm && (
        <IssueForm
          locale={locale as "en" | "es"}
          onClose={() => setShowForm(false)}
          onCreated={loadIssues}
        />
      )}
    </div>
  );
}
