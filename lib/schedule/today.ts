import { io } from "next/cache";

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
};

// Source's day index is Sun=0..Fri=5 (see DAY_NAMES). The school week has no
// Saturday, so "today" returns null then — callers should treat that as "no
// school today" rather than an error.
export async function getTodayDayIndex(now?: Date): Promise<number | null> {
  if (!now) await io();
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
  }).format(now ?? new Date());
  return WEEKDAY_TO_INDEX[weekday] ?? null;
}
