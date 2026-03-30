"use client";

import { useState } from "react";
import {
  SKILLS_REGISTRY,
  getSkillsBySphere,
  type Skill,
  type SphereOwner,
  type SkillCategory,
} from "@/lib/skills-registry";

const SPHERE_COLORS: Record<SphereOwner, string> = {
  synthia:      "#8b5cf6",
  alex:         "#d4af37",
  cazadora:     "#ef4444",
  forjadora:    "#22c55e",
  seductora:    "#eab308",
  consejo:      "#1d4ed8",
  "dr-economia":"#f97316",
  "dra-cultura":"#f43f5e",
  "ing-teknos": "#06b6d4",
};

const ALL_SPHERES: SphereOwner[] = [
  "synthia","alex","cazadora","forjadora","seductora",
  "consejo","dr-economia","dra-cultura","ing-teknos",
];

const CATEGORIES: SkillCategory[] = [
  "marketing","sales","ops","finance","research","support","growth","content",
];

const TIER_COLORS: Record<string, string> = {
  lite:    "#22c55e",
  starter: "#818cf8",
  growth:  "#eab308",
  agency:  "#f97316",
};

export default function CockpitSkillsPage() {
  const [sphereFilter, setSphereFilter] = useState<SphereOwner | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = SKILLS_REGISTRY.filter((s) => {
    if (sphereFilter !== "all" && s.owner_sphere !== sphereFilter) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name_es.toLowerCase().includes(q) ||
        s.name_en.toLowerCase().includes(q) ||
        s.id.includes(q)
      );
    }
    return true;
  });

  // Sphere distribution counts
  const sphereCounts = ALL_SPHERES.map((id) => ({
    id,
    count: getSkillsBySphere(id).length,
  }));

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--color-cream-100)",
          marginBottom: 4,
        }}
      >
        Skills Registry
      </h1>
      <p
        style={{
          fontSize: 12,
          color: "var(--color-cream-500)",
          marginBottom: 24,
        }}
      >
        {SKILLS_REGISTRY.length} skills across {ALL_SPHERES.length} spheres
      </p>

      {/* Sphere distribution bar */}
      <div
        className="panel"
        style={{ padding: "14px 16px", marginBottom: 20 }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--color-cream-400)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Distribution by Sphere
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sphereCounts.map((sc) => (
            <button
              key={sc.id}
              onClick={() =>
                setSphereFilter(sphereFilter === sc.id ? "all" : sc.id)
              }
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border:
                  sphereFilter === sc.id
                    ? `1px solid ${SPHERE_COLORS[sc.id]}`
                    : "1px solid var(--color-charcoal-700)",
                background:
                  sphereFilter === sc.id
                    ? `${SPHERE_COLORS[sc.id]}22`
                    : "transparent",
                color: SPHERE_COLORS[sc.id],
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {sc.id} ({sc.count})
            </button>
          ))}
        </div>
      </div>

      {/* Filters row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid var(--color-charcoal-700)",
            background: "var(--color-charcoal-800)",
            color: "var(--color-cream-100)",
            fontSize: 12,
            width: 200,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setCategoryFilter("all")}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border:
                categoryFilter === "all"
                  ? "1px solid var(--color-gold-500)"
                  : "1px solid var(--color-charcoal-700)",
              background:
                categoryFilter === "all"
                  ? "var(--color-gold-500)22"
                  : "transparent",
              color:
                categoryFilter === "all"
                  ? "var(--color-gold-400)"
                  : "var(--color-cream-500)",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setCategoryFilter(categoryFilter === cat ? "all" : cat)
              }
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border:
                  categoryFilter === cat
                    ? "1px solid var(--color-gold-500)"
                    : "1px solid var(--color-charcoal-700)",
                background:
                  categoryFilter === cat
                    ? "var(--color-gold-500)22"
                    : "transparent",
                color:
                  categoryFilter === cat
                    ? "var(--color-gold-400)"
                    : "var(--color-cream-500)",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 80px 80px 80px",
            gap: 12,
            padding: "10px 16px",
            background: "var(--color-charcoal-700)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-cream-400)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <div>Skill</div>
          <div>Sphere</div>
          <div>Category</div>
          <div>Tier</div>
          <div>Outputs</div>
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--color-cream-500)",
              fontSize: 13,
            }}
          >
            No skills match the current filters.
          </div>
        )}

        {filtered.map((skill, idx) => (
          <div
            key={skill.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 80px 80px 80px",
              gap: 12,
              padding: "10px 16px",
              alignItems: "center",
              borderBottom:
                idx < filtered.length - 1
                  ? "1px solid var(--color-charcoal-700)"
                  : "none",
            }}
          >
            {/* Skill name + pain point */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-cream-100)",
                  fontWeight: 500,
                }}
              >
                {skill.name_es}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--color-cream-500)",
                  marginTop: 2,
                }}
              >
                {skill.pain_point_es}
              </div>
            </div>

            {/* Sphere */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: SPHERE_COLORS[skill.owner_sphere],
                letterSpacing: "0.04em",
              }}
            >
              {skill.owner_sphere}
            </div>

            {/* Category */}
            <div
              style={{
                fontSize: 10,
                color: "var(--color-cream-400)",
                textTransform: "uppercase",
              }}
            >
              {skill.category}
            </div>

            {/* Tier */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: TIER_COLORS[skill.tier_required] ?? "#94a3b8",
              }}
            >
              {skill.tier_required}
            </div>

            {/* Outputs */}
            <div
              style={{
                fontSize: 10,
                color: "var(--color-cream-500)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {skill.outputs.map((o) => o.format).join(", ")}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 11,
          color: "var(--color-cream-600)",
          marginTop: 20,
        }}
      >
        {filtered.length} skill{filtered.length !== 1 ? "s" : ""} shown ·
        Source: skills-registry.ts
      </p>
    </div>
  );
}
