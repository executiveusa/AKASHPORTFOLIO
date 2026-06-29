"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/threads/new", icon: "✦", label: "Nueva Tarea" },
  { href: "/threads",     icon: "≡", label: "Hilos" },
  { href: "/agents",      icon: "◎", label: "Agentes" },
  { href: "/projects",    icon: "⊡", label: "Proyectos" },
  { href: "/library",     icon: "⊞", label: "Biblioteca" },
  { href: "/learning",    icon: "◈", label: "Aprendizaje" },
  { href: "/teams",       icon: "⬡", label: "Equipos" },
];

const APP_SHORTCUTS = [
  { href: "/dashboard",  icon: "◈", label: "Dashboard" },
  { href: "/panorama",   icon: "◎", label: "Panorama" },
  { href: "/chat",       icon: "✦", label: "Chat" },
  { href: "/cockpit",    icon: "⊞", label: "Cockpit" },
];

const BOTTOM_NAV = [
  { href: "/integraciones", icon: "⟳", label: "Integraciones" },
  { href: "/settings",      icon: "⚙", label: "Ajustes" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/threads/new" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#fafaf8",
        borderRight: "1px solid #e5e3df",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "0 20px 24px" }}>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#0d0d0d" }}>
          SYNTHIA™
        </span>
        <span style={{ fontSize: 11, color: "#888", display: "block", marginTop: 2 }}>
          3.0 — Sistema Agéntico
        </span>
      </div>

      {/* Primary nav */}
      <nav style={{ flex: 1, padding: "0 8px" }}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: isActive(item.href) ? 600 : 400,
              color: isActive(item.href) ? "#0d0d0d" : "#555",
              background: isActive(item.href) ? "#f0ede8" : "transparent",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* App shortcuts */}
      <div style={{ padding: "0 8px", borderTop: "1px solid #e5e3df", paddingTop: 12, marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px 6px" }}>App</div>
        {APP_SHORTCUTS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 12px",
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: "none",
              fontSize: 12,
              color: "#666",
              background: "transparent",
            }}
          >
            <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ padding: "0 8px", borderTop: "1px solid #e5e3df", paddingTop: 12 }}>
        {BOTTOM_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: "none",
              fontSize: 13,
              color: isActive(item.href) ? "#0d0d0d" : "#555",
              background: isActive(item.href) ? "#f0ede8" : "transparent",
            }}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
