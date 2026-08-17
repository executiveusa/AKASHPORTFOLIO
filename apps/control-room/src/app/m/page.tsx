"use client";

/**
 * /cockpit/mobile — Ivette's mobile cockpit.
 *
 * Mobile-first agent control surface for SYNTHIA / Kupuri Media.
 * Mexican Spanish (es-MX) primary, English secondary.
 *
 * Design intent: a REAL mobile app, not a shrunk desktop.
 *   - bottom tab bar with animated indicator (touch-first navigation)
 *   - 44px+ touch targets, safe-area insets, pull-to-refresh feel
 *   - single-column, thumb-reachable, no hover dependencies
 *   - wired to real APIs: /api/spheres/status, /api/spheres/chat,
 *     /api/panorama/projects, /api/health
 *
 * Locale: es-MX default; toggle to en in Ajustes.
 */

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import Link from "next/link";

// ─── i18n (es-MX first, en second) ───────────────────────────────────────────

type Locale = "es-MX" | "en";

type Dict = {
  appName: string; appSub: string;
  tabs: { home: string; spheres: string; panorama: string; chat: string; settings: string };
  home: {
    greeting: string; greetingMorning: string; greetingAfternoon: string; greetingEvening: string;
    status: string; healthy: string; degraded: string; down: string;
    supabase: string; connected: string; disconnected: string; agents: string;
    active: string; idle: string; quickActions: string; newProject: string;
    callCouncil: string; viewExpenses: string; recentProjects: string; noProjects: string;
    loading: string;
  };
  spheres: {
    title: string; sub: string; subCount: string;
    status: { standby: string; active: string; error: string };
    message: string; placeholder: string; send: string; thinking: string; replyError: string;
  };
  panorama: {
    title: string; sub: string;
    phases: { iniciacion: string; planificacion: string; ejecucion: string; cierre: string };
    risk: { low: string; medium: string; high: string };
    noProjects: string; newProject: string;
  };
  chat: { title: string; sub: string; pickSphere: string; placeholder: string; send: string; you: string };
  settings: {
    title: string; language: string; spanish: string; english: string;
    account: string; signOut: string; about: string; version: string;
    dangerous: string; dangerousOff: string; dangerousOn: string;
  };
};

const I18N: Record<Locale, Dict> = {
  "es-MX": {
    appName: "Cockpit",
    appSub: "Centro de control · SYNTHIA",
    tabs: { home: "Inicio", spheres: "Esferas", panorama: "Panorama", chat: "Chat", settings: "Ajustes" },
    home: {
      greeting: "Buenas",
      greetingMorning: "Buenos días",
      greetingAfternoon: "Buenas tardes",
      greetingEvening: "Buenas noches",
      status: "Estado del sistema",
      healthy: "Saludable",
      degraded: "Degradado",
      down: "Caído",
      supabase: "Supabase",
      connected: "Conectado",
      disconnected: "Desconectado",
      agents: "Agentes",
      active: "activos",
      idle: "inactivos",
      quickActions: "Acciones rápidas",
      newProject: "Nuevo proyecto",
      callCouncil: "Convocar consejo",
      viewExpenses: "Ver gastos",
      recentProjects: "Proyectos recientes",
      noProjects: "Aún no hay proyectos. Crea el primero.",
      loading: "Cargando…",
    },
    spheres: {
      title: "Esferas",
      sub: "Tus agentes · toca para conversar",
      subCount: "Tus {count} agentes · toca para conversar",
      status: { standby: "En espera", active: "Activa", error: "Error" },
      message: "Mensaje",
      placeholder: "Escribe a {name}…",
      send: "Enviar",
      thinking: "Pensando…",
      replyError: "No respondió. Intenta de nuevo.",
    },
    panorama: {
      title: "Panorama",
      sub: "Gestión de proyectos · PMBOK 7",
      phases: { iniciacion: "Iniciación", planificacion: "Planificación", ejecucion: "Ejecución", cierre: "Cierre" },
      risk: { low: "Bajo", medium: "Medio", high: "Alto" },
      noProjects: "Sin proyectos en esta fase",
      newProject: "+ Nuevo",
    },
    chat: {
      title: "Chat",
      sub: "Habla con cualquier esfera",
      pickSphere: "Elige una esfera",
      placeholder: "Escribe tu mensaje…",
      send: "Enviar",
      you: "Tú",
    },
    settings: {
      title: "Ajustes",
      language: "Idioma",
      spanish: "Español (México)",
      english: "English",
      account: "Cuenta",
      signOut: "Cerrar sesión",
      about: "Acerca de",
      version: "Versión",
      dangerous: "Herramientas peligrosas",
      dangerousOff: "Desactivadas",
      dangerousOn: "Activadas",
    },
  },
  "en": {
    appName: "Cockpit",
    appSub: "Control center · SYNTHIA",
    tabs: { home: "Home", spheres: "Spheres", panorama: "Panorama", chat: "Chat", settings: "Settings" },
    home: {
      greeting: "Hello",
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      status: "System status",
      healthy: "Healthy",
      degraded: "Degraded",
      down: "Down",
      supabase: "Supabase",
      connected: "Connected",
      disconnected: "Disconnected",
      agents: "Agents",
      active: "active",
      idle: "idle",
      quickActions: "Quick actions",
      newProject: "New project",
      callCouncil: "Call council",
      viewExpenses: "View expenses",
      recentProjects: "Recent projects",
      noProjects: "No projects yet. Create the first one.",
      loading: "Loading…",
    },
    spheres: {
      title: "Spheres",
      sub: "Your agents · tap to chat",
      subCount: "Your {count} agents · tap to chat",
      status: { standby: "Standby", active: "Active", error: "Error" },
      message: "Message",
      placeholder: "Message {name}…",
      send: "Send",
      thinking: "Thinking…",
      replyError: "No reply. Try again.",
    },
    panorama: {
      title: "Panorama",
      sub: "Project management · PMBOK 7",
      phases: { iniciacion: "Initiation", planificacion: "Planning", ejecucion: "Execution", cierre: "Closing" },
      risk: { low: "Low", medium: "Medium", high: "High" },
      noProjects: "No projects in this phase",
      newProject: "+ New",
    },
    chat: {
      title: "Chat",
      sub: "Talk to any sphere",
      pickSphere: "Pick a sphere",
      placeholder: "Type your message…",
      send: "Send",
      you: "You",
    },
    settings: {
      title: "Settings",
      language: "Language",
      spanish: "Spanish (Mexico)",
      english: "English",
      account: "Account",
      signOut: "Sign out",
      about: "About",
      version: "Version",
      dangerous: "Dangerous tools",
      dangerousOff: "Disabled",
      dangerousOn: "Enabled",
    },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface SphereStatus {
  id: string; name: string; role: string; color: string;
  status: "active" | "standby" | "error"; task: string | null; last_active: string | null;
}
interface HealthResponse {
  status: string; timestamp: string;
  components: { supabase: { connected: boolean }; agents: { total: number; active: number; idle: number } };
}
interface Project {
  id: string; name: string; phase: "iniciacion" | "planificacion" | "ejecucion" | "cierre";
  progress: number; sponsor: string; risk_level: "low" | "medium" | "high";
}
interface ChatMsg { role: "user" | "assistant"; content: string; sphereName?: string }

// ─── Mobile Tab Bar (animated indicator, touch-first) ─────────────────────────
// Adapted from 21st.dev Animated TabBar (id 4669) — simplified for inline use.

interface TabItem { id: string; label: string; icon: string; color: string }

function MobileTabBar({ tabs, active, onChange }: { tabs: TabItem[]; active: string; onChange: (id: string) => void }) {
  const menuRef = useRef<HTMLElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, tabs.findIndex(t => t.id === active));

  const offsetBorder = useCallback(() => {
    const item = itemRefs.current[activeIndex];
    const menu = menuRef.current;
    const border = borderRef.current;
    if (item && menu && border) {
      const r = item.getBoundingClientRect();
      const left = Math.floor(r.left - menu.offsetLeft - (border.offsetWidth - r.width) / 2);
      border.style.transform = `translate3d(${left}px, 0, 0)`;
    }
  }, [activeIndex]);

  useLayoutEffect(() => { offsetBorder(); }, [offsetBorder]);
  useEffect(() => {
    const onResize = () => offsetBorder();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [offsetBorder]);

  return (
    <nav className="mcp-tabbar" ref={menuRef as React.RefObject<HTMLElement>}>
      <div className="mcp-tabbar-border" ref={borderRef} style={{ background: tabs[activeIndex]?.color }} />
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { itemRefs.current[i] = el; }}
          className={`mcp-tab ${active === t.id ? "is-active" : ""}`}
          onClick={() => onChange(t.id)}
          aria-label={t.label}
          aria-current={active === t.id ? "page" : undefined}
        >
          <span className="mcp-tab-icon" style={{ color: active === t.id ? t.color : undefined }}>{t.icon}</span>
          <span className="mcp-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function HomePage({ t, locale, spheres, health, projects, loading, onTab }: { t: Dict; locale: Locale; spheres: SphereStatus[]; health: HealthResponse | null; projects: Project[]; loading: boolean; onTab: (id: TabId) => void }) {
  const supabaseOk = health?.components?.supabase?.connected ?? false;
  const agents = health?.components?.agents;
  const hour = new Date().getHours();
  const greet = hour < 12 ? t.home.greetingMorning : hour < 19 ? t.home.greetingAfternoon : t.home.greetingEvening;
  return (
    <div className="mcp-page">
      <div className="mcp-hero">
        <div className="mcp-hero-greet">{greet}, Ivette</div>
        <div className="mcp-hero-sub">{t.appSub}</div>
      </div>

      <section className="mcp-card">
        <div className="mcp-card-title">{t.home.status}</div>
        {loading ? (
          <div className="mcp-skeleton" style={{ height: 36 }} />
        ) : (
          <>
            <div className="mcp-status-row">
              <span className={`mcp-dot ${supabaseOk ? "ok" : "bad"}`} />
              <span>{t.home.supabase}</span>
              <span className="mcp-status-val">{supabaseOk ? t.home.connected : t.home.disconnected}</span>
            </div>
            <div className="mcp-status-row">
              <span className={`mcp-dot ${agents && agents.active > 0 ? "ok" : "warn"}`} />
              <span>{t.home.agents}</span>
              <span className="mcp-status-val">{agents ? `${agents.active} ${t.home.active} · ${agents.idle} ${t.home.idle}` : "—"}</span>
            </div>
          </>
        )}
      </section>

      <section className="mcp-card">
        <div className="mcp-card-title">{t.home.quickActions}</div>
        <div className="mcp-actions">
          <button type="button" className="mcp-action" onClick={() => onTab("panorama")}><span>📁</span><span>{t.home.newProject}</span></button>
          <button type="button" className="mcp-action" onClick={() => onTab("chat")}><span>🟣</span><span>{t.home.callCouncil}</span></button>
          <button type="button" className="mcp-action" onClick={() => onTab("panorama")}><span>💸</span><span>{t.home.viewExpenses}</span></button>
        </div>
      </section>

      <section className="mcp-card">
        <div className="mcp-card-title">{t.home.recentProjects}</div>
        {projects.length === 0 ? (
          <div className="mcp-empty">{t.home.noProjects}</div>
        ) : (
          <ul className="mcp-list">
            {projects.slice(0, 4).map(p => (
              <li key={p.id} className="mcp-list-row">
                <Link href={`/panorama/proyecto/${p.id}`} className="mcp-list-link">
                  <span className="mcp-list-name">{p.name}</span>
                  <span className="mcp-list-meta">{t.panorama.phases[p.phase]} · {p.progress}%</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SpheresPage({ t, spheres, onChat, loading }: { t: Dict; spheres: SphereStatus[]; onChat: (id: string) => void; loading: boolean }) {
  return (
    <div className="mcp-page">
      <div className="mcp-section-head">
        <div className="mcp-section-title">{t.spheres.title}</div>
        <div className="mcp-section-sub">{t.spheres.subCount.replace("{count}", String(spheres.length || 9))}</div>
      </div>
      {loading ? (
        <div className="mcp-skeleton" style={{ height: 64 }} />
      ) : spheres.length === 0 ? (
        <div className="mcp-empty">{t.home.loading}</div>
      ) : (
      <ul className="mcp-spheres">
        {spheres.map(s => (
          <li key={s.id} className="mcp-sphere" onClick={() => onChat(s.id)} role="button" tabIndex={0}>
            <span className="mcp-sphere-orb" style={{ background: s.color, boxShadow: `0 0 16px ${s.color}66` }} />
            <span className="mcp-sphere-info">
              <span className="mcp-sphere-name">{s.name}</span>
              <span className="mcp-sphere-role">{s.role}</span>
            </span>
            <span className={`mcp-sphere-status ${s.status}`}>{t.spheres.status[s.status as "standby"|"active"|"error"]}</span>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

function PanoramaPage({ t, projects, locale }: { t: Dict; projects: Project[]; locale: Locale }) {
  const phases: Array<{ id: Project["phase"]; color: string }> = [
    { id: "iniciacion", color: "#8b5cf6" },
    { id: "planificacion", color: "#d4af37" },
    { id: "ejecucion", color: "#22c55e" },
    { id: "cierre", color: "#06b6d4" },
  ];
  return (
    <div className="mcp-page">
      <div className="mcp-section-head">
        <div className="mcp-section-title">{t.panorama.title}</div>
        <div className="mcp-section-sub">{t.panorama.sub}</div>
        <Link href="/panorama/proyecto/nuevo" className="mcp-fab">{t.panorama.newProject}</Link>
      </div>
      {phases.map(ph => {
        const items = projects.filter(p => p.phase === ph.id);
        return (
          <section key={ph.id} className="mcp-card">
            <div className="mcp-card-title" style={{ color: ph.color }}>{t.panorama.phases[ph.id]}</div>
            {items.length === 0 ? (
              <div className="mcp-empty">{t.panorama.noProjects}</div>
            ) : (
              <ul className="mcp-list">
                {items.map(p => (
                  <li key={p.id} className="mcp-list-row">
                    <Link href={`/panorama/proyecto/${p.id}`} className="mcp-list-link">
                      <span className="mcp-list-name">{p.name}</span>
                      <span className="mcp-list-meta">{p.progress}% · {t.panorama.risk[p.risk_level]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ChatPage({ t, spheres, initialSphere }: { t: Dict; spheres: SphereStatus[]; initialSphere?: string }) {
  const [sphereId, setSphereId] = useState(initialSphere || spheres[0]?.id || "");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message when msgs change or while thinking.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);
  const sphere = spheres.find(s => s.id === sphereId);

  async function send() {
    if (!input.trim() || !sphereId || busy) return;
    const text = input.trim();
    setMsgs(m => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/spheres/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sphereId, message: text, history: msgs.slice(-6) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", content: data.response, sphereName: data.sphereName }]);
    } catch {
      setErr(t.spheres.replyError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mcp-page mcp-chat-page">
      <div className="mcp-chat-header">
        <select className="mcp-select" value={sphereId} onChange={e => { setSphereId(e.target.value); setMsgs([]); }} aria-label={t.chat.pickSphere}>
          {spheres.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="mcp-chat-thread" ref={threadRef}>
        {msgs.length === 0 && <div className="mcp-empty">{t.chat.sub}</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`mcp-bubble ${m.role}`}>
            {m.role === "assistant" && m.sphereName && <div className="mcp-bubble-name">{m.sphereName}</div>}
            <div className="mcp-bubble-text">{m.content}</div>
          </div>
        ))}
        {busy && <div className="mcp-bubble assistant"><div className="mcp-bubble-text">{t.spheres.thinking}</div></div>}
        {err && <div className="mcp-chat-err">{err}</div>}
      </div>
      <form className="mcp-chat-input" onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          className="mcp-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={sphere ? t.spheres.placeholder.replace("{name}", sphere.name) : t.chat.placeholder}
          aria-label={t.chat.placeholder}
        />
        <button type="submit" className="mcp-send" disabled={busy || !input.trim()}>{t.chat.send}</button>
      </form>
    </div>
  );
}

function SettingsPage({ t, locale, setLocale }: { t: Dict; locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <div className="mcp-page">
      <div className="mcp-section-head">
        <div className="mcp-section-title">{t.settings.title}</div>
      </div>
      <section className="mcp-card">
        <div className="mcp-card-title">{t.settings.language}</div>
        <div className="mcp-radio-group">
          <label className={`mcp-radio ${locale === "es-MX" ? "on" : ""}`}>
            <input type="radio" name="locale" checked={locale === "es-MX"} onChange={() => setLocale("es-MX")} />
            <span>🇲🇽 {t.settings.spanish}</span>
          </label>
          <label className={`mcp-radio ${locale === "en" ? "on" : ""}`}>
            <input type="radio" name="locale" checked={locale === "en"} onChange={() => setLocale("en")} />
            <span>🇺🇸 {t.settings.english}</span>
          </label>
        </div>
        <div className="mcp-note">{locale === "es-MX" ? "Español mexicano es el idioma principal." : "Mexican Spanish is the primary language."}</div>
      </section>
      <section className="mcp-card">
        <div className="mcp-card-title">{t.settings.dangerous}</div>
        <div className="mcp-status-row">
          <span className="mcp-dot warn" />
          <span>{t.settings.dangerousOff}</span>
        </div>
        <div className="mcp-note">{locale === "es-MX" ? "Las herramientas peligrosas están desactivadas por defecto." : "Dangerous tools are disabled by default."}</div>
      </section>
      <section className="mcp-card">
        <div className="mcp-card-title">{t.settings.about}</div>
        <div className="mcp-status-row"><span>SYNTHIA™</span><span className="mcp-status-val">{t.settings.version} 3.0</span></div>
        <div className="mcp-status-row"><span>Kupuri Media™</span><span className="mcp-status-val">CDMX</span></div>
      </section>
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

type TabId = "home" | "spheres" | "panorama" | "chat" | "settings";

export default function MobileCockpit() {
  const [locale, setLocale] = useState<Locale>("es-MX");
  const [tab, setTab] = useState<TabId>("home");
  const [chatSphere, setChatSphere] = useState<string | undefined>(undefined);
  const [spheres, setSpheres] = useState<SphereStatus[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const t = I18N[locale];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sRes, hRes, pRes] = await Promise.all([
          fetch("/api/spheres/status", { cache: "no-store" }).then(r => r.json()).catch(() => null),
          fetch("/api/health", { cache: "no-store" }).then(r => r.json()).catch(() => null),
          fetch("/api/panorama/projects", { cache: "no-store" }).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        if (sRes?.spheres) setSpheres(sRes.spheres);
        if (hRes) setHealth(hRes);
        if (pRes?.projects) setProjects(pRes.projects);
      } catch { /* keep empty */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs: TabItem[] = [
    { id: "home", label: t.tabs.home, icon: "◉", color: "#8b5cf6" },
    { id: "spheres", label: t.tabs.spheres, icon: "✦", color: "#d4af37" },
    { id: "panorama", label: t.tabs.panorama, icon: "◫", color: "#22c55e" },
    { id: "chat", label: t.tabs.chat, icon: "✉", color: "#06b6d4" },
    { id: "settings", label: t.tabs.settings, icon: "⚙", color: "#64748b" },
  ];

  return (
    <div className="mcp-shell">
      <header className="mcp-topbar">
        <div className="mcp-topbar-title">{t.appName}</div>
        <div className="mcp-topbar-sub">{t.appSub}</div>
      </header>

      <main className="mcp-main">
        {tab === "home" && <HomePage t={t} locale={locale} spheres={spheres} health={health} projects={projects} loading={loading} onTab={setTab} />}
        {tab === "spheres" && <SpheresPage t={t} spheres={spheres} onChat={(id) => { setChatSphere(id); setTab("chat"); }} loading={loading} />}
        {tab === "panorama" && <PanoramaPage t={t} projects={projects} locale={locale} />}
        {tab === "chat" && <ChatPage t={t} spheres={spheres} initialSphere={chatSphere} />}
        {tab === "settings" && <SettingsPage t={t} locale={locale} setLocale={setLocale} />}
      </main>

      <MobileTabBar tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />
    </div>
  );
}
