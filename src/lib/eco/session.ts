import { db } from "@/lib/db";
import { cookies } from "next/headers";

const SESSION_COOKIE = "eco-session";

/**
 * Check if the database is available. On serverless platforms like Netlify,
 * the SQLite database may not persist (ephemeral filesystem). We detect this
 * and gracefully degrade — the app still works, history just won't persist.
 */
let dbAvailable: boolean | null = null;
async function isDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  try {
    await db.session.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  return dbAvailable;
}

/**
 * Get or create an anonymous session ID from the request cookies.
 * If the DB is unavailable (e.g. on Netlify serverless), returns a random
 * ID so the response still succeeds — history just won't persist.
 */
export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;

  // If DB is unavailable, use a cookie-only session (random ID)
  if (!(await isDbAvailable())) {
    const id = existing || crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return id;
  }

  if (existing) {
    const session = await db.session.findUnique({ where: { id: existing } });
    if (session) return session.id;
  }

  const session = await db.session.create({ data: {} });
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return session.id;
}

/**
 * Persist an analysis record for history. Non-blocking — failures are
 * swallowed so the analysis response is never blocked.
 */
export async function saveAnalysis(sessionId: string, data: {
  location: string;
  state?: string;
  city?: string;
  town?: string;
  dailyHours: number;
  habits: string;
  appliancesJson: string;
  carbonKg: number;
  treesNeeded: number;
  annualSavings: string;
  grade: string;
}) {
  if (!(await isDbAvailable())) return; // no-op on serverless without DB
  try {
    await db.analysis.create({
      data: { sessionId, ...data },
    });
  } catch (e) {
    console.error("Failed to save analysis:", e);
  }
}
