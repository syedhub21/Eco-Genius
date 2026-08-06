"use client";

import { create } from "zustand";
import type { AnalyzeRequest, AnalysisResult, CountryCode } from "@/types";

interface EcoState {
  // Wizard form state
  location: CountryCode;
  state: string;
  city: string;
  town: string;
  dailyHours: number;
  habits: string;
  appliances: { id: string; hoursPerDay: number }[];
  habitTags: string[];

  // Results
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;

  // Actions
  setLocation: (l: CountryCode) => void;
  setStateField: (s: string) => void;
  setCity: (c: string) => void;
  setTown: (t: string) => void;
  setDailyHours: (h: number) => void;
  setHabits: (h: string) => void;
  toggleAppliance: (id: string, wattage?: number) => void;
  updateApplianceHours: (id: string, hours: number) => void;
  toggleHabitTag: (tag: string) => void;
  resetAppliances: () => void;

  setResult: (r: AnalysisResult | null) => void;
  setAnalyzing: (a: boolean) => void;
  setAnalysisError: (e: string | null) => void;

  // Build the API request payload
  buildRequest: () => AnalyzeRequest;
}

export const useEcoStore = create<EcoState>((set, get) => ({
  location: "US",
  state: "",
  city: "",
  town: "",
  dailyHours: 12,
  habits: "",
  appliances: [],
  habitTags: [],

  result: null,
  isAnalyzing: false,
  analysisError: null,

  setLocation: (l) => set({ location: l, state: "", city: "", town: "" }),
  setStateField: (s) => set({ state: s, city: "", town: "" }),
  setCity: (c) => set({ city: c, town: "" }),
  setTown: (t) => set({ town: t }),
  setDailyHours: (h) => set({ dailyHours: h }),
  setHabits: (h) => set({ habits: h }),

  toggleAppliance: (id) =>
    set((s) => {
      const exists = s.appliances.find((a) => a.id === id);
      if (exists) {
        return { appliances: s.appliances.filter((a) => a.id !== id) };
      }
      return {
        appliances: [...s.appliances, { id, hoursPerDay: 4 }],
      };
    }),

  updateApplianceHours: (id, hours) =>
    set((s) => ({
      appliances: s.appliances.map((a) =>
        a.id === id ? { ...a, hoursPerDay: Math.max(0, Math.min(24, hours)) } : a
      ),
    })),

  toggleHabitTag: (tag) =>
    set((s) => ({
      habitTags: s.habitTags.includes(tag)
        ? s.habitTags.filter((t) => t !== tag)
        : [...s.habitTags, tag],
    })),

  resetAppliances: () => set({ appliances: [] }),

  setResult: (r) => set({ result: r }),
  setAnalyzing: (a) => set({ isAnalyzing: a }),
  setAnalysisError: (e) => set({ analysisError: e }),

  buildRequest: () => {
    const s = get();
    return {
      location: s.location,
      state: s.state || undefined,
      city: s.city || undefined,
      town: s.town || undefined,
      dailyHours: s.dailyHours,
      habits: s.habits,
      appliances: s.appliances,
      habitTags: s.habitTags,
    };
  },
}));
