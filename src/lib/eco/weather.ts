import type { CountryCode, WeatherData } from "@/types";
import { COUNTRY_COORDS } from "./data";

const WEATHER_DESC: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm + hail",
  99: "Severe thunderstorm",
};

/** Fetch current weather from Open-Meteo (server-side, no API key needed). */
export async function getWeather(location: CountryCode): Promise<WeatherData | null> {
  const coords = COUNTRY_COORDS[location];
  if (!coords) return null;
  const [lat, lon] = coords;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      description: WEATHER_DESC[current.weather_code] ?? "Variable conditions",
    };
  } catch {
    return null;
  }
}
