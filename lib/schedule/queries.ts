import { prisma } from "@/lib/db";
import { classifyChangeEvent, changeMentionsSlot, type DiffEventType } from "@/lib/sync/diff";

const TAB = "changestable";
const WEEK_OFFSET = 0;

export async function getLatestRawLessons() {
  return prisma.rawLessonSnapshot.findMany({
    where: { tab: TAB, weekOffset: WEEK_OFFSET },
    orderBy: [{ dayIndex: "asc" }, { periodNumber: "asc" }],
  });
}

export async function getPersonalSlots() {
  return prisma.personalSlot.findMany({
    where: { active: true },
    orderBy: [{ dayIndex: "asc" }, { periodNumber: "asc" }],
  });
}

export type PersonalScheduleItem = {
  id: string;
  dayIndex: number;
  periodNumber: number;
  periodStart: string | null;
  periodEnd: string | null;
  subject: string;
  room: string | null;
  teacher: string | null;
  change: { eventType: DiffEventType; description: string } | null;
};

// Joins active PersonalSlots against the latest grade-wide scrape, annotating
// each with a change (cancellation/room swap/substitute/removed) when the
// current snapshot shows one — same matching heuristic as the diff job, but
// read-only (doesn't touch ChangeEvent).
export async function getPersonalSchedule(dayIndex?: number): Promise<PersonalScheduleItem[]> {
  const [slots, lessons, changes] = await Promise.all([
    prisma.personalSlot.findMany({
      where: { active: true, ...(dayIndex !== undefined ? { dayIndex } : {}) },
      orderBy: [{ dayIndex: "asc" }, { periodNumber: "asc" }],
    }),
    prisma.rawLessonSnapshot.findMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
    prisma.rawChangeSnapshot.findMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
  ]);

  return slots.map((slot) => {
    const lesson = lessons.find(
      (l) => l.dayIndex === slot.dayIndex && l.periodNumber === slot.periodNumber && l.signature === slot.signature
    );
    const cellChanges = changes.filter(
      (c) => c.dayIndex === slot.dayIndex && c.periodNumber === slot.periodNumber
    );
    const matchedChange = cellChanges.find((c) => changeMentionsSlot(c, slot));

    const change = matchedChange
      ? { eventType: classifyChangeEvent(matchedChange), description: matchedChange.rawText }
      : !lesson
        ? {
            eventType: "removed_lesson" as DiffEventType,
            description: `${slot.subject}${slot.teacher ? ` (${slot.teacher})` : ""} לא מופיע יותר במערכת`,
          }
        : null;

    return {
      id: slot.id,
      dayIndex: slot.dayIndex,
      periodNumber: slot.periodNumber,
      periodStart: lesson?.periodStart ?? null,
      periodEnd: lesson?.periodEnd ?? null,
      subject: slot.subject,
      room: slot.room,
      teacher: slot.teacher,
      change,
    };
  });
}

export async function getRecentChangeEvents(limit = 5) {
  return prisma.changeEvent.findMany({
    orderBy: { detectedAt: "desc" },
    take: limit,
  });
}
