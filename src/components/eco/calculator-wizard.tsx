"use client";

import { useMemo, useState } from "react";
import {
  Globe,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plug,
  Lightbulb,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEcoStore } from "@/store/eco-store";
import { useAchievements } from "@/hooks/use-achievements";
import {
  COUNTRIES,
  INDIA_STATES,
  CITIES_BY_STATE,
  BIDAR_TOWNS,
  APPLIANCES,
  HABIT_TAGS,
  EXAMPLE_HABITS,
  getAppliance,
} from "@/lib/eco/data";
import type { CountryCode } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Flag } from "./flag";
import dynamic from "next/dynamic";

const EcoGlobe = dynamic(() => import("./eco-globe").then((m) => m.EcoGlobe), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] rounded-2xl border border-cyan-500/20 bg-slate-900/20 flex items-center justify-center text-cyan-400">
      Spinning up globe…
    </div>
  ),
});
const WeatherCard = dynamic(() => import("./weather-card").then((m) => m.WeatherCard), {
  ssr: false,
});

const STEPS = [
  { id: 0, label: "Location", icon: MapPin },
  { id: 1, label: "Usage Profile", icon: Plug },
  { id: 2, label: "Habits", icon: Lightbulb },
];

export function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const store = useEcoStore();
  const achievements = useAchievements();

  // Derived: total monthly kWh from selected appliances
  const monthlyKwh = useMemo(() => {
    return store.appliances.reduce((sum, a) => {
      const app = getAppliance(a.id);
      if (!app) return sum;
      return sum + (app.wattage * a.hoursPerDay * 30) / 1000;
    }, 0);
  }, [store.appliances]);

  const appliancesToShow = useMemo(() => {
    return APPLIANCES.filter((a) => !a.indiaOnly || store.location === "IN");
  }, [store.location]);

  const canProceed = () => {
    if (step === 0) return !!store.location;
    if (step === 1) return store.appliances.length > 0 || store.dailyHours > 0;
    if (step === 2) return store.habits.trim().length > 0 || store.habitTags.length > 0;
    return true;
  };

  const handleAnalyze = async () => {
    store.setAnalyzing(true);
    store.setAnalysisError(null);
    try {
      const req = store.buildRequest();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        store.setAnalysisError(data.error ?? "Analysis failed");
        return;
      }
      store.setResult(data.result);
      achievements.evaluateAfterAnalysis(
        data.result,
        store.appliances.length,
        !!store.town
      );
      // Smooth-scroll to results
      setTimeout(() => {
        document.querySelector("#results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      store.setAnalysisError("Network error — please try again.");
    } finally {
      store.setAnalyzing(false);
    }
  };

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 reveal">
          <span className="section-kicker">AI Analysis Engine</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">
            Generate Your <span className="gradient-text">Eco Plan</span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Three quick steps to a personalized energy blueprint.
          </p>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-6 md:p-8 reveal" data-reveal-delay="80">
          <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border",
                      step >= s.id
                        ? "bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-950 border-transparent shadow-lg shadow-cyan-500/30"
                        : "bg-slate-800/60 text-slate-400 border-white/10"
                    )}
                  >
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      step >= s.id ? "text-cyan-400" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: step > s.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="min-h-[420px]">
            {step === 0 && (
              <LocationStep store={store} EcoGlobe={EcoGlobe} WeatherCard={WeatherCard} />
            )}
            {step === 1 && (
              <UsageStep
                store={store}
                appliancesToShow={appliancesToShow}
                monthlyKwh={monthlyKwh}
              />
            )}
            {step === 2 && <HabitsStep store={store} />}
          </div>

          {/* Error */}
          {store.analysisError && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {store.analysisError}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || store.isAnalyzing}
              className="glass-btn px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-xs text-slate-500">
              Step {step + 1} of {STEPS.length}
            </div>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canProceed()}
                className="aurora-btn px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!canProceed() || store.isAnalyzing}
                className="aurora-btn px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {store.isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Analysis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Step 1: Location ============ */

function LocationStep({ store, EcoGlobe, WeatherCard }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
            <Globe className="w-4 h-4" /> Location
          </label>
          <Select
            value={store.location}
            onValueChange={(v) => store.setLocation(v as CountryCode)}
          >
            <SelectTrigger className="eco-input w-full h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code} className="text-white focus:bg-cyan-500/20">
                  <Flag code={c.code} className="w-5 h-3.5 mr-2 align-middle" />
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* India drill-down */}
          {store.location === "IN" && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-cyan-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
              <div>
                <label className="block text-xs text-slate-400 mb-1">State</label>
                <Select value={store.state} onValueChange={store.setStateField}>
                  <SelectTrigger className="eco-input w-full h-10 text-sm">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                    {INDIA_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="text-white focus:bg-cyan-500/20">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {store.state && CITIES_BY_STATE[store.state] && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs text-slate-400 mb-1">City</label>
                  <Select value={store.city} onValueChange={store.setCity}>
                    <SelectTrigger className="eco-input w-full h-10 text-sm">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {CITIES_BY_STATE[store.state].map((c: string) => (
                        <SelectItem key={c} value={c} className="text-white focus:bg-cyan-500/20">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {store.city === "Bidar" && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs text-cyan-400 font-bold mb-1">
                    Bidar Town (Solar Hotspot)
                  </label>
                  <Select value={store.town} onValueChange={store.setTown}>
                    <SelectTrigger className="eco-input w-full h-10 text-sm bg-cyan-900/20 border-cyan-500/50">
                      <SelectValue placeholder="Select town" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-cyan-500/30">
                      {BIDAR_TOWNS.map((t) => (
                        <SelectItem key={t} value={t} className="text-white focus:bg-cyan-500/20">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily usage hours */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
            <Clock className="w-4 h-4" /> Average Daily Usage (hours)
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={1}
              max={24}
              value={store.dailyHours}
              onChange={(e) => store.setDailyHours(Number(e.target.value))}
              className="eco-input w-24 h-12 text-center text-lg font-bold"
            />
            <Slider
              value={[store.dailyHours]}
              min={1}
              max={24}
              step={1}
              onValueChange={(v) => store.setDailyHours(v[0])}
              className="flex-1"
            />
            <span className="text-cyan-400 font-bold w-12 text-right">{store.dailyHours}h</span>
          </div>
        </div>
      </div>

      {/* Map + Weather */}
      <div className="space-y-4">
        <EcoGlobe selected={store.location} onSelect={(code: CountryCode) => store.setLocation(code)} />
        <WeatherCard location={store.location} />
      </div>
    </div>
  );
}

/* ============ Step 2: Usage Profile ============ */

function UsageStep({ store, appliancesToShow, monthlyKwh }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Select Your Appliances</h3>
          <p className="text-sm text-slate-400">Tap to add, then adjust daily usage hours.</p>
        </div>
        <div className="glass-card px-5 py-3 border-cyan-400/30">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Monthly Estimate</div>
          <div className="text-2xl font-black text-cyan-400">
            {monthlyKwh.toFixed(0)} <span className="text-sm text-slate-400 font-normal">kWh</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1 eco-scroll">
        {appliancesToShow.map((app: any) => {
          const selected = store.appliances.find((a: any) => a.id === app.id);
          const isSel = !!selected;
          return (
            <button
              key={app.id}
              onClick={() => store.toggleAppliance(app.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                isSel
                  ? "bg-cyan-500/15 border-cyan-400/50 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/40 border-white/10 hover:border-cyan-400/30 hover:bg-slate-800/40"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{app.icon}</span>
                {isSel && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className="text-sm font-semibold text-white leading-tight">{app.name}</div>
              <div className="text-[10px] text-slate-500 mt-1">{app.wattage}W</div>
              {app.indiaOnly && (
                <div className="text-[9px] text-orange-400 mt-1 uppercase tracking-wider">India</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected appliances with hour sliders */}
      {store.appliances.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="text-sm font-semibold text-cyan-400">Adjust daily hours per appliance</div>
          {store.appliances.map((sel: any) => {
            const app = getAppliance(sel.id);
            if (!app) return null;
            const dailyKwh = (app.wattage * sel.hoursPerDay) / 1000;
            return (
              <div
                key={sel.id}
                className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-center gap-4 flex-wrap"
              >
                <span className="text-2xl">{app.icon}</span>
                <div className="flex-1 min-w-[120px]">
                  <div className="text-sm font-semibold text-white">{app.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {app.wattage}W × {sel.hoursPerDay}h = {dailyKwh.toFixed(2)} kWh/day
                  </div>
                </div>
                <Slider
                  value={[sel.hoursPerDay]}
                  min={0}
                  max={24}
                  step={0.5}
                  onValueChange={(v) => store.updateApplianceHours(sel.id, v[0])}
                  className="flex-1 min-w-[100px] max-w-[200px]"
                />
                <span className="text-cyan-400 font-bold w-12 text-right text-sm">
                  {sel.hoursPerDay}h
                </span>
                <button
                  onClick={() => store.toggleAppliance(sel.id)}
                  className="text-slate-500 hover:text-red-400 text-xs"
                  aria-label={`Remove ${app.name}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ Step 3: Habits ============ */

function HabitsStep({ store }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
          <Lightbulb className="w-4 h-4" /> Describe Your Habits & Lifestyle
        </label>
        <Textarea
          value={store.habits}
          onChange={(e) => store.setHabits(e.target.value)}
          placeholder="Describe your daily routine, appliances you use, when you use them, and any energy-related habits. Tip: click an example below to start."
          className="eco-input w-full h-36 resize-none text-base"
        />
        <p className="text-xs text-slate-500 mt-2">
          The more detail you share, the smarter your action plan becomes.
        </p>
      </div>

      {/* Example habits — one click fills the textarea with a real sentence */}
      <div>
        <label className="block text-sm font-semibold text-cyan-400 mb-3">
          ✨ Load an Example Habit Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLE_HABITS.map((ex) => {
            const active = store.habits === ex.text;
            return (
              <button
                key={ex.label}
                onClick={() => store.setHabits(active ? "" : ex.text)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all group",
                  active
                    ? "bg-cyan-500/15 border-cyan-400/50 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-900/40 border-white/10 hover:border-cyan-400/30 hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{ex.icon}</span>
                  <span className={cn("text-sm font-semibold", active ? "text-cyan-300" : "text-white")}>
                    {ex.label}
                  </span>
                  {active && <CheckCircle2 className="w-4 h-4 text-cyan-400 ml-auto" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {ex.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-cyan-400 mb-3">Quick Tags</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_TAGS.map((tag) => {
            const active = store.habitTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => store.toggleHabitTag(tag)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  active
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                    : "bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-400"
                )}
              >
                {active && "✓ "}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/5 to-violet-500/5 border border-cyan-400/20">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          Ready to analyze
        </div>
        <p className="text-sm text-slate-400">
          Click <span className="text-cyan-400 font-semibold">Generate Analysis</span> to receive your
          personalized energy grade, 30-day action plan, and renewable investment roadmap.
        </p>
      </div>
    </div>
  );
}
