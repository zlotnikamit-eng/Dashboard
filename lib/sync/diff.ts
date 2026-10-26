import { prisma } from "@/lib/db";
import type { ChangeEvent, PersonalSlot, RawChangeSnapshot } from "@prisma/client";

const TAB = "changestable";
const WEEK_OFFSET = 0;

export type DiffEventType = "cancelled" | "room_change" | "substitute" | "removed_lesson";

// changeType "substitute" covers both a sub teacher and a room swap in the
// source markup — the text itself is the only way to tell them apart.
export function classifyChangeEvent(change: RawChangeSnapshot): DiffEventType {
  if (change.changeType === "cancellation" || change.changeType === "event") return "cancelled";
  return change.rawText.includes("חדר") ? "room_change" : "substitute";
}

// Match on the slot's own subject/teacher text rather than the scrape-time
// matchedSignature: a changed lesson's own TTLesson entry is usually absent
// from the cell, so same-cell signature matching mostly can't find it.
export function changeMentionsSlot(change: RawChangeSnapshot, slot: PersonalSlot): boolean {
  return (
    (!!slot.subject && change.rawText.includes(slot.subject)) ||
    (!!slot.teacher && change.rawText.includes(slot.teacher))
  );
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Compares the latest raw snapshot against each active PersonalSlot and
// creates a ChangeEvent for anything new since today — dedup by (slot,
// eventType, today) so an ongoing cancellation doesn't re-push every run.
export async function runDiff(): Promise<{ created: ChangeEvent[] }> {
  const [slots, lessons, changes] = await Promise.all([
    prisma.personalSlot.findMany({ where: { active: true } }),
    prisma.rawLessonSnapshot.findMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
    prisma.rawChangeSnapshot.findMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
  ]);

  const todayStart = startOfTodayUtc();
  const created: ChangeEvent[] = [];

  for (const slot of slots) {
    const stillThere = lessons.some(
      (l) => l.dayIndex === slot.dayIndex && l.periodNumber === slot.periodNumber && l.signature === slot.signature
    );
    const cellChanges = changes.filter(
      (c) => c.dayIndex === slot.dayIndex && c.periodNumber === slot.periodNumber
    );
    const matchedChange = cellChanges.find((c) => changeMentionsSlot(c, slot));

    let eventType: DiffEventType | null = null;
    let description: string | null = null;

    if (matchedChange) {
      eventType = classifyChangeEvent(matchedChange);
      description = matchedChange.rawText;
    } else if (!stillThere) {
      eventType = "removed_lesson";
      description = `${slot.subject}${slot.teacher ? ` (${slot.teacher})` : ""} no longer appears on the schedule`;
    }

    if (!eventType || !description) continue;

    const alreadyLoggedToday = await prisma.changeEvent.findFirst({
      where: { personalSlotId: slot.id, eventType, detectedAt: { gte: todayStart } },
    });
    if (alreadyLoggedToday) continue;

    const event = await prisma.changeEvent.create({
      data: {
        personalSlotId: slot.id,
        dayIndex: slot.dayIndex,
        periodNumber: slot.periodNumber,
        eventType,
        description,
      },
    });
    created.push(event);
  }

  return { created };
}
