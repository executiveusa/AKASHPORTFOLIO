"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "Operaciones",
    items: [
      { href: "/cockpit", label: "Vista General", icon: "◉" },
      { href: "/cockpit/spheres", label: "Consejo de Esferas", icon: "◎" },
      { href: "/cockpit/fleet", label: "Flota de Agentes", icon: "▣" },
      { href: "/cockpit/theater", label: "Teatro 3D", icon: "△" },
      { href: "/cockpit/salon", label: "Salón de las Esferas™", icon: "◉" },
    ],
  },
  {
    label: "Ingresos",
    items: [
      { href: "/cockpit/revenue", label: "Revenue Agent", icon: "◈" },
      { href: "/cockpit/payments", label: "Pagos", icon: "▤" },
    ],
  },
  {
    label: "Integraciones",
    items: [
      { href: "/cockpit/webhooks", label: "Webhooks", icon: "⟐" },
      { href: "/cockpit/social", label: "Social Media", icon: "◇" },
    ],
  },
];

function BudgetIndicator() {
  return (
    <div className="metric-card" style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: 11, color: "var(--color-cream-400)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Presupuesto hoy
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: "var(--color-gold-400)" }}>$2.40</span>
        <span style={{ fontSize: 12, color: "var(--color-cream-600)" }}>/ $10.00</span>
      </div>
      <div style={{ marginTop: 6, height: 3, background: "var(--color-charcoal-600)", borderRadius: 2 }}>
        <div style={{ width: "24%", height: "100%", background: "var(--status-ok)", borderRadius: 2 }} />
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <span className="status-dot status-dot-ok" />
        <span style={{ color: "var(--color-cream-400)" }}>9 agentes activos</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <span className="status-dot status-dot-ok" />
        <span style={{ color: "var(--color-cream-400)" }}>Supabase conectado</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <span className="status-dot status-dot-ok" />
        <span style={{ color: "var(--color-cream-400)" }}>Vercel deployed</span>
      </div>
    </div>
  );
}

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 248,
          flexShrink: 0,
          background: "var(--color-charcoal-800)",
          borderRight: "1px solid var(--color-charcoal-600)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: mobileOpen ? 0 : undefined,
          bottom: 0,
          zIndex: 50,
          transition: "transform 150ms ease",
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
        className="max-md:hidden"
        data-mobile-open={mobileOpen || undefined}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--color-charcoal-600)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--color-gold-400)", fontFamily: "var(--font-display)" }}>
            SYNTHIA™ 3.0
          </div>
          <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2, letterSpacing: "0.08em" }}>
            SISTEMA OPERATIVO AGÉNTICO
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-cream-600)", padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/cockpit" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                  >
                    <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop: "1px solid var(--color-charcoal-600)" }}>
          <BudgetIndicator />
          <SystemStatus />
        </div>
      </aside>

      {/* Mobile sidebar (shown via data attribute) */}
      <aside
        className="md:hidden"
        style={{
          width: 248,
          flexShrink: 0,
          background: "var(--color-charcoal-800)",
          borderRight: "1px solid var(--color-charcoal-600)",
          display: mobileOpen ? "flex" : "none",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--color-gold-400)", fontFamily: "var(--font-display)" }}>
              SYNTHIA™ 3.0
            </div>
            <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>COCKPIT</div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ color: "var(--color-cream-400)", fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-cream-600)", padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "nav-item-active" : ""}`} onClick={() => setMobileOpen(false)}>
                    <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid var(--color-charcoal-600)" }}>
          <BudgetIndicator />
          <SystemStatus />
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, marginLeft: 248, minWidth: 0 }} className="max-md:ml-0!">
        {/* Top bar */}
        <header style={{
          height: 52,
          borderBottom: "1px solid var(--color-charcoal-600)",
          background: "var(--color-charcoal-800)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ color: "var(--color-cream-200)", fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              ☰
            </button>
            <span style={{ fontSize: 13, color: "var(--color-cream-400)" }}>
              {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-cream-400)" }}>
              <span className="status-dot status-dot-ok" />
              <span>CDMX</span>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--color-charcoal-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--color-gold-400)", fontWeight: 600 }}>
              I
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: 24, maxWidth: 1400 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
