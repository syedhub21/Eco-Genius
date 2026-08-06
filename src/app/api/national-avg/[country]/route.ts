import { NextResponse } from "next/server";
import {
  NATIONAL_AVG_KWH,
  GLOBAL_AVG_KWH,
  CURRENCY_SYMBOL,
  ELECTRICITY_RATE,
} from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string }> },
) {
  try {
    const { country } = await params;
    const upper = country.toUpperCase();

    const nationalAvg = NATIONAL_AVG_KWH[upper as keyof typeof NATIONAL_AVG_KWH];

    if (nationalAvg === undefined) {
      return NextResponse.json({ error: "Unknown country" }, { status: 404 });
    }

    const currencySymbol =
      CURRENCY_SYMBOL[upper as keyof typeof CURRENCY_SYMBOL] ?? "$";
    const electricityRate =
      ELECTRICITY_RATE[upper as keyof typeof ELECTRICITY_RATE] ?? 0.14;

    return NextResponse.json({
      country: upper,
      nationalAvg,
      globalAvg: GLOBAL_AVG_KWH,
      currencySymbol,
      electricityRate,
    });
  } catch (err) {
    console.error("national-avg error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
