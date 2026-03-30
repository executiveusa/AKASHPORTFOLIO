"use client";
/**
 * Onboarding page — SYNTHIA™ 3.0 Cockpit
 * Hooked Framework: Trigger → Action → Variable Reward → Investment
 * Anti-chatbot design: ALEX™ guides as strategic partner, not bot.
 */
import { useState } from "react";
import Link from "next/link";
import AlexChat from "@/components/AlexChat";

const STEPS = [
  {
    id: "trigger",
    index: 0,
    phase: "GATILLO",
    title: "Has llegado al núcleo",
    body: "Esto no es un tutorial. Es tu primer día como directora de operaciones de un equipo de 9 agentes.",
    action: "¿Quién soy yo?",
  },
  {
    id: "identity",
    index: 1,
    phase: "IDENTIDAD",
    title: "Tu equipo ya está operando",
    body: "ALEX™ (Chief Advisor), CAZADORA™ (prospectora), FORJADORA™ (sistemas), DR. ECONOMÍA (finanzas) y 5 más. Cada una trabaja 24/7 para Kupuri Media.",
    action: "¿Qué pueden hacer?",
  },
  {
    id: "action",
    index: 2,
    phase: "ACCIÓN",
    title: "Tres cosas que puedes hacer ahora",
    body: "1. Convocar una reunión del Consejo\n2. Asignar una tarea a CAZADORA™\n3. Hablar con ALEX™ en tiempo real",
    action: "Empieza a usar el sistema",
  },
  {
    id: "reward",
    index: 3,
    phase: "RECOMPENSA",
    title: "El sistema aprende de ti",
    body: "Cada acción que tomas alimenta el Vibe Graph™. Las esferas ajustan sus prioridades según tu ritmo de trabajo, no al revés.",
    action: "Ver el Consejo →",
    href: "/cockpit/spheres",
  },
  {
    id: "invest",
    index: 4,
    phase: "INVERSIÓN",
    title: "Configura tu primera operación",
    body: "Habla con ALEX™ ahora mismo. Dile qué es lo más importante para Kupuri Media esta semana.",
    action: "Activar ALEX™",
    openChat: true,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const current = STEPS[step];

  const advance = () => {
    if (current.openChat) {
      setChatOpen(true);
      return;
    }
    if (current.href) {
      return; // handled by Link below
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ color: "var(--color-gold-400)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Onboarding completo
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--color-cream-100)", lineHeight: 1.25, marginBottom: 12 }}>
          El Consejo está listo
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-cream-400)", lineHeight: 1.6, marginBottom: 32 }}>
          Todas las esferas están activas. ALEX™ está disponible en la esquina inferior derecha cuando la necesites.
        </p>
        <Link
          href="/cockpit"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "var(--color-gold-400)",
            color: "var(--color-charcoal-900)",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Ir al Cockpit →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", minHeight: "60vh", position: "relative" }}>
      {/* Step progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            style={{
              height: 2,
              flex: 1,
              background: i <= step ? "var(--color-gold-400)" : "var(--color-charcoal-600)",
              borderRadius: 1,
              transition: "background 200ms",
            }}
          />
        ))}
      </div>

      {/* Phase label */}
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--color-gold-400)", textTransform: "uppercase", marginBottom: 12 }}>
        {current.phase}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--color-cream-100)", lineHeight: 1.25, marginBottom: 16 }}>
        {current.title}
      </h1>

      {/* Body */}
      <p style={{ fontSize: 14, color: "var(--color-cream-400)", lineHeight: 1.7, marginBottom: 40, whiteSpace: "pre-line" }}>
        {current.body}
      </p>

      {/* CTA */}
      {current.href ? (
        <Link
          href={current.href}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            border: "1px solid var(--color-gold-400)",
            color: "var(--color-gold-400)",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          {current.action}
        </Link>
      ) : (
        <button
          onClick={advance}
          style={{
            padding: "10px 20px",
            border: "1px solid var(--color-gold-400)",
            background: "transparent",
            color: "var(--color-gold-400)",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {current.action}
        </button>
      )}

      {/* Skip */}
      {step < STEPS.length - 1 && (
        <button
          onClick={() => setDone(true)}
          style={{
            display: "block",
            marginTop: 24,
            fontSize: 12,
            color: "var(--color-cream-600)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Saltar introducción
        </button>
      )}

      {/* ALEX™ Chat overlay */}
      {chatOpen && <AlexChat onClose={() => setChatOpen(false)} />}
    </div>
  );
}
