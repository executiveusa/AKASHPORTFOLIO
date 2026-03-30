import { NextRequest, NextResponse } from "next/server";

/**
 * GET  /api/panorama/expenses — list expenses
 * POST /api/panorama/expenses — create expense
 */
export const dynamic = "force-dynamic";

// In-memory store for MVP (replace with Supabase once schema is applied)
const EXPENSES: Array<{
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  vendor: string;
  category_mx: string;
  category_us: string;
  jurisdiction: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    ok: true,
    expenses: EXPENSES.slice().reverse(),
    total: EXPENSES.reduce((s, e) => s + e.amount, 0),
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.amount || !body.vendor) {
    return NextResponse.json({ error: "amount and vendor required" }, { status: 422 });
  }

  const expense = {
    id: crypto.randomUUID(),
    amount: Number(body.amount),
    currency: String(body.currency ?? "MXN"),
    payment_method: String(body.payment_method ?? "Efectivo"),
    vendor: String(body.vendor),
    category_mx: String(body.category_mx ?? "Otros"),
    category_us: String(body.category_us ?? "Other"),
    jurisdiction: String(body.jurisdiction ?? "MX"),
    notes: body.notes ? String(body.notes) : undefined,
    receipt_url: body.receipt_url ? String(body.receipt_url) : undefined,
    created_at: new Date().toISOString(),
  };

  EXPENSES.push(expense);

  return NextResponse.json({ ok: true, expense }, { status: 201 });
}
