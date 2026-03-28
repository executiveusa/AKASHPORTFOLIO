"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MEETING_LOCATIONS, type MeetingLocation } from "@/lib/meeting-locations";

// Lazy-load Theater3D to avoid SSR issues with Three.js
const Theater3D = dynamic(
  () => import("@/components/Theater3D").then((m) => ({ default: m.Theater3D })),
  { ssr: false, loading: () => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 500, color: "var(--color-cream-400)" }}>Cargando Teatro 3D…</div> }
);

export default function TheaterCockpitPage() {
  const [selectedLocation, setSelectedLocation] = useState<MeetingLocation>(MEETING_LOCATIONS[1]); // Balcón del Zócalo
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingId, setMeetingId] = useState<string | undefined>(undefined);
  const [showControls, setShowControls] = useState(true);

  async function startMeeting() {
    try {
      console.warn('[TODO] migrate: /api/council/orchestrator');
      setMeetingId(`cockpit-meeting-${Date.now()}`);
    } catch {
      setMeetingId(`cockpit-meeting-${Date.now()}`);
    }
    setMeetingActive(true);
  }

  function endMeeting() {
    setMeetingId(undefined);
    setMeetingActive(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Teatro del Consejo
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            {selectedLocation.nameEs}, {selectedLocation.neighborhood} — {selectedLocation.defaultParticipants.length} participantes
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowControls(!showControls)}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "var(--color-cream-400)",
              border: "1px solid var(--color-gold-600-20)",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {showControls ? "Ocultar Panel" : "Mostrar Panel"}
          </button>
          {!meetingActive ? (
            <button
              onClick={startMeeting}
              style={{
                padding: "8px 20px",
                backgroundColor: "var(--color-gold-600)",
                color: "var(--color-charcoal-900)",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Iniciar Reunión
            </button>
          ) : (
            <button
              onClick={endMeeting}
              style={{
                padding: "8px 20px",
                backgroundColor: "var(--color-status-error)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Terminar Reunión
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {/* 3D Viewport */}
        <div
          className="panel"
          style={{
            flex: 1,
            padding: 0,
            overflow: "hidden",
            position: "relative",
            minHeight: 400,
            backgroundColor: `#${selectedLocation.bgColor.toString(16).padStart(6, "0")}`,
          }}
        >
          <Theater3D
            meetingId={meetingId}
            bilingual={true}
            location={selectedLocation}
          />
          {meetingActive && (
            <div style={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-status-ok)",
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--color-status-error)",
                animation: "pulse 1.5s infinite",
              }} />
              EN VIVO
            </div>
          )}
        </div>

        {/* Side Panel */}
        {showControls && (
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Location Picker */}
            <div className="panel" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-100)", marginBottom: 10 }}>
                Ubicación
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {MEETING_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => !meetingActive && setSelectedLocation(loc)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      backgroundColor: selectedLocation.id === loc.id ? "var(--color-charcoal-700)" : "transparent",
                      color: selectedLocation.id === loc.id ? "var(--color-gold-400)" : "var(--color-cream-200)",
                      fontSize: 13,
                      textAlign: "left",
                      cursor: meetingActive ? "not-allowed" : "pointer",
                      opacity: meetingActive && selectedLocation.id !== loc.id ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{loc.nameEs}</div>
                    <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>{loc.neighborhood}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="panel" style={{ padding: 14, flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-100)", marginBottom: 10 }}>
                Participantes ({selectedLocation.defaultParticipants.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedLocation.defaultParticipants.map((name) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: meetingActive ? "var(--color-status-ok)" : "var(--color-cream-400)",
                      boxShadow: meetingActive ? "0 0 6px var(--color-status-ok)" : "none",
                    }} />
                    <span style={{ color: "var(--color-cream-200)" }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Status */}
            <div className="panel" style={{ padding: 14, borderLeft: meetingActive ? "3px solid var(--color-status-ok)" : "3px solid var(--color-cream-400)" }}>
              <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Estado</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: meetingActive ? "var(--color-status-ok)" : "var(--color-cream-200)", marginTop: 2 }}>
                {meetingActive ? "Reunión en curso" : "Sin reunión activa"}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
