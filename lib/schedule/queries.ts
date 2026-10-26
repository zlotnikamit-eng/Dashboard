import { prisma } from "@/lib/db";

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
