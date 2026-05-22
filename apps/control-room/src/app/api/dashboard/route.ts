import { NextRequest, NextResponse } from "next/server";
import { requireUser, toErrorResponse } from "@/lib/auth/guards";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function GET(_req: NextRequest) {
    try { await requireUser(); } catch (e) { return toErrorResponse(e); }
    const snapshot = getDashboardSnapshot();

    return NextResponse.json(snapshot, {
        status: 200,
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
