import Stripe from "stripe";

function createStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[stripe] STRIPE_SECRET_KEY not set — Stripe disabled");
    }
    return null;
  }
  return new Stripe(key, { apiVersion: "2026-02-25.clover", typescript: true });
}

export const stripe = createStripeClient();

// ── Product / Price catalog ────────────────────────────────────────────────
export const PLANS = {
  lector: {
    id: "lector",
    name: "Lector",
    description: "Acceso de lectura al directorio Kupuri™",
    priceMonthlyUsd: 0,
    priceId: null, // free tier — no Stripe price
    features: [
      "Acceso completo al directorio",
      "Búsqueda avanzada",
      "Guardar favoritos",
      "Newsletter mensual",
    ],
    color: "#22c55e",
  },
  creador: {
    id: "creador",
    name: "Creador",
    description: "Publica tu negocio en el directorio",
    priceMonthlyUsd: 9.99,
    // Set via env: STRIPE_PRICE_CREADOR_MONTHLY
    priceId: process.env.STRIPE_PRICE_CREADOR_MONTHLY ?? null,
    features: [
      "Todo lo de Lector",
      "1 ficha de negocio activa",
      "Panel de estadísticas",
      "Acceso a la comunidad",
    ],
    color: "#d4af37",
  },
  empresario: {
    id: "empresario",
    name: "Empresario",
    description: "Presencia premium ilimitada",
    priceMonthlyUsd: 29.99,
    // Set via env: STRIPE_PRICE_EMPRESARIO_MONTHLY
    priceId: process.env.STRIPE_PRICE_EMPRESARIO_MONTHLY ?? null,
    features: [
      "Todo lo de Creador",
      "Fichas de negocio ilimitadas",
      "Posicionamiento destacado",
      "Soporte prioritario",
      "API de integración",
    ],
    color: "#8b5cf6",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(id: string): (typeof PLANS)[PlanId] | null {
  if (id in PLANS) return PLANS[id as PlanId];
  return null;
}
