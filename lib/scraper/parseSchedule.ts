import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { makeSignature } from "./signature";

export type ParsedLesson = {
  dayIndex: number;
  periodNumber: number;
  periodStart: string | null;
  periodEnd: string | null;
  subject: string;
  room: string | null;
  teacher: string | null;
  signature: string;
  rawHtml: string;
};

export type ChangeType = "substitute" | "cancellation" | "event";

export type ParsedChange = {
  dayIndex: number;
  periodNumber: number;
  changeType: ChangeType;
  rawText: string;
};

export type ParsedSchedule = {
  lessons: ParsedLesson[];
  changes: ParsedChange[];
};

function classifyChange(className: string): ChangeType {
  if (className.includes("TableFreeChange")) return "cancellation";
  if (className.includes("TableEventChange")) return "event";
  return "substitute";
}

// Lesson markup is `<b>Subject</b>&nbsp;&nbsp;(Room)<br>Teacher`, with room optional.
function parseLessonBody($lesson: cheerio.Cheerio<AnyNode>): {
  subject: string;
  room: string | null;
  teacher: string | null;
} {
  const subject = $lesson.find("b").first().text().trim();
  const innerHtml = $lesson.html() ?? "";
  const afterSubject = innerHtml.replace(/^<b>[\s\S]*?<\/b>/, "");
  const parts = afterSubject.split(/<br\s*\/?>/i);

  const roomRaw = (parts[0] ?? "").replace(/&nbsp;/gi, " ").trim();
  const room = roomRaw ? roomRaw.replace(/^\(|\)$/g, "").trim() : null;

  const teacherRaw = (parts[1] ?? "").replace(/&nbsp;/gi, " ").trim();
  const teacher = teacherRaw || null;

  return { subject, room, teacher };
}

export function parseSchedule(html: string): ParsedSchedule {
  const $ = cheerio.load(html);
  const lessons: ParsedLesson[] = [];
  const changes: ParsedChange[] = [];

  const rows = $("table.TTTable tbody > tr");

  rows.each((rowIndex, rowEl) => {
    if (rowIndex === 0) return; // header row: day titles, no period

    const row = $(rowEl);
    const periodCellBold = row.find("td.CName").first().find("b").first();
    const periodNumberText = periodCellBold.contents().first().text().trim();
    const periodNumber = Number.parseInt(periodNumberText, 10);
    if (Number.isNaN(periodNumber)) return;

    const times = periodCellBold
      .find("span.hour-time")
      .map((_, el) => $(el).text().trim())
      .get();
    const periodStart = times[0] ?? null;
    const periodEnd = times[1] ?? null;

    row.find("td.TTCell").each((_, cellEl) => {
      const cell = $(cellEl);
      const dayIndex = Number.parseInt(cell.attr("data-day") ?? "", 10);
      if (Number.isNaN(dayIndex)) return;

      cell.children("div.TTChange").each((_, changeEl) => {
        const $change = $(changeEl);
        const rawText = $change.text().trim();
        if (!rawText) return;
        changes.push({
          dayIndex,
          periodNumber,
          changeType: classifyChange($change.attr("class") ?? ""),
          rawText,
        });
      });

      cell.children("div.TTLesson").each((_, lessonEl) => {
        const $lesson = $(lessonEl);
        const { subject, room, teacher } = parseLessonBody($lesson);
        if (!subject) return;
        lessons.push({
          dayIndex,
          periodNumber,
          periodStart,
          periodEnd,
          subject,
          room,
          teacher,
          signature: makeSignature(subject, room, teacher),
          rawHtml: $.html($lesson) ?? "",
        });
      });
    });
  });

  return { lessons, changes };
}
