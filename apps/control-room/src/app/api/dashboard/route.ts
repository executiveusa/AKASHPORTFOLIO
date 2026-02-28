import { NextResponse } from "next/server";

import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function GET() {
    const snapshot = getDashboardSnapshot();

    return NextResponse.json(snapshot, {
        status: 200,
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
