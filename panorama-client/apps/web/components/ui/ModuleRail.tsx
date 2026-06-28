"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const MODULES = [
  { key: "dashboard", icon: "◈", color: "var(--color-accent)", matchPrefix: "/dashboard" },
  { key: "kanban",    icon: "◎", color: "var(--module-panorama)", matchPrefix: "/kanban" },
  { key: "issues",    icon: "⚑", color: "#ef4444",               matchPrefix: "/issues" },
  { key: "goals",     icon: "◎", color: "var(--module-metrics)",  matchPrefix: "/goals" },
  { key: "messages",  icon: "✉", color: "var(--module-chat)",     matchPrefix: "/messages" },
  { key: "contacts",  icon: "⊡", color: "var(--module-clients)",  matchPrefix: "/contacts" },
  { key: "voice",     icon: "◉", color: "var(--phase-cierre)",    matchPrefix: "/voice" },
] as const;

export function ModuleRail() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("nav");
  const router = useRouter();

  function isActive(prefix: string) {
    return pathname.includes(prefix);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function switchLocale(to: string) {
    return pathname.replace(new RegExp(`^/${locale}(/|$)`), `/${to}$1`);
  }

  const currentLocale = locale as string;

  return (
    <nav
      aria-label="Module navigation"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "var(--rail-width)",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 12,
        zIndex: 100,
        gap: 4,
      }}
    >
      {/* Logo */}
      <Link
        href={`/${currentLocale}/dashboard`}
        aria-label="SYNTHIA home"
        style={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-accent)",
          fontSize: 20,
          fontWeight: 800,
          textDecoration: "none",
          borderRadius: 10,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        ◈
      </Link>

      {/* Module icons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {MODULES.map((mod) => {
          const active = isActive(mod.matchPrefix);
          const href = `/${currentLocale}${mod.matchPrefix === "/kanban" ? "/dashboard" : mod.matchPrefix}`;
          return (
            <Link
              key={mod.key}
              href={href}
              aria-label={t(mod.key as "dashboard")}
              title={t(mod.key as "dashboard")}
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                fontSize: 16,
                color: active ? mod.color : "var(--color-muted)",
                background: active ? `${mod.color}18` : "transparent",
                textDecoration: "none",
                transition: "background var(--motion-swift), color var(--motion-swift)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {mod.icon}
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    background: mod.color,
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom: locale + sign out */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
        <Link
          href={switchLocale(currentLocale === "es" ? "en" : "es")}
          aria-label={currentLocale === "es" ? "Switch to English" : "Cambiar a español"}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-muted)",
            background: "transparent",
            borderRadius: 10,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          {currentLocale === "es" ? "EN" : "ES"}
        </Link>
        <button
          onClick={signOut}
          aria-label={t("signOut")}
          title={t("signOut")}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--color-muted)",
            background: "transparent",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          ↩
        </button>
      </div>
    </nav>
  );
}
