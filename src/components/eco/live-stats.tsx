"use client";

import { Globe, Zap, TreePine, Users, Recycle, Wind } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";

const STATS = [
  { icon: Globe, label: "Countries Supported", value: 30, suffix: "+", color: "text-cyan-400" },
  { icon: Zap, label: "kWh Analyzed", value: 1.2, suffix: "M", decimals: 1, color: "text-emerald-400" },
  { icon: TreePine, label: "Trees Offset Equivalent", value: 50, suffix: "K", color: "text-violet-400" },
  { icon: Users, label: "Analyses Run", value: 8400, suffix: "+", color: "text-yellow-400" },
  { icon: Recycle, label: "kg CO₂ Mitigated", value: 320, suffix: "T", color: "text-sky-400" },
  { icon: Wind, label: "Renewable Projects", value: 1200, suffix: "+", color: "text-teal-400" },
];

export function LiveStats() {
  return (
    <section id="stats" className="py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-8 md:p-10 reveal">
          <div className="text-center mb-8">
            <span className="section-kicker">Global Impact</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
              Trusted by eco-conscious users <span className="gradient-text">worldwide</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center reveal"
                data-reveal-delay={i * 70}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white">
                  <AnimatedCounter
                    value={stat.value}
                    decimals={stat.decimals ?? 0}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
