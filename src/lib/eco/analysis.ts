import type {
  AnalyzeRequest,
  AnalysisResult,
  ActionPlanItem,
  EfficiencyTip,
  CarbonEquivalents,
  ChartData,
  CountryCode,
} from "@/types";
import {
  CARBON_INTENSITY,
  CURRENCY_SYMBOL,
  ELECTRICITY_RATE,
  RENEWABLE_POTENTIAL,
  NATIONAL_AVG_KWH,
  GLOBAL_AVG_KWH,
  getAppliance,
  getCountry,
  ENERGY_TIPS,
  BIDAR_TOWNS,
} from "./data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const APPLIANCE_COLORS: Record<string, string> = {
  cooling: "#22d3ee",
  heating: "#f97316",
  kitchen: "#a3e635",
  laundry: "#e879f9",
  electronics: "#818cf8",
  lighting: "#facc15",
  transport: "#34d399",
  water: "#60a5fa",
};

/** Map a renewable potential level to a 0-100 score. */
function levelScore(level: string): number {
  switch (level) {
    case "excellent": return 95;
    case "good": return 75;
    case "moderate": return 55;
    case "low": return 25;
    default: return 50;
  }
}

/** Map a renewable level to a color. */
function levelColor(level: string): string {
  switch (level) {
    case "excellent": return "#22c55e";
    case "good": return "#84cc16";
    case "moderate": return "#facc15";
    case "low": return "#f97316";
    default: return "#94a3b8";
  }
}

/** Generate an A+ to F efficiency grade from a 0-100 score. */
function gradeFromScore(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A+", color: "#22c55e" };
  if (score >= 80) return { grade: "A", color: "#84cc16" };
  if (score >= 70) return { grade: "B", color: "#a3e635" };
  if (score >= 60) return { grade: "C", color: "#facc15" };
  if (score >= 50) return { grade: "D", color: "#f97316" };
  if (score >= 35) return { grade: "E", color: "#fb923c" };
  return { grade: "F", color: "#ef4444" };
}

/** Calculate carbon equivalents for the given monthly carbon (kg). */
function carbonEquivalents(monthlyCarbonKg: number): CarbonEquivalents {
  // Reference points
  const NYC_LA_FLIGHT_KG = 350; // round trip per person
  const DRIVING_KM_PER_KG = 8; // ~8 km driven per kg CO2 (roughly 125g/km)
  const PHONE_CHARGE_KG = 0.0045; // kg per full phone charge
  const annual = monthlyCarbonKg * 12;
  return {
    flights: Math.round(annual / NYC_LA_FLIGHT_KG),
    drivingKm: Math.round(annual * DRIVING_KM_PER_KG),
    phoneCharges: Math.round(annual / PHONE_CHARGE_KG),
    smartphonesCharged: Math.round(monthlyCarbonKg / PHONE_CHARGE_KG),
  };
}

/** Build a context-aware 30-day action plan. */
function buildActionPlan(
  req: AnalyzeRequest,
  hasAppliance: (id: string) => boolean,
  loc: CountryCode,
  town?: string,
): ActionPlanItem[] {
  const plan: ActionPlanItem[] = [
    { day: 1, title: "Install a smart energy monitor", description: "Track real-time consumption to find hidden waste. Most homes cut 5-10% just by measuring.", icon: "📊", category: "monitor" },
  ];

  if (hasAppliance("ac")) {
    plan.push({ day: 3, title: "Service AC filters", description: "Clean or replace filters — dirty filters waste 5-15% of cooling energy.", icon: "🧹", category: "cooling" });
    plan.push({ day: 7, title: "Raise AC setpoint to 25°C", description: "Each degree above 22°C saves 6% on cooling costs.", icon: "🌡️", category: "cooling" });
  }

  if (hasAppliance("heater") || hasAppliance("waterheater") || hasAppliance("geyser")) {
    plan.push({ day: 5, title: "Lower water heater to 60°C", description: "Insulate the tank and pipes — save 7-16% on water heating.", icon: "♨️", category: "heating" });
  }

  if (hasAppliance("ev")) {
    plan.push({ day: 10, title: "Schedule EV off-peak charging", description: "Shift charging to 10PM-6AM for lower tariffs and grid stability.", icon: "🔌", category: "transport" });
  }

  if (hasAppliance("fridge")) {
    plan.push({ day: 12, title: "Optimize refrigerator", description: "Set to 4°C, keep it 2/3 full, and vacuum coils every 6 months.", icon: "🧊", category: "appliance" });
  }

  if (hasAppliance("washing")) {
    plan.push({ day: 15, title: "Switch to cold-water washes", description: "90% of washing machine energy heats water. Cold wash cleans most loads.", icon: "🧺", category: "appliance" });
  }

  plan.push({ day: 18, title: "Audit standby power", description: "Unplug devices or use smart strips — phantom loads cost 5-10% of bills.", icon: "⚡", category: "appliance" });

  if (loc === "IN") {
    plan.push({ day: 20, title: "Check PM Surya Ghar scheme", description: "Indian households can get up to 300 free solar units/month via subsidy.", icon: "☀️", category: "renewable" });
  }

  const pot = RENEWABLE_POTENTIAL[loc];
  if (pot.solar === "excellent" || pot.solar === "good") {
    plan.push({ day: 23, title: "Get a rooftop solar quote", description: `Your area has ${pot.solar} solar potential — payback in 4-7 years.`, icon: "🔆", category: "renewable" });
  }
  if (pot.wind === "excellent") {
    plan.push({ day: 25, title: "Assess micro-wind feasibility", description: "Excellent wind resource — a small turbine could cover 20-40% of use.", icon: "💨", category: "renewable" });
  }

  if (town && BIDAR_TOWNS.includes(town)) {
    plan.push({ day: 22, title: `Bidar solar opportunity (${town})`, description: "Bidar receives 5.5+ kWh/m²/day — top-tier solar irradiance in Karnataka.", icon: "🌞", category: "renewable" });
  }

  plan.push({ day: 28, title: "Switch remaining bulbs to LED", description: "LEDs use 75% less energy and last 25x longer than incandescent.", icon: "💡", category: "appliance" });
  plan.push({ day: 30, title: "Review monthly bill & set targets", description: "Compare against baseline. Aim for 15% reduction next month.", icon: "📋", category: "review" });

  return plan.sort((a, b) => a.day - b.day);
}

/** Build contextual efficiency tips based on appliances, habits, and location. */
function buildTips(req: AnalyzeRequest, hasAppliance: (id: string) => boolean): EfficiencyTip[] {
  const tips: EfficiencyTip[] = [];
  const habitLower = req.habits.toLowerCase();

  if (hasAppliance("ac") || habitLower.includes("ac") || habitLower.includes("cool")) {
    ENERGY_TIPS.ac.slice(0, 2).forEach((t) => tips.push({ text: t, priority: "high", category: "Cooling" }));
  }
  if (hasAppliance("ev") || habitLower.includes("ev") || habitLower.includes("tesla")) {
    ENERGY_TIPS.ev.slice(0, 1).forEach((t) => tips.push({ text: t, priority: "medium", category: "EV" }));
  }
  if (hasAppliance("heater") || habitLower.includes("heat")) {
    ENERGY_TIPS.heating.slice(0, 1).forEach((t) => tips.push({ text: t, priority: "high", category: "Heating" }));
  }
  if (hasAppliance("laptop") || hasAppliance("pc") || habitLower.includes("wfh") || habitLower.includes("office")) {
    ENERGY_TIPS.office.slice(0, 1).forEach((t) => tips.push({ text: t, priority: "medium", category: "Office" }));
  }

  // Always include lighting + appliances tip
  tips.push({ text: ENERGY_TIPS.lighting[0], priority: "medium", category: "Lighting" });
  tips.push({ text: ENERGY_TIPS.appliances[0], priority: "low", category: "Appliances" });

  // Dedupe by text
  const seen = new Set<string>();
  return tips.filter((t) => {
    if (seen.has(t.text)) return false;
    seen.add(t.text);
    return true;
  }).slice(0, 6);
}

/** Main analysis function — pure, server-safe. */
export function analyze(req: AnalyzeRequest): AnalysisResult {
  const loc = req.location;
  const country = getCountry(loc);
  const ci = CARBON_INTENSITY[loc] ?? 450;
  const rate = ELECTRICITY_RATE[loc] ?? 0.15;
  const currency = CURRENCY_SYMBOL[loc] ?? "$";

  const selectedIds = new Set(req.appliances.map((a) => a.id));
  const hasAppliance = (id: string) => selectedIds.has(id);

  // ---- Compute monthly kWh from appliances ----
  let monthlyKwh = 0;
  const breakdown: { name: string; value: number; color: string }[] = [];

  for (const sel of req.appliances) {
    const app = getAppliance(sel.id);
    if (!app) continue;
    const dailyKwh = (app.wattage * sel.hoursPerDay) / 1000;
    const monthKwh = dailyKwh * 30;
    monthlyKwh += monthKwh;
    breakdown.push({
      name: app.name,
      value: Math.round(monthKwh * 10) / 10,
      color: APPLIANCE_COLORS[app.category] ?? "#94a3b8",
    });
  }

  // If no appliances selected, fall back to a load estimate from hours + habits
  if (monthlyKwh === 0) {
    let avgLoadKw = 0.5;
    const habitLower = req.habits.toLowerCase();
    if (habitLower.includes("ac") || habitLower.includes("cool")) avgLoadKw += 1.5;
    if (habitLower.includes("heat") || habitLower.includes("heater")) avgLoadKw += 1.5;
    if (habitLower.includes("ev") || habitLower.includes("tesla")) avgLoadKw += 2.0;
    if (habitLower.includes("wfh") || habitLower.includes("computer") || habitLower.includes("laptop")) avgLoadKw += 0.2;
    monthlyKwh = req.dailyHours * 30 * avgLoadKw;
    breakdown.push({ name: "Estimated Load", value: Math.round(monthlyKwh), color: "#818cf8" });
  }

  // Sort breakdown descending by value
  breakdown.sort((a, b) => b.value - a.value);

  // ---- Carbon footprint ----
  const carbonKg = Math.round((monthlyKwh * ci) / 1000 * 100) / 100;
  const treesNeeded = Math.round((carbonKg * 12) / 21); // annual CO2 / 21kg per tree per year

  // ---- Costs & savings ----
  const annualCost = monthlyKwh * 12 * rate;
  const potentialSavings = annualCost * 0.30;

  // ---- Grade scoring (lower carbon = better grade) ----
  // Compare monthly carbon per kWh against a baseline. Score reflects efficiency.
  const carbonPerKwh = monthlyKwh > 0 ? carbonKg / monthlyKwh : 0;
  const nationalAvg = NATIONAL_AVG_KWH[loc] ?? 300;
  // Score starts at 100, deducts for over-consumption relative to national avg,
  // and for high carbon intensity grids.
  const usageRatio = monthlyKwh / nationalAvg; // 1.0 = avg, <1 good, >1 bad
  const gridPenalty = Math.min(40, carbonPerKwh / 12); // high-carbon grids cap bonus
  let score = 100 - (usageRatio - 0.5) * 60 - gridPenalty * 0.5;
  score = Math.max(5, Math.min(100, Math.round(score)));
  const { grade, color: gradeColor } = gradeFromScore(score);

  // ---- Payback ----
  const pot = RENEWABLE_POTENTIAL[loc];
  const hasRenewable = pot.solar === "excellent" || pot.solar === "good";
  const paybackPeriod = hasRenewable ? "4-7" : "1-3";

  // ---- Profile tags ----
  const profileTags: string[] = [`${country.flag} ${country.name}`];
  const habitLower = req.habits.toLowerCase();
  if (hasAppliance("ac") || habitLower.includes("ac")) profileTags.push("❄️ Heavy Cooling");
  if (hasAppliance("heater") || habitLower.includes("heat")) profileTags.push("🔥 Electric Heating");
  if (hasAppliance("ev") || habitLower.includes("ev")) profileTags.push("🚗 EV Owner");
  if (hasAppliance("laptop") || hasAppliance("pc") || habitLower.includes("wfh") || habitLower.includes("office")) profileTags.push("💻 Remote Worker");
  if (req.habitTags?.includes("Solar Already")) profileTags.push("☀️ Solar Adopter");
  if (req.habitTags?.includes("Smart Home")) profileTags.push("🏠 Smart Home");
  if (req.town && BIDAR_TOWNS.includes(req.town)) profileTags.push(`📍 ${req.town}`);

  // ---- Carbon equivalents ----
  const equivalents = carbonEquivalents(carbonKg);

  // ---- Action plan & tips ----
  const actionPlan = buildActionPlan(req, hasAppliance, loc, req.town);
  const tips = buildTips(req, hasAppliance);

  // ---- Renewable recommendations ----
  const renewables: string[] = [];
  const levelEmoji: Record<string, string> = { excellent: "🌟", good: "✅", moderate: "⚠️", low: "🔻" };
  renewables.push(`☀️ Solar: ${levelEmoji[pot.solar]} ${pot.solar.charAt(0).toUpperCase() + pot.solar.slice(1)} potential`);
  renewables.push(`💨 Wind: ${levelEmoji[pot.wind]} ${pot.wind.charAt(0).toUpperCase() + pot.wind.slice(1)} potential`);
  renewables.push(`💧 Hydro: ${levelEmoji[pot.hydro]} ${pot.hydro.charAt(0).toUpperCase() + pot.hydro.slice(1)} potential`);

  if (pot.solar === "excellent") {
    renewables.push("🔋 Rooftop solar highly recommended — strong ROI in your region.");
  }

  // ---- Chart data ----
  const chartData: ChartData = {
    applianceBreakdown: breakdown,
    monthlyProjection: MONTHS.map((m, i) => {
      // seasonal variation: more cooling in summer, heating in winter
      const seasonalFactor = 1 + 0.15 * Math.sin(((i - 5) / 12) * 2 * Math.PI);
      return {
        month: m,
        cost: Math.round(monthlyKwh * rate * seasonalFactor),
        savings: Math.round(monthlyKwh * rate * seasonalFactor * 0.3),
      };
    }),
    renewableRadar: [
      { metric: "Solar", value: levelScore(pot.solar), fullMark: 100 },
      { metric: "Wind", value: levelScore(pot.wind), fullMark: 100 },
      { metric: "Hydro", value: levelScore(pot.hydro), fullMark: 100 },
      { metric: "Grid Clean", value: Math.max(5, 100 - ci / 8.5), fullMark: 100 },
      { metric: "Incentives", value: loc === "IN" ? 80 : loc === "DE" ? 90 : 60, fullMark: 100 },
    ],
  };

  const habitsSummary = `Based on ${req.dailyHours}h avg daily usage across ${req.appliances.length || "estimated"} appliance${req.appliances.length === 1 ? "" : "s"} and detected habits.`;

  return {
    carbonFootprintKg: carbonKg,
    treesNeeded,
    annualSavings: `${currency}${Math.round(potentialSavings).toLocaleString()}`,
    paybackPeriod,
    monthlyKwh: Math.round(monthlyKwh),
    annualCost: Math.round(annualCost),
    grade,
    gradeScore: score,
    gradeColor,
    profileTags,
    habitsSummary,
    carbonEquivalents: equivalents,
    actionPlan,
    renewableRecommendations: renewables,
    efficiencyTips: tips,
    chartData,
    comparison: {
      you: Math.round(monthlyKwh),
      national: nationalAvg,
      global: GLOBAL_AVG_KWH,
    },
  };
}
