"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudDrizzle, Snowflake, CloudFog, Loader2 } from "lucide-react";
import type { CountryCode, WeatherData } from "@/types";

interface WeatherCardProps {
  location: CountryCode;
}

function WeatherIcon({ desc }: { desc: string }) {
  const d = desc.toLowerCase();
  if (d.includes("clear") || d.includes("mainly clear")) return <Sun className="w-7 h-7" />;
  if (d.includes("rain") || d.includes("shower") || d.includes("drizzle")) return <CloudDrizzle className="w-7 h-7" />;
  if (d.includes("snow")) return <Snowflake className="w-7 h-7" />;
  if (d.includes("fog") || d.includes("rime")) return <CloudFog className="w-7 h-7" />;
  if (d.includes("thunder")) return <CloudRain className="w-7 h-7" />;
  return <Cloud className="w-7 h-7" />;
}

export function WeatherCard({ location }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Fetch weather asynchronously; avoid synchronous setState at effect top.
    (async () => {
      try {
        const res = await fetch(`/api/weather?location=${location}`);
        const data = (await res.json()) as WeatherData;
        if (cancelled) return;
        if (data && data.temperature !== undefined) {
          setWeather(data);
        } else {
          setWeather(null);
        }
      } catch {
        if (!cancelled) setWeather(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location]);

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span className="text-sm">Fetching weather…</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-card p-5 flex items-center gap-3 text-slate-400">
        <Cloud className="w-8 h-8 text-slate-500" />
        <span className="text-sm">Weather unavailable for this location.</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 flex items-center justify-between border-l-4 border-l-yellow-400">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
          <WeatherIcon desc={weather.description} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{weather.temperature}°C</p>
          <p className="text-sm text-slate-400">{weather.description}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Humidity</div>
        <div className="text-white font-bold">{weather.humidity}%</div>
      </div>
    </div>
  );
}
