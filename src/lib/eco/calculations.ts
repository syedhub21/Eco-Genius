import type {
  CountryCode,
  SolarEstimate,
  WindEstimate,
  HydroEstimate,
} from "@/types";
import {
  CURRENCY_SYMBOL,
  ELECTRICITY_RATE,
  CARBON_INTENSITY,
  RENEWABLE_POTENTIAL,
} from "./data";

/** Solar PV estimator. Roof size in sq ft. */
export function estimateSolar(location: CountryCode, roofSizeSqft: number): SolarEstimate {
  const currency = CURRENCY_SYMBOL[location] ?? "$";
  const rate = ELECTRICITY_RATE[location] ?? 0.14;
  const ci = CARBON_INTENSITY[location] ?? 450;
  const pot = RENEWABLE_POTENTIAL[location];

  // ~15W per sqft of panel area
  const systemSizeKw = Math.max(0.5, (roofSizeSqft * 15) / 1000);

  // Cost per watt varies — India cheaper ($0.7/W), US ~$3/W, EU ~$2.5/W
  const costPerWatt =
    location === "IN" ? 0.7 :
    location === "DE" || location === "FR" || location === "IT" || location === "ES" ? 2.5 :
    location === "JP" ? 3.5 : 3.0;
  const totalCost = systemSizeKw * 1000 * costPerWatt;

  // Annual generation depends on solar potential + irradiance factor
  const irradianceFactor =
    pot.solar === "excellent" ? 5.5 :
    pot.solar === "good" ? 4.5 :
    pot.solar === "moderate" ? 3.5 : 2.5;
  const annualEnergyKwh = systemSizeKw * irradianceFactor * 365 * 0.8; // 0.8 performance ratio
  const annualSavings = annualEnergyKwh * rate;
  const paybackYears = annualSavings > 0 ? totalCost / annualSavings : 0;
  const co2Offset = annualEnergyKwh * ci / 1000;
  const panels = Math.ceil(systemSizeKw / 0.4); // 400W panels

  return {
    totalCost: `${currency}${Math.round(totalCost).toLocaleString()}`,
    annualSavings: `${currency}${Math.round(annualSavings).toLocaleString()}`,
    systemSizeKw: Math.round(systemSizeKw * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    co2OffsetKg: Math.round(co2Offset),
    panels,
  };
}

/** Wind turbine estimator. Size in kW. */
export function estimateWind(location: CountryCode, turbineSizeKw: number): WindEstimate {
  const currency = CURRENCY_SYMBOL[location] ?? "$";
  const rate = ELECTRICITY_RATE[location] ?? 0.14;
  const ci = CARBON_INTENSITY[location] ?? 450;
  const pot = RENEWABLE_POTENTIAL[location];

  // Cost per kW installed
  const costPerKw =
    location === "IN" ? 1200 :
    location === "DE" || location === "FR" || location === "DK" ? 2500 :
    3500;
  const totalCost = turbineSizeKw * costPerKw;

  // Capacity factor based on wind potential
  const capacityFactor =
    pot.wind === "excellent" ? 0.35 :
    pot.wind === "good" ? 0.28 :
    pot.wind === "moderate" ? 0.20 : 0.12;
  const annualEnergyKwh = turbineSizeKw * 24 * 365 * capacityFactor;
  const annualSavings = annualEnergyKwh * rate;
  const paybackYears = annualSavings > 0 ? totalCost / annualSavings : 0;
  const co2Offset = annualEnergyKwh * ci / 1000;

  return {
    totalCost: `${currency}${Math.round(totalCost).toLocaleString()}`,
    annualEnergyKwh: Math.round(annualEnergyKwh),
    annualSavings: `${currency}${Math.round(annualSavings).toLocaleString()}`,
    paybackYears: Math.round(paybackYears * 10) / 10,
    co2OffsetKg: Math.round(co2Offset),
  };
}

/** Micro-hydro estimator. Flow in L/s, head in m. */
export function estimateHydro(location: CountryCode, flowLps: number, headM: number): HydroEstimate {
  const currency = CURRENCY_SYMBOL[location] ?? "$";
  const rate = ELECTRICITY_RATE[location] ?? 0.14;
  const ci = CARBON_INTENSITY[location] ?? 450;

  // Power (kW) = 9.81 * Q(m³/s) * H(m) * efficiency
  const systemSizeKw = Math.max(0.1, 9.81 * (flowLps / 1000) * headM * 0.8);
  const costPerKw =
    location === "IN" ? 1500 :
    location === "DE" || location === "FR" || location === "NO" || location === "SE" ? 3500 :
    4000;
  const totalCost = Math.max(2000, systemSizeKw * costPerKw);

  // Hydro runs 24/7 with high capacity factor (0.5 typical)
  const annualEnergyKwh = systemSizeKw * 24 * 365 * 0.5;
  const annualSavings = annualEnergyKwh * rate;
  const paybackYears = annualSavings > 0 ? totalCost / annualSavings : 0;
  const co2Offset = annualEnergyKwh * ci / 1000;

  return {
    systemSizeKw: Math.round(systemSizeKw * 100) / 100,
    totalCost: `${currency}${Math.round(totalCost).toLocaleString()}`,
    annualEnergyKwh: Math.round(annualEnergyKwh),
    annualSavings: `${currency}${Math.round(annualSavings).toLocaleString()}`,
    paybackYears: Math.round(paybackYears * 10) / 10,
    co2OffsetKg: Math.round(co2Offset),
  };
}
