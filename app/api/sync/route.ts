import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync/runSync";

// Manual "sync now" trigger for the settings page. Unauthenticated like the
// rest of the app (no login) — the cron route stays bearer-protected since
// Vercel's cron invocations come from outside the browser session.
export async function POST() {
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
