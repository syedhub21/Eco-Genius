"use client";

import { ArrowRight, Sparkles, Zap, Globe, TreePine } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { TiltCard } from "./tilt-card";
import { Flag } from "./flag";
import { useCurrency, formatCurrency } from "@/hooks/use-currency";

const HERO_STATS = [
  { icon: Globe, label: "Countries Analyzed", value: 30, suffix: "+", color: "text-cyan-400" },
  { icon: Zap, label: "kWh Analyzed", value: 1.2, suffix: "M", decimals: 1, color: "text-emerald-400" },
  { icon: TreePine, label: "Trees Equivalent", value: 50, suffix: "K", color: "text-violet-400" },
];

export function Hero() {
  const { symbol, code, name } = useCurrency();

  const scrollToCalc = () => {
    document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* Hero copy + impact card */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
          {/* Left — copy */}
          <div className="text-left">
            <div className="eyebrow-pill reveal mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              AI-Powered Sustainability
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.05] text-white tracking-tight reveal"
              data-reveal-delay="80"
            >
              Optimize Your
              <br />
              <span className="gradient-text">Energy Future</span>
            </h1>

            <p
              className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 leading-relaxed max-w-lg reveal"
              data-reveal-delay="160"
            >
              Advanced algorithms analyze your habits, calculate your carbon footprint,
              and guide your transition to renewable energy — all in one cinematic dashboard.
            </p>

            <div className="flex flex-wrap gap-4 reveal" data-reveal-delay="240">
              <button onClick={scrollToCalc} className="aurora-btn px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center gap-3 text-base sm:text-lg">
                Start Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.querySelector("#estimators")?.scrollIntoView({ behavior: "smooth" })}
                className="glass-btn px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center gap-3 text-base sm:text-lg"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Explore Estimators
              </button>
            </div>
          </div>

          {/* Right — floating impact card */}
          <div className="hidden md:block reveal" data-reveal-delay="200">
            <TiltCard className="animate-float" maxTilt={10}>
              <div className="glass-card-iridescent p-1">
                <div className="bg-slate-950/80 rounded-[23px] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400" />
                  <div className="flex items-center justify-between mb-8 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Live Impact</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          Showing: <Flag code={code} className="w-3.5 h-2.5" /> {name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded animate-glow">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2 text-slate-300">
                        <span>Efficiency Score</span>
                        <span className="text-cyan-400 font-bold">94%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 rounded-full"
                          style={{ width: "94%" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-3 rounded-lg text-center border border-white/5">
                        <div className="text-xl font-bold text-white">1.2T</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          CO₂ Saved
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-lg text-center border border-white/5">
                        <div className="text-xl font-bold text-emerald-400">
                          {formatCurrency(symbol, 450)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Yr Savings
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Currency: {symbol} · {name}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Stat cards row — in normal flow (no absolute positioning) so it never overlaps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 reveal" data-reveal-delay="320">
          {HERO_STATS.map((stat) => (
            <TiltCard key={stat.label} maxTilt={6}>
              <div className="glass-card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    <AnimatedCounter value={stat.value} decimals={stat.decimals ?? 0} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
