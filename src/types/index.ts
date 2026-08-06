// Shared TypeScript types for Eco-Genius v2.0

export type CountryCode =
  | "US" | "IN" | "DE" | "FR" | "BR" | "CA" | "AU" | "JP" | "GB" | "IT"
  | "MX" | "ZA" | "KR" | "ES" | "SE" | "CN" | "RU" | "AR" | "EG" | "NG"
  | "NO" | "IS" | "NZ" | "CH" | "FI" | "DK" | "NL" | "BE" | "AT" | "PL";

export type RenewableLevel = "excellent" | "good" | "moderate" | "low";

export interface RenewablePotential {
  solar: RenewableLevel;
  wind: RenewableLevel;
  hydro: RenewableLevel;
}

export interface CountryMeta {
  code: CountryCode;
  name: string;
  flag: string;
  flagUrl: string; // flag image URL (renders on all OSes)
  carbonIntensity: number; // gCO2 per kWh
  currencySymbol: string;
  electricityRate: number; // per kWh in local currency
  renewable: RenewablePotential;
  nationalAvgKwh: number; // monthly average household consumption
  coords: [number, number]; // [lat, lon]
}

export interface Appliance {
  id: string;
  name: string;
  icon: string;
  wattage: number; // watts
  category: "cooling" | "heating" | "kitchen" | "laundry" | "electronics" | "lighting" | "transport" | "water";
  indiaOnly?: boolean;
}

export interface SelectedAppliance {
  id: string;
  hoursPerDay: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

// ---- Analysis request/response ----

export interface AnalyzeRequest {
  location: CountryCode;
  state?: string;
  city?: string;
  town?: string;
  dailyHours: number;
  habits: string;
  appliances: SelectedAppliance[];
  habitTags?: string[];
}

export interface CarbonEquivalents {
  flights: number; // NYC->LA round trips
  drivingKm: number;
  phoneCharges: number; // years of phone charging
  smartphonesCharged: number;
}

export interface ActionPlanItem {
  day: number;
  title: string;
  description: string;
  icon: string;
  category: "monitor" | "cooling" | "heating" | "appliance" | "transport" | "renewable" | "review";
}

export interface EfficiencyTip {
  text: string;
  priority: "high" | "medium" | "low";
  category: string;
}

export interface ChartData {
  applianceBreakdown: { name: string; value: number; color: string }[];
  monthlyProjection: { month: string; cost: number; savings: number }[];
  renewableRadar: { metric: string; value: number; fullMark: number }[];
}

export interface AnalysisResult {
  carbonFootprintKg: number;
  treesNeeded: number;
  annualSavings: string;
  paybackPeriod: string;
  monthlyKwh: number;
  annualCost: number;
  grade: string; // A+ ... F
  gradeScore: number; // 0-100
  gradeColor: string;
  profileTags: string[];
  habitsSummary: string;
  carbonEquivalents: CarbonEquivalents;
  actionPlan: ActionPlanItem[];
  renewableRecommendations: string[];
  efficiencyTips: EfficiencyTip[];
  chartData: ChartData;
  comparison: { you: number; national: number; global: number };
}

// ---- Estimators ----

export interface SolarEstimate {
  totalCost: string;
  annualSavings: string;
  systemSizeKw: number;
  paybackYears: number;
  co2OffsetKg: number;
  panels: number;
}

export interface WindEstimate {
  totalCost: string;
  annualEnergyKwh: number;
  annualSavings: string;
  paybackYears: number;
  co2OffsetKg: number;
}

export interface HydroEstimate {
  systemSizeKw: number;
  totalCost: string;
  annualEnergyKwh: number;
  annualSavings: string;
  paybackYears: number;
  co2OffsetKg: number;
}

// ---- Achievements ----

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
