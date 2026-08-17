import { NextRequest, NextResponse } from "next/server";
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

/**
 * GET  /api/panorama/expenses — list expenses
 * POST /api/panorama/expenses — create expense
 *
 * Persistence: Supabase (panorama_expenses table) when configured; falls back
 * to an in-memory store when SUPABASE_URL is unset. Run
 * supabase/migrations/011_panorama_projects.sql to enable persistence.
 */
export const dynamic = "force-dynamic";

// In-memory fallback store (non-canonical; used only when Supabase is unconfigured)
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

async function getExpensesTable() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-client');
    const probe = await supabaseAdmin.from('panorama_expenses').select('id').limit(1);
    if (probe.error) return null;
    return supabaseAdmin;
  } catch {
    return null;
  }
}

export async function GET() {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  const db = await getExpensesTable();
  if (db) {
    const { data, error } = await db.from('panorama_expenses')
      .select('*').order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: 'DB_QUERY_FAILED', detail: error.message }, { status: 500 });
    }
    const rows = data ?? [];
    return NextResponse.json({
      ok: true,
      expenses: rows,
      total: rows.reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0),
      source: 'supabase',
    });
  }
  return NextResponse.json({
    ok: true,
    expenses: EXPENSES.slice().reverse(),
    total: EXPENSES.reduce((s, e) => s + e.amount, 0),
    source: 'memory-fallback',
  });
}

export async function POST(req: NextRequest) {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

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

  const db = await getExpensesTable();
  if (db) {
    const { data, error } = await db.from('panorama_expenses').insert(expense).select().single();
    if (error) {
      return NextResponse.json({ ok: false, error: 'DB_INSERT_FAILED', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, expense: data, source: 'supabase' }, { status: 201 });
  }

  EXPENSES.push(expense);
  return NextResponse.json({ ok: true, expense, source: 'memory-fallback' }, { status: 201 });
}
