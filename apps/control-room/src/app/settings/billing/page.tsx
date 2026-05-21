"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { BillingUsage } from "@/components/synthia/BillingUsage";

export default function BillingSettingsPage() {
  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 8 }}>Facturación y Uso</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
        Monitorea el consumo de tu plan y gestiona métodos de pago.
      </p>
      <BillingUsage />
    </AppShell>
  );
}
