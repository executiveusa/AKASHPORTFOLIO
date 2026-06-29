"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ICM Layer 0 — canonical navigation config, one source of truth
export const APP_MODULES = [
  { href: "/dashboard",  icon: "◈", label: "Inicio",   icm: "dashboard"  },
  { href: "/panorama",   icon: "◎", label: "Panorama", icm: "panorama"   },
  { href: "/chat",       icon: "✦", label: "Synthia",  icm: "chat"       },
  { href: "/casos",      icon: "⬡", label: "Casos",    icm: "casos"      },
  { href: "/cockpit",    icon: "⊞", label: "Cockpit",  icm: "cockpit"    },
] as const;

export type AppModule = (typeof APP_MODULES)[number]["icm"];

function resolveActive(pathname: string): string {
  if (pathname.startsWith("/panorama")) return "/panorama";
  if (pathname.startsWith("/cockpit"))  return "/cockpit";
  if (pathname.startsWith("/chat"))     return "/chat";
  if (pathname.startsWith("/casos"))    return "/casos";
  return "/dashboard";
}

interface UserNavProps {
  variant?: "bottom" | "top";
}

export function UserNav({ variant = "bottom" }: UserNavProps) {
  const pathname = usePathname();
  const active = resolveActive(pathname);

  if (variant === "top") {
    return (
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 48,
          gap: 4,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-accent)", marginRight: 12 }}>
          SYNTHIA™
        </span>
        {APP_MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: active === m.href ? 600 : 400,
              color: active === m.href ? "var(--color-accent)" : "var(--color-muted)",
              background: active === m.href ? "var(--color-bg)" : "transparent",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 13 }}>{m.icon}</span>
            {m.label}
          </Link>
        ))}
      </nav>
    );
  }

  // Default: bottom bar (mobile-first)
  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {APP_MODULES.map((m) => {
        const isActive = active === m.href;
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-label={m.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "10px 4px",
              color: isActive ? "var(--color-accent)" : "var(--color-muted)",
              fontSize: 9,
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              minHeight: 56,
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Back-navigation header for sub-pages (ICM: preserves context layer)
interface SubPageHeaderProps {
  title: string;
  backHref: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function SubPageHeader({ title, backHref, backLabel = "←", action }: SubPageHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: 52,
        gap: 12,
      }}
    >
      <Link
        href={backHref}
        aria-label={`Volver a ${backLabel}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-muted)",
          fontSize: 16,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        {backLabel}
      </Link>
      <span
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: 600,
          color: "var(--color-text)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>
      {action}
    </header>
  );
}
