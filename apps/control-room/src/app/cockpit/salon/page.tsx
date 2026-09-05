"use client";
/**
 * Salón de las Esferas™ — Observer-Only Council Viewer
 * Phase 6 | ZTE-20260319-0001 (updated: SSE removed; reads from CouncilBus)
 *
 * meetingId from URL ?meetingId=<uuid> is passed to Theater3D which owns
 * the bus connection. This page subscribes to the bus for transcript and
 * sphere activity without opening a duplicate EventSource.
 */

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SPHERE_FREQUENCY_MAP } from "@/shared/sphere-state";
import { useCouncilBus } from "@/lib/council/bus";
import type { SphereAgentId } from "@/shared/council-events";

// Theater3D uses Three.js — must be client-side only
const Theater3D = dynamic(
  () => import("@/components/Theater3D").then((m) => ({ default: m.Theater3D })),
  {
    ssr: false,
    loading: () => (
      <div style={{ flex: 1, background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#6b7280", fontSize: 13 }}>Cargando teatro…</span>
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Sphere Ring — reads activity from bus.field
// ---------------------------------------------------------------------------
function SphereRing() {
  const field    = useCouncilBus((s) => s.field);
  const speaking = useCouncilBus((s) => s.speaking);
  const rms      = useCouncilBus((s) => s.rms);

  const AGENT_IDS = Object.keys(SPHERE_FREQUENCY_MAP) as SphereAgentId[];

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      borderRight: "1px solid var(--color-charcoal-600)",
      padding: "24px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflowY: "auto",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: "var(--color-cream-600)",
        textTransform: "uppercase",
        paddingLeft: 8,
        marginBottom: 4,
      }}>
        Consejo de Esferas
      </div>
      {AGENT_IDS.map((agentId) => {
        const sphere      = SPHERE_FREQUENCY_MAP[agentId];
        const busS        = field?.spheres.get(agentId);
        const isSpeaking  = speaking === agentId;
        const amplitude   = isSpeaking ? rms : 0;

        return (
          <div
            key={agentId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 8px",
              borderRadius: 8,
              background: isSpeaking ? `${sphere.baseColor}18` : "transparent",
              border: `1px solid ${isSpeaking ? sphere.baseColor + "60" : "transparent"}`,
              transition: "all 300ms ease",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: sphere.baseColor,
                flexShrink: 0,
                opacity: busS ? (0.2 + busS.energy * 0.8) : (isSpeaking ? 1 : 0.25),
                boxShadow: isSpeaking
                  ? `0 0 ${8 + amplitude * 16}px ${sphere.baseColor}aa, 0 0 ${4 + amplitude * 8}px ${sphere.baseColor}66`
                  : "none",
                transition: "all 300ms ease",
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: isSpeaking ? sphere.baseColor : "var(--color-cream-300)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color 300ms ease",
              }}>
                {sphere.displayName}
              </div>
              <div style={{
                fontSize: 10,
                color: "var(--color-cream-600)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {isSpeaking ? "SPEAKING" : sphere.role.split("—")[0].trim()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript Panel — reads from bus.transcript
// ---------------------------------------------------------------------------
function TranscriptPanel() {
  const transcript = useCouncilBus((s) => s.transcript);
  const last12 = transcript.slice(-12);

  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      borderLeft: "1px solid var(--color-charcoal-600)",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-charcoal-600)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: "var(--color-cream-600)",
        textTransform: "uppercase",
        flexShrink: 0,
      }}>
        Transcripción en vivo
      </div>
      <div
        aria-live="polite"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {last12.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--color-cream-600)", padding: "8px 8px", textAlign: "center", marginTop: 24 }}>
            Esperando señales del consejo…
          </div>
        )}
        {last12.map((entry, idx) => {
          const sphere = SPHERE_FREQUENCY_MAP[entry.agentId as keyof typeof SPHERE_FREQUENCY_MAP];
          if (!sphere) return null;
          return (
            <div
              key={idx}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                borderLeft: `3px solid ${sphere.baseColor}`,
                background: `${sphere.baseColor}0d`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: sphere.baseColor,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: sphere.baseColor }}>
                  {sphere.displayName}
                </span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--color-cream-600)",
                  fontFamily: "monospace",
                }}>
                  {entry.kind}
                </span>
              </div>
              {entry.text && (
                <div style={{ fontSize: 12, color: "var(--color-cream-300)", lineHeight: 1.5 }}>
                  {entry.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge — reads from bus.connection
// ---------------------------------------------------------------------------
type MeetingStatus = "waiting" | "live" | "ended";

function statusFromConnection(conn: string): MeetingStatus {
  if (conn === "live" || conn === "replay") return "live";
  if (conn === "error") return "ended";
  return "waiting";
}

function StatusBadge() {
  const connection = useCouncilBus((s) => s.connection);
  const status = statusFromConnection(connection);

  const cfg: Record<MeetingStatus, { color: string; label: string }> = {
    waiting: { color: "#6b7280", label: "Esperando sesión" },
    live:    { color: "#22c55e", label: "Sesión en vivo" },
    ended:   { color: "#d4af37", label: "Sesión finalizada" },
  };
  const { color, label } = cfg[status];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        boxShadow: status === "live" ? `0 0 8px ${color}` : "none",
      }} />
      <span style={{ fontSize: 12, color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Salón Observer
// ---------------------------------------------------------------------------
function SalonObserver() {
  const searchParams = useSearchParams();
  const meetingId    = searchParams.get("meetingId");
  const meetingTitle = useCouncilBus((s) =>
    s.transcript.find((e) => e.kind === "BEGIN")?.text ?? ""
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 52px)" }}>
      {/* Page header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--color-charcoal-600)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--color-gold-400)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.03em",
          }}>
            Salón de las Esferas™
          </div>
          {meetingTitle && (
            <div style={{ fontSize: 12, color: "var(--color-cream-500)", marginTop: 2 }}>
              {meetingTitle}
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusBadge />
        </div>
      </div>

      {/* No meetingId prompt */}
      {!meetingId && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: "var(--color-cream-600)",
        }}>
          <div style={{ fontSize: 40, opacity: 0.3 }}>◉</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Pasa un ID de sesión en la URL
          </div>
          <div style={{ fontSize: 12, fontFamily: "monospace", background: "var(--color-charcoal-700)", padding: "6px 12px", borderRadius: 6, color: "var(--color-cream-400)" }}>
            /cockpit/salon?meetingId=&lt;uuid&gt;
          </div>
          <div style={{ fontSize: 12, color: "var(--color-cream-600)", maxWidth: 380, textAlign: "center" }}>
            Inicia una sesión desde el Panel de Control para obtener un ID, luego abre esta vista para observar el consejo en tiempo real.
          </div>
        </div>
      )}

      {/* Main 3-column layout — Theater3D owns the bus connection */}
      {meetingId && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <SphereRing />
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Theater3D meetingId={meetingId} />
          </div>
          <TranscriptPanel />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export — wrapped in Suspense for useSearchParams()
// ---------------------------------------------------------------------------
export default function SalonPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 52px)", color: "var(--color-cream-600)" }}>
        Cargando Salón de las Esferas™…
      </div>
    }>
      <SalonObserver />
    </Suspense>
  );
}
