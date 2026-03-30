"use client";
/**
 * Salón de las Esferas™ — Observer-Only Council Viewer
 * Phase 6 | ZTE-20260319-0001
 *
 * Layout: 220px left (sphere ring) | flex center (Theater3D) | 300px right (transcript)
 * Bottom bar: round badge
 *
 * Data: SSE stream from GET /api/council/orchestrator?meetingId=<id>
 * No Start button — observer only. meetingId comes from URL ?meetingId=<uuid>
 */

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { SPHERE_FREQUENCY_MAP } from "@/shared/sphere-state";
import type { SphereAgentId } from "@/shared/council-events";

// Theater3D uses Three.js — must be client-side only
const Theater3D = dynamic(
  () => import("@/components/Theater3D").then((m) => ({ default: m.Theater3D })),
  { ssr: false, loading: () => <div style={{ flex: 1, background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#6b7280", fontSize: 13 }}>Cargando teatro…</span></div> }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoundState {
  round: number;
  phase: string;
  label: string;
}

interface SphereActivity {
  agentId: SphereAgentId;
  speaking: boolean;
  amplitude: number;
  kind: string;
  lastAt: number;
}

interface TranscriptEntry {
  id: string;
  agentId: SphereAgentId;
  text: string;
  kind: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Sphere Ring — left panel, 9 circles
// ---------------------------------------------------------------------------

const AGENT_IDS = Object.keys(SPHERE_FREQUENCY_MAP) as SphereAgentId[];

function SphereRing({ activity }: { activity: Map<SphereAgentId, SphereActivity> }) {
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
        const sphere = SPHERE_FREQUENCY_MAP[agentId];
        const a = activity.get(agentId);
        const isSpeaking = a?.speaking ?? false;
        const amplitude = a?.amplitude ?? 0;

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
            {/* Sphere circle */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: sphere.baseColor,
                flexShrink: 0,
                opacity: isSpeaking ? 1 : 0.25,
                boxShadow: isSpeaking
                  ? `0 0 ${8 + amplitude * 16}px ${sphere.baseColor}aa, 0 0 ${4 + amplitude * 8}px ${sphere.baseColor}66`
                  : "none",
                transition: "all 300ms ease",
                animation: isSpeaking ? "salonPulse 1.2s ease-in-out infinite" : "none",
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
                {isSpeaking ? (a?.kind ?? "ASSERT") : sphere.role.split("—")[0].trim()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript Panel — right panel, scrolling
// ---------------------------------------------------------------------------

function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

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
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {entries.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--color-cream-600)", padding: "8px 8px", textAlign: "center", marginTop: 24 }}>
            Esperando señales del consejo…
          </div>
        )}
        {entries.map((entry) => {
          const sphere = SPHERE_FREQUENCY_MAP[entry.agentId];
          return (
            <div
              key={entry.id}
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
              <div style={{ fontSize: 12, color: "var(--color-cream-300)", lineHeight: 1.5 }}>
                {entry.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round Badge — bottom bar
// ---------------------------------------------------------------------------

function RoundBadge({ round }: { round: RoundState | null }) {
  if (!round) return null;

  const phaseColors: Record<string, string> = {
    position: "#8b5cf6",
    rebuttal: "#ef4444",
    synthesis: "#22c55e",
  };

  const color = phaseColors[round.phase] ?? "var(--color-gold-400)";

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      background: "var(--color-charcoal-800)",
      border: `1px solid ${color}40`,
      borderRadius: 24,
      padding: "8px 20px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxShadow: `0 4px 24px ${color}20`,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: "salonPulse 1.5s ease-in-out infinite",
      }} />
      <span style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: "0.03em" }}>
        {round.label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status indicator
// ---------------------------------------------------------------------------

type MeetingStatus = "waiting" | "live" | "ended";

function StatusBadge({ status }: { status: MeetingStatus }) {
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
        animation: status === "live" ? "salonPulse 1.5s ease-in-out infinite" : "none",
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
  const meetingId = searchParams.get("meetingId");

  const [status, setStatus] = useState<MeetingStatus>("waiting");
  const [currentRound, setCurrentRound] = useState<RoundState | null>(null);
  const [activity, setActivity] = useState<Map<SphereAgentId, SphereActivity>>(new Map());
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [meetingTitle, setMeetingTitle] = useState<string>("");

  const esRef = useRef<EventSource | null>(null);
  const fadeTimers = useRef<Map<SphereAgentId, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!meetingId) return;

    setStatus("live");
    const es = new EventSource(`/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`);
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data);
        handleCouncilEvent(event);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // Connection closed or error — meeting may have ended
      setStatus((s) => (s === "live" ? "ended" : s));
    };

    return () => {
      es.close();
      fadeTimers.current.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  function handleCouncilEvent(event: Record<string, unknown>) {
    const type = event.type as string;

    if (type === "meeting.begin") {
      setStatus("live");
      setMeetingTitle((event.topic as string) ?? "");
    }

    if (type === "round.begin") {
      setCurrentRound({
        round: event.round as number,
        phase: event.phase as string,
        label: event.label as string,
      });
    }

    if (type === "sphere.signal") {
      const agentId = event.agentId as SphereAgentId;
      const amplitude = (event.amplitude as number) ?? 0.5;
      const kind = (event.kind as string) ?? "ASSERT";
      const transcript = (event.transcript as string) ?? "";

      setActivity((prev) => {
        const next = new Map(prev);
        next.set(agentId, { agentId, speaking: true, amplitude, kind, lastAt: Date.now() });
        return next;
      });

      // Fade out after signal duration
      const durationMs = (event.durationMs as number) ?? 2000;
      const existingTimer = fadeTimers.current.get(agentId);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        setActivity((prev) => {
          const next = new Map(prev);
          const current = next.get(agentId);
          if (current) next.set(agentId, { ...current, speaking: false, amplitude: 0 });
          return next;
        });
      }, durationMs + 800);

      fadeTimers.current.set(agentId, timer);

      // Add to transcript if has text
      if (transcript.trim()) {
        setTranscript((prev) => [
          ...prev,
          {
            id: `${agentId}-${Date.now()}`,
            agentId,
            text: transcript,
            kind,
            timestamp: Date.now(),
          },
        ]);
      }
    }

    if (type === "meeting.end") {
      setStatus("ended");
      setCurrentRound(null);
    }
  }

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
          <StatusBadge status={status} />
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

      {/* Main 3-column layout */}
      {meetingId && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left: Sphere ring */}
          <SphereRing activity={activity} />

          {/* Center: Theater3D */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Theater3D meetingId={meetingId} />
          </div>

          {/* Right: Transcript */}
          <TranscriptPanel entries={transcript} />
        </div>
      )}

      {/* Bottom: Round badge (fixed position) */}
      {meetingId && <RoundBadge round={currentRound} />}

      {/* Keyframe animations */}
      <style>{`
        @keyframes salonPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
      `}</style>
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
