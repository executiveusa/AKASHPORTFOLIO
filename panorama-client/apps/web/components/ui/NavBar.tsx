"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("nav");
  const router = useRouter();

  const base = `/${locale}`;

  const links = [
    { href: `${base}/dashboard`,  label: t("dashboard"), key: "dashboard" },
    { href: `${base}/issues`,     label: t("issues"),    key: "issues" },
    { href: `${base}/goals`,      label: t("goals"),     key: "goals" },
    { href: `${base}/contacts`,   label: t("contacts"),  key: "contacts" },
    { href: `${base}/messages`,   label: t("messages"),  key: "messages" },
    { href: `${base}/voice`,      label: t("voice"),     key: "voice" },
  ];

  function isActive(href: string) {
    // Exact for dashboard, prefix for others
    if (href === `${base}/dashboard`) return pathname === href;
    return pathname.startsWith(href);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {/* Logo */}
      <Link
        href={`${base}/dashboard`}
        aria-label="El Panorama home"
        style={{
          padding: "0 16px",
          height: 44,
          display: "flex",
          alignItems: "center",
          fontSize: 16,
          fontWeight: 800,
          color: "var(--color-accent)",
          textDecoration: "none",
          flexShrink: 0,
          borderRight: "1px solid var(--color-border)",
          letterSpacing: "-0.02em",
        }}
      >
        ◈
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            style={{
              padding: "0 14px",
              height: 44,
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: isActive(link.href) ? 600 : 400,
              color: isActive(link.href) ? "var(--color-text)" : "var(--color-muted)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              borderBottom: isActive(link.href)
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
              transition: "color 150ms, border-color 150ms",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side: locale toggle + sign out */}
      <div style={{ display: "flex", gap: 4, padding: "0 12px", flexShrink: 0, alignItems: "center" }}>
        <Link
          href={pathname.replace(`/${locale}/`, "/es/")}
          aria-label="Español"
          style={{
            fontSize: 11,
            padding: "4px 8px",
            background: locale === "es" ? "var(--color-accent)" : "var(--color-border)",
            color: locale === "es" ? "#fff" : "var(--color-text)",
            borderRadius: 4,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ES
        </Link>
        <Link
          href={pathname.replace(`/${locale}/`, "/en/")}
          aria-label="English"
          style={{
            fontSize: 11,
            padding: "4px 8px",
            background: locale === "en" ? "var(--color-accent)" : "var(--color-border)",
            color: locale === "en" ? "#fff" : "var(--color-text)",
            borderRadius: 4,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          EN
        </Link>
        <button
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          style={{
            marginLeft: 4,
            padding: "4px 8px",
            background: "none",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
            borderRadius: 4,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          ↩
        </button>
      </div>
    </nav>
  );
}
