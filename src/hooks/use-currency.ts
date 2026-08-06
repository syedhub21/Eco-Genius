"use client";

import { useEcoStore } from "@/store/eco-store";
import { getCountry } from "@/lib/eco/data";
import type { CountryCode } from "@/types";

/**
 * Returns the currency symbol + electricity rate for the currently-selected
 * country in the wizard. Components across the app use this so every monetary
 * value reflects the user's chosen location — no more hardcoded `$`.
 */
export function useCurrency() {
  const location = useEcoStore((s) => s.location) as CountryCode;
  const country = getCountry(location);
  return {
    symbol: country.currencySymbol,
    rate: country.electricityRate,
    code: country.code,
    name: country.name,
    flag: country.flag,
    flagUrl: country.flagUrl,
  };
}

/** Format a numeric amount with the given currency symbol + locale grouping. */
export function formatCurrency(symbol: string, amount: number): string {
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}
