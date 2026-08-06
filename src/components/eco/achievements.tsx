"use client";

import { Trophy, Lock, Star, Sparkles } from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

export function Achievements() {
  const { achievements, unlockedCount, totalCount, analysisCount, ecoScore, rank } = useAchievements();

  return (
    <section id="achievements" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 reveal">
          <span className="section-kicker">Gamification</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Your <span className="gradient-text">Eco Journey</span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Unlock badges as you analyze, optimize, and explore renewable energy.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Eco score card */}
          <GlassCard iridescent className="reveal flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30 mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Eco Score</div>
            <div className="text-5xl font-black gradient-text">{ecoScore}</div>
            <div className="mt-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-sm font-bold">
              {rank}
            </div>
            <div className="mt-6 w-full grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div className="text-2xl font-bold text-white">{unlockedCount}/{totalCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Badges</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div className="text-2xl font-bold text-white">{analysisCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Analyses</div>
              </div>
            </div>
          </GlassCard>

          {/* Badge grid */}
          <div className="lg:col-span-2">
            <GlassCard className="reveal" accent="violet">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {achievements.map((badge, i) => (
                  <div
                    key={badge.id}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all reveal",
                      badge.unlocked
                        ? "bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-cyan-400/40 hover:scale-105"
                        : "bg-slate-900/40 border-white/5 opacity-60"
                    )}
                    data-reveal-delay={i * 40}
                  >
                    <div
                      className={cn(
                        "text-4xl mb-2 inline-block",
                        !badge.unlocked && "grayscale opacity-40"
                      )}
                    >
                      {badge.unlocked ? badge.icon : <Lock className="w-7 h-7 text-slate-500" />}
                    </div>
                    <div className={cn("text-sm font-bold", badge.unlocked ? "text-white" : "text-slate-500")}>
                      {badge.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                      {badge.description}
                    </div>
                    {badge.unlocked && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
