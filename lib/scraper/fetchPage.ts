const BASE_URL = "https://beitbiram.shahaf.site/";
const FETCH_TIMEOUT_MS = 15_000;

export type ScheduleTab = "changestable" | "timetable" | "changes" | "exams" | "events" | "messages";

export async function fetchSchedulePage(
  classId: string,
  tab: ScheduleTab,
  weekOffset = 0
): Promise<string> {
  const url = new URL(BASE_URL);
  url.searchParams.set("cls", classId);
  url.searchParams.set("tab", tab);
  url.searchParams.set("week", String(weekOffset));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": process.env.SCRAPER_USER_AGENT ?? "school-dashboard-personal/1.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed for ${url.toString()}: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
