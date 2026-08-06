import { NextResponse } from "next/server";
import type { CountryCode } from "@/types";
import { CARBON_PRICE_DEFAULT, USD_CONVERSION, CARBON_INTENSITY } from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES = new Set(Object.keys(CARBON_INTENSITY));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    if (!location || !VALID_COUNTRIES.has(location)) {
      // No valid location → return the USD default carbon price
      return NextResponse.json(CARBON_PRICE_DEFAULT);
    }

    const code = location as CountryCode;
    const conversion = USD_CONVERSION[code];

    // If a USD conversion factor exists for this country, localize the price.
    // Otherwise fall back to the USD default.
    const localizedPrice = conversion
      ? Math.round(CARBON_PRICE_DEFAULT * conversion * 100) / 100
      : CARBON_PRICE_DEFAULT;

    return NextResponse.json(localizedPrice);
  } catch (err) {
    console.error("carbon-price error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
