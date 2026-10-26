import { getLatestRawLessons, getPersonalSlots } from "@/lib/schedule/queries";
import { DAY_NAMES } from "@/lib/schedule/dayNames";
import { GradeWideGrid } from "./GradeWideGrid";

export async function SetupPicker() {
  const [lessons, slots] = await Promise.all([getLatestRawLessons(), getPersonalSlots()]);

  if (lessons.length === 0) {
    return <p className="text-neutral-500">אין עדיין נתוני מערכת — יש להפעיל סנכרון קודם.</p>;
  }

  const dayIndexes = [...new Set(lessons.map((l) => l.dayIndex))].sort((a, b) => a - b);
  const days = dayIndexes.map((dayIndex) => ({
    dayIndex,
    label: DAY_NAMES[dayIndex] ?? `יום ${dayIndex}`,
  }));

  const periodMap = new Map<number, { start: string | null; end: string | null }>();
  for (const l of lessons) {
    if (!periodMap.has(l.periodNumber)) {
      periodMap.set(l.periodNumber, { start: l.periodStart, end: l.periodEnd });
    }
  }
  const periods = [...periodMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([periodNumber, times]) => ({ periodNumber, ...times }));

  return (
    <GradeWideGrid
      lessons={lessons.map((l) => ({
        dayIndex: l.dayIndex,
        periodNumber: l.periodNumber,
        periodStart: l.periodStart,
        periodEnd: l.periodEnd,
        subject: l.subject,
        room: l.room,
        teacher: l.teacher,
        signature: l.signature,
      }))}
      days={days}
      periods={periods}
      initialSelection={slots.map((s) => ({
        dayIndex: s.dayIndex,
        periodNumber: s.periodNumber,
        signature: s.signature,
      }))}
    />
  );
}
