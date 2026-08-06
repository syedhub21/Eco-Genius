import { NextResponse } from "next/server";
import type { CountryCode } from "@/types";
import { getWeather } from "@/lib/eco/weather";
import { CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    if (!location || !VALID_COUNTRIES.has(location)) {
      // Invalid/missing location — return empty object gracefully
      return NextResponse.json({});
    }

    const weather = await getWeather(location as CountryCode);
    return NextResponse.json(weather ?? {});
  } catch (err) {
    console.error("weather error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
