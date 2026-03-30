import { NextResponse } from "next/server";
import { getRevenueSnapshot, getActiveStrategies, dailyRevenueScan } from "@/lib/revenue-agent";

/**
 * GET /api/revenue — Revenue snapshot + strategies
 */
export async function GET() {
  try {
    const snapshot = await getRevenueSnapshot();
    const strategies = getActiveStrategies();
    return NextResponse.json({ snapshot, strategies });
  } catch (error) {
    console.error("[revenue] Failed to get snapshot:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/revenue — Trigger daily revenue scan
 */
export async function POST() {
  try {
    const result = await dailyRevenueScan();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[revenue] Scan failed:", error);
    return NextResponse.json(
      { error: "Revenue scan failed" },
      { status: 500 }
    );
  }
}
