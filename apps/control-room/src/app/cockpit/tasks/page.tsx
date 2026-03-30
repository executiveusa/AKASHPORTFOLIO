"use client";

import { useState } from "react";
import KPICard from "@/components/KPICard";
import TaskDetailDrawer from "@/components/TaskDetailDrawer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "not-started" | "in-progress" | "blocked" | "completed" | "failed";
type TaskPriority = "critical" | "high" | "medium" | "low";

interface AgentTask {
  id: string;
  bead_id: string;
  title: string;
  owner_sphere: string;
  status: TaskStatus;
  priority: TaskPriority;
  cost_usd: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Static seed — authoritative task list for this sprint
// Sync: .beads/issues.jsonl mirrors this data
// ---------------------------------------------------------------------------

const SEED_TASKS: AgentTask[] = [
  // Phase 0 — Foundation (all complete)
  { id: "1",  bead_id: "ZTE-20260319-0001", title: "Emerald Tablets + ZTE soul files installed in all repos",        owner_sphere: "ing-teknos",  status: "completed",   priority: "critical", cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "2",  bead_id: "ZTE-20260319-0002", title: "Supabase schema SQL — all 6 tables + functions",                 owner_sphere: "forjadora",   status: "completed",   priority: "critical", cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "3",  bead_id: "ZTE-20260319-0003", title: "pauli-auto-research cloned + analyzed for Phase 6",             owner_sphere: "ing-teknos",  status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },

  // Phase 1 — La Monarcha
  { id: "4",  bead_id: "ZTE-20260319-0004", title: "La Monarcha Navigation — 6 journalism sections + CTAs",         owner_sphere: "dra-cultura", status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "5",  bead_id: "ZTE-20260319-0005", title: "La Monarcha Footer — clean rewrite with Directorio link",       owner_sphere: "dra-cultura", status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "6",  bead_id: "ZTE-20260319-0006", title: "La Monarcha Suscribirse page — 3 tiers, bilingual",             owner_sphere: "seductora",   status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "7",  bead_id: "ZTE-20260323-0001", title: "La Monarcha — articles Supabase integration",                   owner_sphere: "forjadora",   status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 2 — Directorio Kupuri
  { id: "8",  bead_id: "ZTE-20260319-0007", title: "cult-directory TS errors fixed (schema + fallback-image)",      owner_sphere: "ing-teknos",  status: "completed",   priority: "critical", cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "9",  bead_id: "ZTE-20260319-0008", title: "cult-directory hero rebranded to Directorio Kupuri™",           owner_sphere: "forjadora",   status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "10", bead_id: "ZTE-20260323-0002", title: "cult-directory nav.tsx — update title to Directorio Kupuri™",  owner_sphere: "forjadora",   status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },
  { id: "11", bead_id: "ZTE-20260323-0003", title: "cult-directory tailwind.config — add Kupuri color tokens",     owner_sphere: "forjadora",   status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 2.4 — Control Room
  { id: "12", bead_id: "ZTE-20260319-0009", title: "Landing page — Directorio CTA banner + real footer hrefs",      owner_sphere: "synthia",     status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-19", updated_at: "2026-03-19" },
  { id: "13", bead_id: "ZTE-20260323-0004", title: "Cockpit Vault page — credential metadata monitor",              owner_sphere: "la-vigilante",status: "completed",   priority: "high",     cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },
  { id: "14", bead_id: "ZTE-20260323-0005", title: "Cockpit Tasks dashboard — this page",                           owner_sphere: "la-vigilante",status: "in-progress", priority: "high",     cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 3 — Subscriptions
  { id: "15", bead_id: "ZTE-20260323-0006", title: "Stripe products — Lector/Creador/Empresario SKUs",              owner_sphere: "dr-economia", status: "not-started", priority: "high",     cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },
  { id: "16", bead_id: "ZTE-20260323-0007", title: "NextAuth Google OAuth — cockpit route protection",              owner_sphere: "ing-teknos",  status: "not-started", priority: "critical", cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 4 — Ghost Agents
  { id: "17", bead_id: "ZTE-20260323-0008", title: "Fantasmas™ — define 3 ghost agent skill files",                 owner_sphere: "cazadora",    status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 5 — Observability
  { id: "18", bead_id: "ZTE-20260323-0009", title: "Sentry integration — error tracking all 3 apps",                owner_sphere: "ing-teknos",  status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },

  // Phase 6 — Research Flywheel
  { id: "19", bead_id: "ZTE-20260323-0010", title: "Evening research cron — 19:00 CST cycle",                       owner_sphere: "consejo",     status: "not-started", priority: "high",     cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },
  { id: "20", bead_id: "ZTE-20260323-0011", title: "LATAM Strategy doc + session gap analysis",                     owner_sphere: "alex",        status: "not-started", priority: "medium",   cost_usd: 0,    created_at: "2026-03-23", updated_at: "2026-03-23" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  "not-started": { label: "Not Started",  color: "#94a3b8",  bg: "rgba(148,163,184,0.1)" },
  "in-progress": { label: "In Progress",  color: "#818cf8",  bg: "rgba(129,140,248,0.12)" },
  "blocked":     { label: "Blocked",      color: "#f97316",  bg: "rgba(249,115,22,0.1)" },
  "completed":   { label: "Completed",    color: "#22c55e",  bg: "rgba(34,197,94,0.1)" },
  "failed":      { label: "Failed",       color: "#ef4444",  bg: "rgba(239,68,68,0.1)" },
};

const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string }> = {
  "critical": { label: "Critical", color: "#ef4444" },
  "high":     { label: "High",     color: "#f97316" },
  "medium":   { label: "Medium",   color: "#eab308" },
  "low":      { label: "Low",      color: "#94a3b8" },
};

const SPHERE_COLORS: Record<string, string> = {
  "synthia":     "#8b5cf6",
  "alex":        "#d4af37",
  "cazadora":    "#ef4444",
  "forjadora":   "#22c55e",
  "seductora":   "#eab308",
  "consejo":     "#1d4ed8",
  "dr-economia": "#f97316",
  "dra-cultura": "#f43f5e",
  "ing-teknos":  "#06b6d4",
  "la-vigilante":"#64748b",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type FilterStatus = "all" | TaskStatus;
type FilterPhase  = "all" | "0" | "1" | "2" | "3" | "4" | "5" | "6";

const PHASE_BEAD_RANGES: Record<string, string[]> = {
  "0": ["0001","0002","0003"],
  "1": ["0004","0005","0006","0001-p1"],
  "2": ["0007","0008","0009","0002-p2","0003-p2"],
  "3": ["0006-p3","0007-p3"],
  "4": ["0008-p4"],
  "5": ["0009-p5"],
  "6": ["0010-p6","0011-p6"],
};

function phaseOf(task: AgentTask): string {
  const n = parseInt(task.id, 10);
  if (n <= 3)  return "0";
  if (n <= 7)  return "1";
  if (n <= 11) return "2";
  if (n <= 14) return "2.4";
  if (n <= 16) return "3";
  if (n <= 17) return "4";
  if (n <= 18) return "5";
  return "6";
}

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterSphere, setFilterSphere] = useState<string>("all");
  const [tasks, setTasks] = useState<AgentTask[]>(SEED_TASKS);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);

  const spheres = ["all", ...Array.from(new Set(SEED_TASKS.map(t => t.owner_sphere)))];

  const filtered = tasks.filter(t => {
    const statusOk = filterStatus === "all" || t.status === filterStatus;
    const sphereOk = filterSphere === "all" || t.owner_sphere === filterSphere;
    return statusOk && sphereOk;
  });

  const total     = tasks.length;
  const done      = tasks.filter(t => t.status === "completed").length;
  const active    = tasks.filter(t => t.status === "in-progress").length;
  const blocked   = tasks.filter(t => t.status === "blocked").length;
  const notStarted = tasks.filter(t => t.status === "not-started").length;

  return (
    <div className="page-content" style={{ padding: "32px 40px", maxWidth: 1080 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-gold-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          La Vigilante™ · Sprint Tracker
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-cream-100)", letterSpacing: "-0.03em", marginBottom: 4 }}>
          Tablero de Tareas™
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)" }}>
          ZTE sprint board · {done}/{total} complete · Bead ID format: ZTE-YYYYMMDD-NNNN
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Completed" value={done} color="#22c55e" />
        <KPICard label="In Progress" value={active} color="#818cf8" />
        <KPICard label="Blocked" value={blocked} color="#f97316" />
        <KPICard label="Not Started" value={notStarted} color="#94a3b8" />
      </div>

      {/* Progress bar */}
      <div className="panel" style={{ padding: "12px 16px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-cream-400)", marginBottom: 6 }}>
          <span>Sprint Progress</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{Math.round((done / total) * 100)}%</span>
        </div>
        <div style={{ background: "var(--color-charcoal-700)", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: "#22c55e", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "not-started", "in-progress", "blocked", "completed", "failed"] as FilterStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: filterStatus === s ? "1px solid var(--color-gold-500)" : "1px solid var(--color-charcoal-600)",
              background: filterStatus === s ? "rgba(212,175,55,0.12)" : "transparent",
              color: filterStatus === s ? "var(--color-gold-500)" : "var(--color-cream-400)",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: filterStatus === s ? 600 : 400,
            }}
          >
            {s === "all" ? "All" : STATUS_CFG[s].label}
          </button>
        ))}

        <div style={{ marginLeft: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {spheres.map(s => (
            <button
              key={s}
              onClick={() => setFilterSphere(s)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: filterSphere === s ? `1px solid ${SPHERE_COLORS[s] ?? "#94a3b8"}` : "1px solid var(--color-charcoal-600)",
                background: filterSphere === s ? `${SPHERE_COLORS[s] ?? "#94a3b8"}18` : "transparent",
                color: filterSphere === s ? (SPHERE_COLORS[s] ?? "#94a3b8") : "var(--color-cream-400)",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: filterSphere === s ? 600 : 400,
              }}
            >
              {s === "all" ? "All Spheres" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Task Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 100px 80px 80px 90px",
          gap: 12,
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-charcoal-700)",
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-cream-500)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          <div>Phase</div>
          <div>Task</div>
          <div>Sphere</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Bead ID</div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-cream-500)", fontSize: 13 }}>
            No tasks match the current filters.
          </div>
        )}

        {filtered.map((task, idx) => {
          const sc = STATUS_CFG[task.status];
          const pc = PRIORITY_CFG[task.priority];
          const sphereColor = SPHERE_COLORS[task.owner_sphere] ?? "#94a3b8";
          const phase = phaseOf(task);

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 100px 80px 80px 90px",
                gap: 12,
                padding: "11px 16px",
                alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-charcoal-700)" : "none",
                opacity: task.status === "completed" ? 0.65 : 1,
                cursor: "pointer",
              }}
            >
              {/* Phase */}
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-cream-500)" }}>
                P{phase}
              </div>

              {/* Title */}
              <div style={{
                fontSize: 13,
                color: "var(--color-cream-100)",
                textDecoration: task.status === "completed" ? "line-through" : "none",
              }}>
                {task.title}
              </div>

              {/* Sphere */}
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: sphereColor,
                letterSpacing: "0.04em",
              }}>
                {task.owner_sphere}
              </div>

              {/* Priority */}
              <div style={{ fontSize: 11, color: pc.color, fontWeight: 600 }}>
                {pc.label}
              </div>

              {/* Status */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 8px", borderRadius: 5,
                background: sc.bg, color: sc.color,
                fontSize: 10, fontWeight: 600,
                width: "fit-content",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
                {task.status === "in-progress" ? "Active" : sc.label}
              </div>

              {/* Bead ID */}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-cream-500)" }}>
                {task.bead_id}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 20 }}>
        {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown · Sync: live view of ZTE sprint · Source of truth: .beads/issues.jsonl
      </p>

      {selectedTask && (
        <>
          <div
            onClick={() => setSelectedTask(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 40,
            }}
          />
          <TaskDetailDrawer
            task={selectedTask}
            sphereColor={SPHERE_COLORS[selectedTask.owner_sphere] ?? "#94a3b8"}
            onClose={() => setSelectedTask(null)}
          />
        </>
      )}
    </div>
  );
}
