import { NextResponse } from "next/server";
import type { AnalyzeRequest, CountryCode } from "@/types";
import { analyze } from "@/lib/eco/analysis";
import { getOrCreateSession, saveAnalysis } from "@/lib/eco/session";
import { CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      location,
      state,
      city,
      town,
      dailyHours,
      habits,
      appliances,
      habitTags,
    } = body as Partial<AnalyzeRequest> & { appliances?: unknown };

    if (!location || typeof location !== "string" || !VALID_COUNTRIES.has(location)) {
      return NextResponse.json({ error: "Missing or invalid 'location'" }, { status: 400 });
    }

    if (typeof dailyHours !== "number" || !Number.isFinite(dailyHours) || dailyHours <= 0) {
      return NextResponse.json({ error: "'dailyHours' must be a positive number" }, { status: 400 });
    }

    if (!Array.isArray(appliances)) {
      return NextResponse.json({ error: "'appliances' must be an array" }, { status: 400 });
    }

    const cleanAppliances = appliances
      .filter(
        (a): a is { id: string; hoursPerDay: number } =>
          !!a &&
          typeof a === "object" &&
          typeof (a as { id?: unknown }).id === "string" &&
          typeof (a as { hoursPerDay?: unknown }).hoursPerDay === "number" &&
          Number.isFinite((a as { hoursPerDay: number }).hoursPerDay),
      )
      .map((a) => ({ id: a.id, hoursPerDay: a.hoursPerDay }));

    const analyzeReq: AnalyzeRequest = {
      location: location as CountryCode,
      state: typeof state === "string" ? state : undefined,
      city: typeof city === "string" ? city : undefined,
      town: typeof town === "string" ? town : undefined,
      dailyHours,
      habits: typeof habits === "string" ? habits : "",
      appliances: cleanAppliances,
      habitTags: Array.isArray(habitTags)
        ? habitTags.filter((t): t is string => typeof t === "string")
        : undefined,
    };

    const result = analyze(analyzeReq);

    const sessionId = await getOrCreateSession();
    await saveAnalysis(sessionId, {
      location: analyzeReq.location,
      state: analyzeReq.state,
      city: analyzeReq.city,
      town: analyzeReq.town,
      dailyHours: analyzeReq.dailyHours,
      habits: analyzeReq.habits,
      appliancesJson: JSON.stringify(analyzeReq.appliances),
      carbonKg: result.carbonFootprintKg,
      treesNeeded: result.treesNeeded,
      annualSavings: result.annualSavings,
      grade: result.grade,
    });

    return NextResponse.json({ result, sessionId });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
