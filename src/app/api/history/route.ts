import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession } from "@/lib/eco/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionId = await getOrCreateSession();

    // Gracefully return empty history if DB is unavailable (e.g. Netlify)
    let analyses: unknown[] = [];
    try {
      const rows = await db.analysis.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      analyses = rows.map((a) => ({
        id: a.id,
        location: a.location,
        dailyHours: a.dailyHours,
        carbonKg: a.carbonKg,
        treesNeeded: a.treesNeeded,
        grade: a.grade,
        createdAt: a.createdAt,
      }));
    } catch {
      // DB not available — return empty history
    }

    return NextResponse.json({ analyses });
  } catch (err) {
    console.error("history error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
