import { NextResponse } from "next/server";
import type { CountryCode } from "@/types";
import { estimateWind } from "@/lib/eco/calculations";
import { CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

interface WindRequestBody {
  location?: unknown;
  turbine_size_kw?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { location, turbine_size_kw } = body as WindRequestBody;

    if (
      !location ||
      typeof location !== "string" ||
      !VALID_COUNTRIES.has(location)
    ) {
      return NextResponse.json({ error: "Missing or invalid 'location'" }, { status: 400 });
    }

    if (
      typeof turbine_size_kw !== "number" ||
      !Number.isFinite(turbine_size_kw) ||
      turbine_size_kw <= 0
    ) {
      return NextResponse.json(
        { error: "'turbine_size_kw' must be a positive number" },
        { status: 400 },
      );
    }

    const estimate = estimateWind(location as CountryCode, turbine_size_kw);
    return NextResponse.json(estimate);
  } catch (err) {
    console.error("wind-estimate error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
