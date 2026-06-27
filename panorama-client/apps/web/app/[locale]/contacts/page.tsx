"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export default function ContactsPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("contacts").select("*").order("name");
      setContacts(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const kupuri = contacts.filter((c) => c.is_kupuri_staff);
  const client = contacts.filter((c) => !c.is_kupuri_staff);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)" }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{t("directory")}</div>
      </header>
      <main style={{ padding: 16 }}>
        {loading ? <p style={{ color: "var(--color-muted)" }}>Loading...</p> : (
          <>
            <Section title={t("kupuriStaff")} contacts={kupuri} />
            <Section title={t("clientTeam")} contacts={client} />
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, contacts }: { title: string; contacts: Contact[] }) {
  if (contacts.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {contacts.map((c) => (
          <div key={c.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              {c.role && <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{c.role}</div>}
              {c.email && <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{c.email}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
