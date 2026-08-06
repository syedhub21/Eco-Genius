"use client";

import { useCallback, useEffect, useState } from "react";
import type { Achievement, AnalysisResult } from "@/types";

const STORAGE_KEY = "eco-genius-achievements";
const ANALYSES_KEY = "eco-genius-analysis-count";
// Custom event dispatched whenever achievements change so that all hook
// instances (across different components) re-sync from localStorage.
const SYNC_EVENT = "eco-achievements-sync";

/** All possible achievements and their unlock conditions. */
export const ALL_ACHIEVEMENTS: Omit<Achievement, "unlocked">[] = [
  { id: "first-analysis", name: "First Analysis", description: "Run your first energy analysis", icon: "✅" },
  { id: "eco-novice", name: "Eco Novice", description: "Complete 3 analyses", icon: "🌱" },
  { id: "eco-pro", name: "Eco Pro", description: "Complete 5 analyses", icon: "📊" },
  { id: "low-carbon", name: "Under 100kg CO₂", description: "Achieve a monthly footprint below 100kg", icon: "🏆" },
  { id: "ultra-low", name: "Ultra Low", description: "Achieve a monthly footprint below 50kg", icon: "💎" },
  { id: "top-grade", name: "A-Grade Energy", description: "Score an A or A+ efficiency grade", icon: "⭐" },
  { id: "renewable-explorer", name: "Explored Renewables", description: "Use any investment estimator", icon: "🔬" },
  { id: "solar-adopter", name: "Solar Curious", description: "Get a solar cost estimate", icon: "☀️" },
  { id: "wind-explorer", name: "Wind Pioneer", description: "Get a wind turbine estimate", icon: "💨" },
  { id: "hydro-explorer", name: "Hydro Visionary", description: "Get a micro-hydro estimate", icon: "💧" },
  { id: "india-drilldown", name: "Local Hero", description: "Drill down to a Bidar town in India", icon: "📍" },
  { id: "appliance-master", name: "Appliance Master", description: "Select 6+ appliances in one analysis", icon: "🔌" },
];

function readUnlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeUnlocked(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    /* ignore */
  }
}

function readCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(ANALYSES_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function writeCount(n: number) {
  try {
    localStorage.setItem(ANALYSES_KEY, String(n));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    /* ignore */
  }
}

/** Notify all hook instances to re-sync (used after evaluate). */
function notifySync() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SYNC_EVENT));
}

/** Client-side achievements store backed by localStorage + cross-component sync. */
export function useAchievements() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [analysisCount, setAnalysisCount] = useState(0);

  // Hydrate from localStorage on the client. This is a legitimate one-time
  // sync of client-only external state — the set-state-in-effect rule is
  // intentionally suppressed here.
  useEffect(() => {
    const sync = () => {
      setUnlocked(readUnlocked());
      setAnalysisCount(readCount());
    };
    sync();
    window.addEventListener(SYNC_EVENT, sync);
    return () => window.removeEventListener(SYNC_EVENT, sync);
  }, []);

  const unlock = useCallback((id: string) => {
    const next = new Set(readUnlocked());
    if (next.has(id)) return;
    next.add(id);
    writeUnlocked(next);
    notifySync();
  }, []);

  const unlockMany = useCallback((ids: string[]) => {
    const next = new Set(readUnlocked());
    let changed = false;
    for (const id of ids) {
      if (!next.has(id)) {
        next.add(id);
        changed = true;
      }
    }
    if (changed) {
      writeUnlocked(next);
      notifySync();
    }
  }, []);

  const incrementAnalysisCount = useCallback(() => {
    writeCount(readCount() + 1);
    notifySync();
  }, []);

  /** Evaluate achievements after a completed analysis. */
  const evaluateAfterAnalysis = useCallback(
    (result: AnalysisResult, applianceCount: number, drilledToTown: boolean) => {
      const newly: string[] = ["first-analysis"];
      const count = readCount() + 1;
      if (count >= 3) newly.push("eco-novice");
      if (count >= 5) newly.push("eco-pro");
      if (result.carbonFootprintKg < 100) newly.push("low-carbon");
      if (result.carbonFootprintKg < 50) newly.push("ultra-low");
      if (["A+", "A"].includes(result.grade)) newly.push("top-grade");
      if (applianceCount >= 6) newly.push("appliance-master");
      if (drilledToTown) newly.push("india-drilldown");
      unlockMany(newly);
      incrementAnalysisCount();
    },
    [unlockMany, incrementAnalysisCount]
  );

  const achievements: Achievement[] = ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlocked.has(a.id),
  }));

  const ecoScore = Math.min(100, unlocked.size * 9);
  const rank =
    unlocked.size >= 10 ? "Eco Legend" :
    unlocked.size >= 7 ? "Eco Champion" :
    unlocked.size >= 4 ? "Eco Warrior" :
    unlocked.size >= 2 ? "Eco Enthusiast" :
    "Eco Beginner";

  return {
    achievements,
    unlockedCount: unlocked.size,
    totalCount: ALL_ACHIEVEMENTS.length,
    analysisCount,
    ecoScore,
    rank,
    unlock,
    evaluateAfterAnalysis,
  };
}
