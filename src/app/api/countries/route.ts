import { NextResponse } from "next/server";
import {
  COUNTRIES,
  INDIA_STATES,
  CITIES_BY_STATE,
  BIDAR_TOWNS,
  EXAMPLES,
  APPLIANCES,
  HABIT_TAGS,
} from "@/lib/eco/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      countries: COUNTRIES,
      indiaStates: INDIA_STATES,
      citiesByState: CITIES_BY_STATE,
      bidarTowns: BIDAR_TOWNS,
      examples: EXAMPLES,
      appliances: APPLIANCES,
      habitTags: HABIT_TAGS,
    });
  } catch (err) {
    console.error("countries error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
