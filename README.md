# Eco-Genius — Intelligent Energy Optimization

An AI-powered sustainability analyzer built with Next.js 16, TypeScript, Tailwind CSS 4, and shadcn/ui. Analyze your carbon footprint, get a 30-day action plan, explore renewable energy investments, and track eco achievements.

## Features

- **Cinematic WebGL background** — a forest photograph with a glass refraction lens that follows your cursor (adapted from a custom shader: spherical refraction + chromatic aberration + rim specular)
- **3-step analysis wizard** — Location → Appliances → Habits, with a realistic textured 3D Earth globe (NASA Blue Marble textures + clouds + atmosphere glow) showing 30 country markers
- **Results dashboard** — animated SVG energy-grade gauge, carbon equivalents, 30-day action plan, recharts (donut/bar/radar), efficiency tips, usage comparison
- **Investment estimators** — Solar PV, Wind Turbine, Micro Hydro with location-aware ROI
- **Gamification** — 12 achievements + eco score (stored in localStorage)
- **Reactive currency** — the whole app reflects the selected country's currency
- **30 countries** with carbon intensity, electricity rates, renewable potential

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **3D/Charts:** Three.js, Recharts, Framer Motion
- **Database:** Prisma + SQLite (optional — see Deployment)
- **Maps:** None (replaced with a 3D globe)

## Local Development

```bash
npm install
npm run db:push    # create the SQLite database (optional)
npm run dev        # start dev server on http://localhost:3000
```

## Deployment on Netlify

1. Push this repo to GitHub.
2. In Netlify, "Add new site" → "Import from Git" → select your repo.
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 20
4. Deploy.

### Database note

Netlify's serverless filesystem is ephemeral, so the SQLite database won't persist between invocations. **The app works fine without it** — analysis runs fully, achievements use localStorage. History simply won't persist across deploys.

To enable persistent history on Netlify:
1. Provision a PostgreSQL database (Neon, Supabase, etc.)
2. Set `DATABASE_URL` in Netlify's environment variables
3. Change `prisma/schema.prisma` provider from `"sqlite"` to `"postgresql"`
4. Run `npx prisma db push` against your new DB
5. Redeploy

## Project Structure

```
src/
├── app/
│   ├── api/            # 9 route handlers (analyze, weather, estimators, etc.)
│   ├── globals.css     # Aurora Eco design system
│   ├── layout.tsx
│   └── page.tsx        # page assembly
├── components/
│   ├── eco/            # Eco-Genius components (hero, wizard, globe, lens, etc.)
│   └── ui/             # shadcn/ui primitives
├── hooks/              # useCurrency, useAchievements, useScrollReveal
├── lib/
│   ├── eco/            # data.ts, analysis.ts, weather.ts, calculations.ts, session.ts
│   └── db.ts           # Prisma client
├── store/              # Zustand store
└── types/              # shared TypeScript types

public/
├── textures/           # Earth textures (day, normal, specular, clouds)
└── your-images/        # Forest background (surface.jpg, hidden.jpg)
```

## License

MIT
