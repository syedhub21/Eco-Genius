"use client";

import { useState } from "react";
import { Sun, Wind, Droplets, Loader2, Zap, TrendingUp, Leaf, Clock } from "lucide-react";
import { useEcoStore } from "@/store/eco-store";
import { useAchievements } from "@/hooks/use-achievements";
import { GlassCard } from "./glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CountryCode, SolarEstimate, WindEstimate, HydroEstimate } from "@/types";

type EstimatorType = "solar" | "wind" | "hydro";

export function Estimators() {
  const location = useEcoStore((s) => s.location);
  const achievements = useAchievements();

  const [solarRoof, setSolarRoof] = useState(500);
  const [windSize, setWindSize] = useState(5);
  const [hydroFlow, setHydroFlow] = useState(20);
  const [hydroHead, setHydroHead] = useState(5);

  const [solarRes, setSolarRes] = useState<SolarEstimate | null>(null);
  const [windRes, setWindRes] = useState<WindEstimate | null>(null);
  const [hydroRes, setHydroRes] = useState<HydroEstimate | null>(null);
  const [loading, setLoading] = useState<EstimatorType | null>(null);

  const calc = async (type: EstimatorType) => {
    setLoading(type);
    try {
      if (type === "solar") {
        const res = await fetch("/api/solar-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, roof_size_sqft: solarRoof }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSolarRes(data);
        achievements.unlock("solar-adopter");
      } else if (type === "wind") {
        const res = await fetch("/api/wind-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, turbine_size_kw: windSize }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setWindRes(data);
        achievements.unlock("wind-explorer");
      } else {
        const res = await fetch("/api/hydro-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, flow_rate_lps: hydroFlow, head_height_m: hydroHead }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setHydroRes(data);
        achievements.unlock("hydro-explorer");
      }
      achievements.unlock("renewable-explorer");
    } catch (e) {
      // swallow — could toast
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="estimators" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 reveal">
          <span className="section-kicker">Investment Tools</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Renewable <span className="gradient-text">Estimators</span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Calculate upfront costs, ROI, and environmental impact for clean energy tech
            tailored to your location.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Solar */}
          <GlassCard accent="yellow" className="reveal" >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Solar PV</h3>
                <p className="text-xs text-slate-400">Rooftop panels</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-400">Roof Size (sq ft)</Label>
                <Input
                  type="number"
                  value={solarRoof}
                  onChange={(e) => setSolarRoof(Number(e.target.value))}
                  className="eco-input mt-1"
                  min={50}
                />
              </div>
              <button
                onClick={() => calc("solar")}
                disabled={loading !== null}
                className="aurora-btn w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading === "solar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sun className="w-4 h-4" />}
                Calculate
              </button>
              {solarRes && <EstimateResult type="solar" data={solarRes} />}
            </div>
          </GlassCard>

          {/* Wind */}
          <GlassCard accent="blue" className="reveal" data-reveal-delay="80">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Wind Turbine</h3>
                <p className="text-xs text-slate-400">Micro turbine</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-400">Turbine Size (kW)</Label>
                <Input
                  type="number"
                  value={windSize}
                  onChange={(e) => setWindSize(Number(e.target.value))}
                  className="eco-input mt-1"
                  min={1}
                />
              </div>
              <button
                onClick={() => calc("wind")}
                disabled={loading !== null}
                className="aurora-btn w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading === "wind" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wind className="w-4 h-4" />}
                Calculate
              </button>
              {windRes && <EstimateResult type="wind" data={windRes} />}
            </div>
          </GlassCard>

          {/* Hydro */}
          <GlassCard accent="cyan" className="reveal" data-reveal-delay="160">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Micro Hydro</h3>
                <p className="text-xs text-slate-400">Flow + head</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-400">Flow (L/s)</Label>
                  <Input
                    type="number"
                    value={hydroFlow}
                    onChange={(e) => setHydroFlow(Number(e.target.value))}
                    className="eco-input mt-1"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Head (m)</Label>
                  <Input
                    type="number"
                    value={hydroHead}
                    onChange={(e) => setHydroHead(Number(e.target.value))}
                    className="eco-input mt-1"
                    min={1}
                  />
                </div>
              </div>
              <button
                onClick={() => calc("hydro")}
                disabled={loading !== null}
                className="aurora-btn w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading === "hydro" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Droplets className="w-4 h-4" />}
                Calculate
              </button>
              {hydroRes && <EstimateResult type="hydro" data={hydroRes} />}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function EstimateResult({ type, data }: { type: EstimatorType; data: any }) {
  const rows: { icon: any; label: string; value: string | number; color: string }[] = [];

  if (type === "solar") {
    const d = data as SolarEstimate;
    rows.push(
      { icon: Zap, label: "System Size", value: `${d.systemSizeKw} kW`, color: "text-cyan-400" },
      { icon: Leaf, label: "Est. Cost", value: d.totalCost, color: "text-white" },
      { icon: TrendingUp, label: "Yr Savings", value: d.annualSavings, color: "text-emerald-400" },
      { icon: Clock, label: "Payback", value: `${d.paybackYears} yrs`, color: "text-violet-400" },
      { icon: Leaf, label: "CO₂ Offset", value: `${d.co2OffsetKg.toLocaleString()} kg/yr`, color: "text-emerald-400" },
      { icon: Sun, label: "Panels", value: `${d.panels}`, color: "text-yellow-400" }
    );
  } else if (type === "wind") {
    const d = data as WindEstimate;
    rows.push(
      { icon: Zap, label: "Annual Energy", value: `${d.annualEnergyKwh.toLocaleString()} kWh`, color: "text-cyan-400" },
      { icon: Leaf, label: "Est. Cost", value: d.totalCost, color: "text-white" },
      { icon: TrendingUp, label: "Yr Savings", value: d.annualSavings, color: "text-emerald-400" },
      { icon: Clock, label: "Payback", value: `${d.paybackYears} yrs`, color: "text-violet-400" },
      { icon: Leaf, label: "CO₂ Offset", value: `${d.co2OffsetKg.toLocaleString()} kg/yr`, color: "text-emerald-400" }
    );
  } else {
    const d = data as HydroEstimate;
    rows.push(
      { icon: Zap, label: "System Size", value: `${d.systemSizeKw} kW`, color: "text-cyan-400" },
      { icon: Leaf, label: "Est. Cost", value: d.totalCost, color: "text-white" },
      { icon: Zap, label: "Annual Energy", value: `${d.annualEnergyKwh.toLocaleString()} kWh`, color: "text-sky-400" },
      { icon: TrendingUp, label: "Yr Savings", value: d.annualSavings, color: "text-emerald-400" },
      { icon: Clock, label: "Payback", value: `${d.paybackYears} yrs`, color: "text-violet-400" },
      { icon: Leaf, label: "CO₂ Offset", value: `${d.co2OffsetKg.toLocaleString()} kg/yr`, color: "text-emerald-400" }
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-slate-400">
            <r.icon className="w-3.5 h-3.5" />
            {r.label}
          </span>
          <b className={r.color}>{r.value}</b>
        </div>
      ))}
    </div>
  );
}
