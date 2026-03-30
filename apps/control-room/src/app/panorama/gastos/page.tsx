"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Jurisdiction = "MX" | "US";

interface Expense {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  vendor: string;
  category_mx: string;
  category_us: string;
  jurisdiction: string;
  notes?: string;
  created_at: string;
}

const PAYMENT_METHODS = [
  "MercadoPago", "OXXO", "SPEI", "Transferencia BBVA", "Transferencia BANORTE",
  "Efectivo", "Tarjeta de crédito", "Stripe", "PayPal", "Bitcoin/Lightning",
  "MXNB", "Creem.io", "BAC Baco",
];

const CATEGORIES_MX = [
  "Honorarios", "Servicios profesionales", "Publicidad y marketing",
  "Software y tecnología", "Renta", "Viáticos", "Papelería", "Otros",
];

const CATEGORIES_US = [
  "Professional Services", "Advertising", "Software/SaaS", "Rent",
  "Travel & Entertainment", "Office Supplies", "Utilities", "Other",
];

// ─── Components ───────────────────────────────────────────────────────────────

function JurisdictionToggle({ value, onChange }: { value: Jurisdiction; onChange: (v: Jurisdiction) => void }) {
  return (
    <div style={{ display: "flex", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 3, gap: 3 }}>
      {(["MX", "US"] as const).map((j) => (
        <button
          key={j}
          onClick={() => onChange(j)}
          style={{ flex: 1, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: value === j ? (j === "MX" ? "#c0392b" : "#1d4ed8") : "transparent", color: value === j ? "#fff" : "var(--color-muted)", transition: "all 150ms" }}
        >
          {j === "MX" ? "🇲🇽 México (SAT)" : "🇺🇸 USA (IRS)"}
        </button>
      ))}
    </div>
  );
}

function ExpenseRow({ expense, jurisdiction }: { expense: Expense; jurisdiction: Jurisdiction }) {
  const category = jurisdiction === "MX" ? expense.category_mx : expense.category_us;
  const date = new Date(expense.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{expense.vendor}</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{category} · {expense.payment_method}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
          {expense.currency} {expense.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{date}</div>
      </div>
    </div>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

function AddModal({ jurisdiction, onClose, onSave }: { jurisdiction: Jurisdiction; onClose: () => void; onSave: (e: Partial<Expense>) => void }) {
  const [form, setForm] = useState({ amount: "", vendor: "", payment_method: PAYMENT_METHODS[0], category_mx: CATEGORIES_MX[0], category_us: CATEGORIES_US[0], notes: "" });
  const [uploading, setUploading] = useState(false);
  const [ocrMsg, setOcrMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handlePhoto(file: File) {
    setUploading(true);
    setOcrMsg("Analizando recibo...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/panorama/expenses/ocr", { method: "POST", body: fd });
      if (r.ok) {
        const d = await r.json();
        setForm((f) => ({ ...f, amount: d.amount ?? f.amount, vendor: d.vendor ?? f.vendor }));
        setOcrMsg("✓ Datos extraídos del recibo");
      } else {
        setOcrMsg("No se pudo leer el recibo");
      }
    } catch {
      setOcrMsg("Error al procesar imagen");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (!form.amount || !form.vendor) return;
    onSave({
      amount: parseFloat(form.amount),
      currency: jurisdiction === "MX" ? "MXN" : "USD",
      vendor: form.vendor,
      payment_method: form.payment_method,
      category_mx: form.category_mx,
      category_us: form.category_us,
      notes: form.notes,
      jurisdiction,
      created_at: new Date().toISOString(),
    });
    onClose();
  }

  const inputStyle = { width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 200 }} onClick={onClose}>
      <div style={{ width: "100%", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderRadius: "16px 16px 0 0", padding: 20, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Nuevo gasto</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {/* Photo upload */}
        <div style={{ marginBottom: 14 }}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ width: "100%", padding: "10px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            {uploading ? "Analizando..." : "📷 Fotografiar recibo (OCR)"}
          </button>
          {ocrMsg && <div style={{ fontSize: 11, color: "var(--color-accent)", marginTop: 4 }}>{ocrMsg}</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Monto ({jurisdiction === "MX" ? "MXN" : "USD"})</label>
            <input type="number" placeholder="0.00" value={form.amount} onChange={set("amount")} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Proveedor / Vendor</label>
            <input type="text" placeholder="Nombre del proveedor" value={form.vendor} onChange={set("vendor")} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Método de pago</label>
            <select value={form.payment_method} onChange={set("payment_method")} style={inputStyle}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Categoría {jurisdiction === "MX" ? "SAT" : "IRS"}</label>
            <select value={jurisdiction === "MX" ? form.category_mx : form.category_us} onChange={set(jurisdiction === "MX" ? "category_mx" : "category_us")} style={inputStyle}>
              {(jurisdiction === "MX" ? CATEGORIES_MX : CATEGORIES_US).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Notas</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Descripción opcional" style={{ ...inputStyle, resize: "none" }} />
          </div>
        </div>

        <button
          onClick={submit}
          style={{ width: "100%", marginTop: 16, padding: "12px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Guardar gasto
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GastosPage() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("MX");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panorama/expenses")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.expenses)) setExpenses(d.expenses); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveExpense(data: Partial<Expense>) {
    // Optimistic update
    const temp: Expense = { id: Date.now().toString(), amount: 0, currency: "MXN", vendor: "", payment_method: "", category_mx: "", category_us: "", jurisdiction: "MX", created_at: new Date().toISOString(), ...data };
    setExpenses((e) => [temp, ...e]);
    try {
      await fetch("/api/panorama/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {}
  }

  function exportCSV() {
    const header = "Fecha,Proveedor,Monto,Moneda,Método,Categoría\n";
    const rows = expenses.map((e) => `${e.created_at.slice(0,10)},${e.vendor},${e.amount},${e.currency},${e.payment_method},${jurisdiction === "MX" ? e.category_mx : e.category_us}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gastos-${jurisdiction}-${new Date().toISOString().slice(0,7)}.csv`; a.click();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Gastos</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>Control de egresos</div>
          </div>
          <button onClick={exportCSV} style={{ fontSize: 12, padding: "6px 12px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)", borderRadius: 6, cursor: "pointer" }}>
            Exportar CSV
          </button>
        </div>
        <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />
      </header>

      <main style={{ padding: 16 }}>
        {/* Total */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total este mes</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>
            {jurisdiction === "MX" ? "MXN" : "USD"} {total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Expenses list */}
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--color-muted)", padding: 32, fontSize: 13 }}>Cargando...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--color-muted)", padding: 32, fontSize: 13 }}>
            Sin gastos registrados. Tap + para agregar.
          </div>
        ) : (
          <div>
            {expenses.map((e) => <ExpenseRow key={e.id} expense={e} jurisdiction={jurisdiction} />)}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{ position: "fixed", bottom: 90, right: 20, width: 52, height: 52, borderRadius: "50%", background: "var(--color-accent)", color: "#fff", border: "none", fontSize: 24, cursor: "pointer", boxShadow: "0 4px 16px rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        +
      </button>

      {showAdd && <AddModal jurisdiction={jurisdiction} onClose={() => setShowAdd(false)} onSave={saveExpense} />}
    </div>
  );
}
