import type { CountryCode, CountryMeta, Appliance } from "@/types";

export const CARBON_PRICE_DEFAULT = 50.0;

// Carbon intensity (gCO2 per kWh) for 30 countries
export const CARBON_INTENSITY: Record<CountryCode, number> = {
  US: 424, IN: 705, DE: 369, FR: 57, BR: 89,
  CA: 130, AU: 680, JP: 480, GB: 230, IT: 300,
  MX: 380, ZA: 850, KR: 450, ES: 200, SE: 15,
  CN: 580, RU: 470, AR: 360, EG: 450, NG: 400,
  NO: 8, IS: 0, NZ: 120, CH: 30, FI: 90,
  DK: 150, NL: 390, BE: 220, AT: 140, PL: 690,
};

export const CURRENCY_SYMBOL: Record<CountryCode, string> = {
  US: "$", IN: "₹", DE: "€", FR: "€", BR: "R$",
  CA: "$", AU: "$", JP: "¥", GB: "£", IT: "€",
  MX: "$", ZA: "R", KR: "₩", ES: "€", SE: "kr",
  CN: "¥", RU: "₽", AR: "$", EG: "E£", NG: "₦",
  NO: "kr", IS: "kr", NZ: "$", CH: "Fr", FI: "€",
  DK: "kr", NL: "€", BE: "€", AT: "€", PL: "zł",
};

// Electricity rate per kWh in LOCAL currency. For $/€/£ countries this is the
// direct rate; for others it is the local-currency rate (e.g. INR/kWh).
export const ELECTRICITY_RATE: Record<CountryCode, number> = {
  US: 0.14, IN: 7.0, DE: 0.36, FR: 0.19, BR: 0.80,
  CA: 0.13, AU: 0.35, JP: 27.0, GB: 0.34, IT: 0.28,
  MX: 2.0, ZA: 2.5, KR: 120, ES: 0.25, SE: 2.5,
  CN: 0.6, RU: 5.0, AR: 50.0, EG: 1.5, NG: 50.0,
  NO: 1.5, IS: 18.0, NZ: 0.30, CH: 0.25, FI: 0.17,
  DK: 2.5, NL: 0.30, BE: 0.30, AT: 0.25, PL: 0.70,
};

export const RENEWABLE_POTENTIAL: Record<CountryCode, { solar: string; wind: string; hydro: string }> = {
  US: { solar: "excellent", wind: "good", hydro: "moderate" },
  IN: { solar: "excellent", wind: "moderate", hydro: "good" },
  DE: { solar: "moderate", wind: "excellent", hydro: "low" },
  FR: { solar: "good", wind: "good", hydro: "excellent" },
  BR: { solar: "excellent", wind: "good", hydro: "excellent" },
  CA: { solar: "moderate", wind: "excellent", hydro: "excellent" },
  AU: { solar: "excellent", wind: "excellent", hydro: "low" },
  JP: { solar: "good", wind: "moderate", hydro: "good" },
  GB: { solar: "low", wind: "excellent", hydro: "moderate" },
  SE: { solar: "low", wind: "good", hydro: "excellent" },
  MX: { solar: "excellent", wind: "good", hydro: "moderate" },
  ZA: { solar: "excellent", wind: "moderate", hydro: "low" },
  KR: { solar: "moderate", wind: "moderate", hydro: "low" },
  ES: { solar: "excellent", wind: "excellent", hydro: "moderate" },
  CN: { solar: "good", wind: "good", hydro: "excellent" },
  RU: { solar: "low", wind: "good", hydro: "excellent" },
  AR: { solar: "excellent", wind: "good", hydro: "moderate" },
  EG: { solar: "excellent", wind: "moderate", hydro: "low" },
  NG: { solar: "excellent", wind: "low", hydro: "moderate" },
  NO: { solar: "low", wind: "good", hydro: "excellent" },
  IS: { solar: "low", wind: "excellent", hydro: "excellent" },
  NZ: { solar: "good", wind: "excellent", hydro: "good" },
  CH: { solar: "moderate", wind: "moderate", hydro: "excellent" },
  FI: { solar: "low", wind: "good", hydro: "good" },
  DK: { solar: "moderate", wind: "excellent", hydro: "low" },
  NL: { solar: "moderate", wind: "excellent", hydro: "low" },
  BE: { solar: "moderate", wind: "good", hydro: "low" },
  AT: { solar: "good", wind: "moderate", hydro: "good" },
  PL: { solar: "moderate", wind: "good", hydro: "low" },
};

// Monthly average household electricity consumption (kWh) — used for comparison
export const NATIONAL_AVG_KWH: Record<CountryCode, number> = {
  US: 877, IN: 90, DE: 250, FR: 220, BR: 165,
  CA: 720, AU: 540, JP: 240, GB: 250, IT: 270,
  MX: 130, ZA: 350, KR: 300, ES: 240, SE: 800,
  CN: 180, RU: 200, AR: 200, EG: 130, NG: 50,
  NO: 1000, IS: 1600, NZ: 600, CH: 250, FI: 700,
  DK: 400, NL: 280, BE: 280, AT: 350, PL: 200,
};

export const GLOBAL_AVG_KWH = 250; // global monthly household avg

// Country display metadata (name + flag) — for all 30 supported countries
export const COUNTRY_NAMES: Record<CountryCode, { name: string; flag: string }> = {
  US: { name: "United States", flag: "🇺🇸" },
  IN: { name: "India", flag: "🇮🇳" },
  DE: { name: "Germany", flag: "🇩🇪" },
  FR: { name: "France", flag: "🇫🇷" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AU: { name: "Australia", flag: "🇦🇺" },
  JP: { name: "Japan", flag: "🇯🇵" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  IT: { name: "Italy", flag: "🇮🇹" },
  MX: { name: "Mexico", flag: "🇲🇽" },
  ZA: { name: "South Africa", flag: "🇿🇦" },
  KR: { name: "South Korea", flag: "🇰🇷" },
  ES: { name: "Spain", flag: "🇪🇸" },
  SE: { name: "Sweden", flag: "🇸🇪" },
  CN: { name: "China", flag: "🇨🇳" },
  RU: { name: "Russia", flag: "🇷🇺" },
  AR: { name: "Argentina", flag: "🇦🇷" },
  EG: { name: "Egypt", flag: "🇪🇬" },
  NG: { name: "Nigeria", flag: "🇳🇬" },
  NO: { name: "Norway", flag: "🇳🇴" },
  IS: { name: "Iceland", flag: "🇮🇸" },
  NZ: { name: "New Zealand", flag: "🇳🇿" },
  CH: { name: "Switzerland", flag: "🇨🇭" },
  FI: { name: "Finland", flag: "🇫🇮" },
  DK: { name: "Denmark", flag: "🇩🇰" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  BE: { name: "Belgium", flag: "🇧🇪" },
  AT: { name: "Austria", flag: "🇦🇹" },
  PL: { name: "Poland", flag: "🇵🇱" },
};

// Lat/lon for map + weather
export const COUNTRY_COORDS: Record<CountryCode, [number, number]> = {
  US: [37.09, -95.71], IN: [20.59, 78.96], DE: [51.16, 10.45],
  FR: [46.22, 2.21], BR: [-14.23, -51.92], CA: [56.13, -106.34],
  AU: [-25.27, 133.77], JP: [36.2, 138.25], GB: [55.37, -3.43],
  IT: [41.87, 12.56], MX: [23.63, -102.55], ZA: [-30.56, 22.94],
  KR: [35.91, 127.77], ES: [40.46, -3.75], SE: [60.13, 18.64],
  CN: [35.86, 104.2], RU: [61.52, 105.32], AR: [-38.42, -63.62],
  EG: [26.82, 30.8], NG: [9.08, 8.68], NO: [60.47, 8.47],
  IS: [64.96, -19.02], NZ: [-40.9, 174.89], CH: [46.82, 8.23],
  FI: [61.92, 25.75], DK: [56.26, 9.5], NL: [52.13, 5.29],
  BE: [50.5, 4.47], AT: [47.52, 14.55], PL: [51.92, 19.15],
};

// Build the full country metadata list
export const COUNTRIES: CountryMeta[] = (Object.keys(COUNTRY_NAMES) as CountryCode[]).map((code) => ({
  code,
  name: COUNTRY_NAMES[code].name,
  flag: COUNTRY_NAMES[code].flag,
  // Flag image URL (renders on all OSes incl. Windows where emoji flags don't render)
  flagUrl: `https://flagcdn.com/${code.toLowerCase()}.svg`,
  carbonIntensity: CARBON_INTENSITY[code],
  currencySymbol: CURRENCY_SYMBOL[code],
  electricityRate: ELECTRICITY_RATE[code],
  renewable: RENEWABLE_POTENTIAL[code] as { solar: "excellent" | "good" | "moderate" | "low"; wind: "excellent" | "good" | "moderate" | "low"; hydro: "excellent" | "good" | "moderate" | "low" },
  nationalAvgKwh: NATIONAL_AVG_KWH[code],
  coords: COUNTRY_COORDS[code],
}));

export function getCountry(code: CountryCode): CountryMeta {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

// ---- India drill-down data ----

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  Karnataka: ["Bengaluru", "Mysore", "Hubli", "Mangalore", "Bidar", "Belgaum"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Delhi: ["New Delhi", "North Delhi", "South Delhi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
};

export const BIDAR_TOWNS = [
  "Aurad", "Basavakalyan", "Bhalki", "Chitgoppa", "Hulsoor", "Humnabad",
  "Kamalnagar", "Old City", "New City", "Gumpa", "Mailoor", "Chidri",
];

// ---- Quick-start templates ----
export const EXAMPLES = [
  { name: "Urban Apt (US)", location: "US" as CountryCode, usage: 12, habits: "AC in summer, WFH setup", icon: "🏢" },
  { name: "Family Home (IN)", location: "IN" as CountryCode, usage: 16, habits: "Fans, Lights, TV, Fridge", icon: "🏠" },
  { name: "Eco Student (DE)", location: "DE" as CountryCode, usage: 6, habits: "Laptop, LED lights, No AC", icon: "📚" },
];

// ---- Appliance catalog ----
export const APPLIANCES: Appliance[] = [
  { id: "ac", name: "Air Conditioner", icon: "❄️", wattage: 1500, category: "cooling" },
  { id: "heater", name: "Electric Heater", icon: "🔥", wattage: 2000, category: "heating" },
  { id: "fridge", name: "Refrigerator", icon: "🧊", wattage: 150, category: "kitchen" },
  { id: "tv", name: "Television", icon: "📺", wattage: 120, category: "electronics" },
  { id: "laptop", name: "Laptop", icon: "💻", wattage: 65, category: "electronics" },
  { id: "lights", name: "LED Lights", icon: "💡", wattage: 40, category: "lighting" },
  { id: "washing", name: "Washing Machine", icon: "🧺", wattage: 500, category: "laundry" },
  { id: "ev", name: "EV Charger", icon: "🔌", wattage: 7000, category: "transport" },
  { id: "waterheater", name: "Water Heater", icon: "🚿", wattage: 4000, category: "water" },
  { id: "fan", name: "Ceiling Fan", icon: "🌀", wattage: 75, category: "cooling" },
  { id: "microwave", name: "Microwave", icon: "🍲", wattage: 1000, category: "kitchen" },
  { id: "pc", name: "Gaming PC", icon: "🎮", wattage: 500, category: "electronics" },
  // India-only appliances
  { id: "cooler", name: "Desert Cooler", icon: "🌬️", wattage: 200, category: "cooling", indiaOnly: true },
  { id: "geyser", name: "Geyser", icon: "♨️", wattage: 3000, category: "heating", indiaOnly: true },
  { id: "mixer", name: "Mixer Grinder", icon: "🥤", wattage: 750, category: "kitchen", indiaOnly: true },
  { id: "iron", name: "Iron", icon: "👔", wattage: 1100, category: "laundry", indiaOnly: true },
];

export function getAppliance(id: string): Appliance | undefined {
  return APPLIANCES.find((a) => a.id === id);
}

export const HABIT_TAGS = [
  "Work from Home",
  "EV Owner",
  "Smart Home",
  "Pool/Spa",
  "Solar Already",
  "Night Owl",
  "Large Family",
  "Remote Worker",
];

/**
 * Real, ready-to-use example habit sentences. Users can load any of these
 * into the habits textarea with one click — no more empty or gibberish input.
 * Each example is a complete, natural-English description of a household
 * energy profile.
 */
export const EXAMPLE_HABITS: { label: string; icon: string; text: string }[] = [
  {
    label: "Work-from-Home Family",
    icon: "🏡",
    text: "I work from home five days a week and keep my laptop running for about 10 hours a day. We run the AC for 6 hours during summer afternoons, use LED lights throughout the house, and the refrigerator is always on. We charge our phones overnight and do laundry twice a week.",
  },
  {
    label: "EV Owner & Night Owl",
    icon: "🚗",
    text: "I own an electric vehicle and charge it every night between 11 PM and 6 AM. I am usually up late gaming on my PC for about 4 hours, and I keep the AC set to 23°C while sleeping. I have smart LED bulbs and a smart thermostat that I program to save energy when I'm at work during the day.",
  },
  {
    label: "Eco-Conscious Student",
    icon: "📚",
    text: "I live in a small apartment and mostly use my laptop for studying around 8 hours a day. I don't have an AC — I use a ceiling fan instead. All my lights are LED, I unplug devices when not in use, and I cook with a microwave and electric kettle. I line-dry my clothes instead of using a dryer.",
  },
  {
    label: "Large Indian Household",
    icon: "🏠",
    text: "We are a family of five in India. We run ceiling fans in every room for most of the day, the refrigerator runs 24/7, and we use a geyser for hot water in the mornings for about 30 minutes. The TV is on for 4 hours in the evening, and we use a mixer grinder daily for cooking. We have LED lights throughout and run the AC only in the bedroom at night.",
  },
  {
    label: "Smart Home with Solar",
    icon: "☀️",
    text: "I already have rooftop solar panels that cover about 70% of my daytime usage. I have a smart home system controlling lights, thermostat, and appliances. I run the dishwasher and washing machine during peak solar hours, keep the AC at 25°C, and charge my EV during the day when possible. I monitor my consumption through a smart meter.",
  },
  {
    label: "Cold Climate Home",
    icon: "❄️",
    text: "I live in a cold climate where I run electric heating for about 8 hours a day in winter. The water heater runs for an hour every morning for showers. I work from home on a desktop PC for 9 hours, use LED lights throughout, and cook with an electric oven most evenings. I have a smart thermostat programmed to lower heating at night.",
  },
];


// ---- Energy tips library ----
export const ENERGY_TIPS: Record<string, string[]> = {
  ac: [
    "Set AC to 24-26°C. Each degree lower uses 6% more energy.",
    "Use ceiling fans alongside AC to circulate cool air.",
    "Clean AC filters monthly for 5-15% efficiency gain.",
  ],
  heating: [
    "Lower thermostat by 1°C to save 10% on heating.",
    "Seal windows and doors to prevent heat loss.",
    "Use solar heating where possible for water.",
  ],
  office: [
    "Use laptops — they use 80% less power than desktops.",
    "Smart power strips cut phantom loads by 10%.",
    "Enable sleep mode after 5 minutes of inactivity.",
  ],
  ev: [
    "Charge off-peak (10PM-6AM) for lower rates.",
    "Maintain battery between 20-80% for longevity.",
    "Precondition cabin while plugged in.",
  ],
  appliances: [
    "Wash clothes in cold water to cut 90% of energy use.",
    "Air dry dishes instead of heated dry cycle.",
    "Run only full loads in washer and dishwasher.",
  ],
  lighting: [
    "Switch to LEDs — they use 75% less energy.",
    "Use natural daylight wherever possible.",
    "Install motion sensors in low-traffic areas.",
  ],
};

// Currency conversion for display (approximate, relative to USD)
export const USD_CONVERSION: Partial<Record<CountryCode, number>> = {
  IN: 83, JP: 150, KR: 1350, RU: 90, MX: 18, ZA: 18,
  AR: 900, EG: 48, NG: 1500, SE: 10, NO: 10, DK: 6.5,
  IS: 140, PL: 4,
};
