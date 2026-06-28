"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface SphereSignal {
  kind: string;
  message?: string;
  agent?: string;
}

export function SynthiaBanner() {
  const [signal, setSignal] = useState<SphereSignal | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Listen on a broadcast channel for SYNTHIA sphere signals
    const channel = supabase
      .channel("synthia-signals")
      .on("broadcast", { event: "sphere.signal" }, ({ payload }) => {
        const sig = payload as SphereSignal;
        setSignal(sig);
        // Auto-dismiss after 6s
        setTimeout(() => setSignal(null), 6000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!signal) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(124,58,237,0.92)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        maxWidth: "calc(100vw - 32px)",
        animation: "fadeInDown 200ms ease",
      }}
    >
      <span style={{ fontSize: 16 }}>◈</span>
      <span>{signal.message ?? `${signal.agent ?? "SYNTHIA"} is reviewing…`}</span>
      <button
        onClick={() => setSignal(null)}
        aria-label="Dismiss"
        style={{ marginLeft: 8, background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 14, padding: 0 }}
      >
        ✕
      </button>
      <style>{`@keyframes fadeInDown { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
