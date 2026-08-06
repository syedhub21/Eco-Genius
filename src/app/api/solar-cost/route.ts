import { NextResponse } from "next/server";
import type { CountryCode } from "@/types";
import { estimateSolar } from "@/lib/eco/calculations";
import { CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

interface SolarRequestBody {
  location?: unknown;
  roof_size_sqft?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { location, roof_size_sqft } = body as SolarRequestBody;

    if (
      !location ||
      typeof location !== "string" ||
      !VALID_COUNTRIES.has(location)
    ) {
      return NextResponse.json({ error: "Missing or invalid 'location'" }, { status: 400 });
    }

    if (
      typeof roof_size_sqft !== "number" ||
      !Number.isFinite(roof_size_sqft) ||
      roof_size_sqft <= 0
    ) {
      return NextResponse.json(
        { error: "'roof_size_sqft' must be a positive number" },
        { status: 400 },
      );
    }

    const estimate = estimateSolar(location as CountryCode, roof_size_sqft);
    return NextResponse.json(estimate);
  } catch (err) {
    console.error("solar-cost error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
