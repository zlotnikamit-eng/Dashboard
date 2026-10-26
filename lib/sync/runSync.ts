import { prisma } from "@/lib/db";
import { fetchSchedulePage } from "@/lib/scraper/fetchPage";
import { parseSchedule } from "@/lib/scraper/parseSchedule";
import { matchChangeToLesson } from "@/lib/scraper/matchChangeToLesson";
import { runDiff } from "@/lib/sync/diff";
import { sendPushToAll } from "@/lib/push/sendPush";
import { DAY_NAMES } from "@/lib/schedule/dayNames";

const TAB = "changestable";
const WEEK_OFFSET = 0;

async function getOrCreateConfig() {
  const existing = await prisma.appConfig.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  const classId = process.env.SOURCE_CLASS_ID;
  if (!classId) {
    throw new Error("No AppConfig row exists and SOURCE_CLASS_ID is not set");
  }
  return prisma.appConfig.create({ data: { id: 1, classId } });
}

export type SyncResult = {
  tab: string;
  weekOffset: number;
  lessonsStored: number;
  changesStored: number;
  unmatchedChanges: number;
  changeEventsCreated: number;
};

// Shared by the cron route (bearer-protected) and the manual "sync now"
// route (unauthenticated — this app has no login, so there's nothing to
// protect it from beyond whoever already has the dashboard open).
export async function runSync(): Promise<SyncResult> {
  try {
    const config = await getOrCreateConfig();
    const html = await fetchSchedulePage(config.classId, TAB, WEEK_OFFSET);
    const { lessons, changes } = parseSchedule(html);

    const changeRows = changes.map((change) => {
      const sameCellLessons = lessons.filter(
        (l) => l.dayIndex === change.dayIndex && l.periodNumber === change.periodNumber
      );
      return {
        tab: TAB,
        weekOffset: WEEK_OFFSET,
        dayIndex: change.dayIndex,
        periodNumber: change.periodNumber,
        changeType: change.changeType,
        rawText: change.rawText,
        matchedSignature: matchChangeToLesson(change, sameCellLessons),
      };
    });

    const lessonRows = lessons.map((lesson) => ({
      tab: TAB,
      weekOffset: WEEK_OFFSET,
      dayIndex: lesson.dayIndex,
      periodNumber: lesson.periodNumber,
      periodStart: lesson.periodStart,
      periodEnd: lesson.periodEnd,
      subject: lesson.subject,
      room: lesson.room,
      teacher: lesson.teacher,
      signature: lesson.signature,
      rawHtml: lesson.rawHtml,
    }));

    // RawLessonSnapshot/RawChangeSnapshot hold current state, not history —
    // replace this tab+week's rows wholesale so removed lessons don't linger.
    await prisma.$transaction([
      prisma.rawLessonSnapshot.deleteMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
      prisma.rawChangeSnapshot.deleteMany({ where: { tab: TAB, weekOffset: WEEK_OFFSET } }),
      // Two parallel groups can render identical subject/room/teacher text in
      // the same slot (same signature) — they're indistinguishable to the
      // user anyway, so skip rather than erroring on the unique constraint.
      prisma.rawLessonSnapshot.createMany({ data: lessonRows, skipDuplicates: true }),
      prisma.rawChangeSnapshot.createMany({ data: changeRows }),
      prisma.appConfig.update({
        where: { id: 1 },
        data: { lastSyncAt: new Date(), lastSyncStatus: "ok" },
      }),
    ]);

    const { created: changeEvents } = await runDiff();

    for (const event of changeEvents) {
      const day = DAY_NAMES[event.dayIndex] ?? `יום ${event.dayIndex}`;
      try {
        await sendPushToAll({
          title: `שינוי במערכת — ${day}, שעה ${event.periodNumber}`,
          body: event.description,
        });
        await prisma.changeEvent.update({
          where: { id: event.id },
          data: { pushedAt: new Date(), pushStatus: "sent" },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.changeEvent.update({
          where: { id: event.id },
          data: { pushStatus: `error: ${message}` },
        });
      }
    }

    return {
      tab: TAB,
      weekOffset: WEEK_OFFSET,
      lessonsStored: lessonRows.length,
      changesStored: changeRows.length,
      unmatchedChanges: changeRows.filter((c) => c.matchedSignature === null).length,
      changeEventsCreated: changeEvents.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.appConfig
      .update({ where: { id: 1 }, data: { lastSyncAt: new Date(), lastSyncStatus: `error: ${message}` } })
      .catch(() => {});
    throw err;
  }
}
