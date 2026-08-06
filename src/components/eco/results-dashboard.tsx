"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  Plane,
  Car,
  BatteryCharging,
  Leaf,
  TreePine,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Cloud,
  Clock,
} from "lucide-react";
import { useEcoStore } from "@/store/eco-store";
import { GlassCard } from "./glass-card";
import { GradeGauge } from "./grade-gauge";
import { AnimatedCounter } from "./animated-counter";
import type { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLE: Record<string, string> = {
  high: "border-red-400/60 bg-red-500/5",
  medium: "border-yellow-400/60 bg-yellow-500/5",
  low: "border-emerald-400/60 bg-emerald-500/5",
};
const PRIORITY_LABEL: Record<string, string> = {
  high: "High Priority",
  medium: "Medium",
  low: "Low",
};
const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-emerald-400",
};

export function ResultsDashboard() {
  const result = useEcoStore((s) => s.result);

  if (!result) return null;

  return (
    <section id="results" className="py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header result={result} />
        <GradeAndMetrics result={result} />
        <ChartsRow result={result} />
        <CarbonEquivalents result={result} />
        <ActionAndRenewables result={result} />
        <TipsAndComparison result={result} />
      </div>
    </section>
  );
}

function Header({ result }: { result: AnalysisResult }) {
  return (
    <GlassCard accent="cyan" className="reveal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-bold text-white">Analysis Report</h3>
          <p className="text-slate-400 mt-1 italic text-sm">{result.habitsSummary}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {result.profileTags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function GradeAndMetrics({ result }: { result: AnalysisResult }) {
  const metrics = [
    {
      icon: Cloud,
      label: "Carbon Footprint",
      value: result.carbonFootprintKg,
      suffix: " kg",
      color: "text-red-400",
      border: "hover:border-red-500/40",
    },
    {
      icon: TreePine,
      label: "Trees Needed / yr",
      value: result.treesNeeded,
      color: "text-emerald-400",
      border: "hover:border-emerald-500/40",
    },
    {
      icon: DollarSign,
      label: "Annual Savings Potential",
      rawValue: result.annualSavings,
      color: "text-yellow-400",
      border: "hover:border-yellow-500/40",
    },
    {
      icon: TrendingUp,
      label: "ROI Period",
      rawValue: `${result.paybackPeriod} yrs`,
      color: "text-blue-400",
      border: "hover:border-blue-500/40",
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <GlassCard iridescent className="reveal flex flex-col items-center justify-center text-center">
        <GradeGauge grade={result.grade} score={result.gradeScore} color={result.gradeColor} />
        <p className="text-xs text-slate-400 mt-4">
          Monthly usage: <span className="text-cyan-400 font-bold">{result.monthlyKwh} kWh</span> ·
          Annual cost: <span className="text-cyan-400 font-bold">{result.annualCost}</span>
        </p>
      </GlassCard>

      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "glass-card p-6 text-center border transition group reveal",
              m.border
            )}
            data-reveal-delay={i * 80}
          >
            <m.icon className={cn("w-7 h-7 mx-auto mb-3", m.color)} />
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              {m.label}
            </p>
            {m.rawValue ? (
              <p className={cn("text-2xl md:text-3xl font-black mt-2", m.color)}>{m.rawValue}</p>
            ) : (
              <p className={cn("text-2xl md:text-3xl font-black mt-2", m.color)}>
                <AnimatedCounter value={m.value!} suffix={m.suffix ?? ""} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartsRow({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Donut — appliance breakdown */}
      <GlassCard className="reveal" accent="cyan">
        <h4 className="text-lg font-bold text-white mb-4">Energy Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={result.chartData.applianceBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {result.chartData.applianceBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(v: number) => [`${v} kWh`, "Usage"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {result.chartData.applianceBreakdown.slice(0, 5).map((e) => (
            <span key={e.name} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
              {e.name}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Bar — monthly projection */}
      <GlassCard className="reveal" accent="emerald" >
        <h4 className="text-lg font-bold text-white mb-4">12-Month Cost Projection</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.chartData.monthlyProjection}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(v: number, n: string) => [`${v}`, n === "cost" ? "Cost" : "Savings"]}
              />
              <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 justify-center text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Cost
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Potential Savings
          </span>
        </div>
      </GlassCard>

      {/* Radar — renewable potential */}
      <GlassCard className="reveal" accent="violet">
        <h4 className="text-lg font-bold text-white mb-4">Renewable Potential</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={result.chartData.renewableRadar}>
              <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
              <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
              <Radar
                dataKey="value"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function CarbonEquivalents({ result }: { result: AnalysisResult }) {
  const eq = result.carbonEquivalents;
  const items = [
    { icon: Plane, label: "NYC→LA round-trip flights", value: eq.flights, color: "text-sky-400", bg: "bg-sky-500/10" },
    { icon: Car, label: "km driven by car", value: eq.drivingKm, color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: BatteryCharging, label: "years of phone charging", value: eq.phoneCharges, color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Leaf, label: "smartphones charged (monthly)", value: eq.smartphonesCharged, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];
  return (
    <GlassCard className="reveal">
      <h4 className="text-lg font-bold text-white mb-1">Carbon Equivalents</h4>
      <p className="text-sm text-slate-400 mb-5">
        Your annual carbon footprint in real-world terms.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="p-5 rounded-xl bg-slate-900/40 border border-white/5 text-center group hover:border-white/20 transition"
          >
            <div className={cn("w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center", it.bg, it.color)}>
              <it.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-white">
              <AnimatedCounter value={it.value} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{it.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ActionAndRenewables({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <GlassCard className="reveal" accent="emerald">
        <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          30-Day Action Plan
        </h4>
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {result.actionPlan.map((item) => (
            <div
              key={item.day}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-emerald-400/30 transition"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col items-center justify-center">
                <span className="text-[9px] text-emerald-400 uppercase">Day</span>
                <span className="text-base font-black text-emerald-400 leading-none">{item.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-semibold text-white text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="reveal" accent="cyan">
        <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Renewable Strategy
        </h4>
        <div className="space-y-3">
          {result.renewableRecommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-400/30 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 text-sm font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-slate-300">{rec}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-cyan-400/20">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Investment Payback</div>
          <div className="text-2xl font-black text-cyan-400">{result.paybackPeriod} years</div>
          <p className="text-xs text-slate-400 mt-1">
            Estimated time to recoup renewable investment in your region.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function TipsAndComparison({ result }: { result: AnalysisResult }) {
  const { comparison } = result;
  const maxVal = Math.max(comparison.you, comparison.national, comparison.global, 1);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <GlassCard className="reveal">
        <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Smart Efficiency Tips
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {result.efficiencyTips.map((tip, i) => (
            <div
              key={i}
              className={cn(
                "p-4 rounded-xl border-l-4",
                PRIORITY_STYLE[tip.priority]
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  {tip.category}
                </span>
                <span className={cn("text-[10px] font-bold uppercase", PRIORITY_COLOR[tip.priority])}>
                  {PRIORITY_LABEL[tip.priority]}
                </span>
              </div>
              <p className="text-sm text-slate-200">{tip.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="reveal">
        <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Usage Comparison
        </h4>
        <div className="space-y-5">
          {[
            { label: "Your usage", value: comparison.you, color: "from-cyan-400 to-cyan-600", text: "text-cyan-400" },
            { label: "National avg", value: comparison.national, color: "from-violet-400 to-violet-600", text: "text-violet-400" },
            { label: "Global avg", value: comparison.global, color: "from-emerald-400 to-emerald-600", text: "text-emerald-400" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">{row.label}</span>
                <span className={cn("font-bold", row.text)}>{row.value} kWh/mo</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-1000", row.color)}
                  style={{ width: `${(row.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Verdict</div>
          {comparison.you < comparison.national ? (
            <p className="text-sm text-emerald-400 font-semibold">
              🎉 You're below the national average — great work!
            </p>
          ) : comparison.you < comparison.national * 1.2 ? (
            <p className="text-sm text-yellow-400 font-semibold">
              ⚡ You're close to the national average. Small changes make a big difference.
            </p>
          ) : (
            <p className="text-sm text-orange-400 font-semibold">
              📈 You're above the national average. Follow your action plan to reduce.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
