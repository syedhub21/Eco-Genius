import { NextResponse } from "next/server";
import type { CountryCode } from "@/types";
import { estimateHydro } from "@/lib/eco/calculations";
import { CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

interface HydroRequestBody {
  location?: unknown;
  flow_rate_lps?: unknown;
  head_height_m?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { location, flow_rate_lps, head_height_m } = body as HydroRequestBody;

    if (
      !location ||
      typeof location !== "string" ||
      !VALID_COUNTRIES.has(location)
    ) {
      return NextResponse.json({ error: "Missing or invalid 'location'" }, { status: 400 });
    }

    if (
      typeof flow_rate_lps !== "number" ||
      !Number.isFinite(flow_rate_lps) ||
      flow_rate_lps <= 0
    ) {
      return NextResponse.json(
        { error: "'flow_rate_lps' must be a positive number" },
        { status: 400 },
      );
    }

    if (
      typeof head_height_m !== "number" ||
      !Number.isFinite(head_height_m) ||
      head_height_m <= 0
    ) {
      return NextResponse.json(
        { error: "'head_height_m' must be a positive number" },
        { status: 400 },
      );
    }

    const estimate = estimateHydro(
      location as CountryCode,
      flow_rate_lps,
      head_height_m,
    );
    return NextResponse.json(estimate);
  } catch (err) {
    console.error("hydro-estimate error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
