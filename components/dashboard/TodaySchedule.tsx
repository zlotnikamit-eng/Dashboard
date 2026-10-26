import { getTodayDayIndex } from "@/lib/schedule/today";
import { getPersonalSchedule } from "@/lib/schedule/queries";
import { CHANGE_LABELS } from "@/lib/schedule/changeLabels";

export async function TodaySchedule() {
  const dayIndex = await getTodayDayIndex();

  if (dayIndex === null) {
    return <p className="text-neutral-500">אין לימודים היום</p>;
  }

  const slots = await getPersonalSchedule(dayIndex);

  if (slots.length === 0) {
    return <p className="text-neutral-500">לא הוגדרה מערכת שעות להיום</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {slots.map((slot) => (
        <li key={slot.id} className="flex items-center justify-between gap-3 py-2">
          <div>
            <div className="font-medium">{slot.subject}</div>
            <div className="text-sm text-neutral-500">
              {[slot.room, slot.teacher].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div className="text-left text-sm text-neutral-500">
            {slot.periodStart && slot.periodEnd && (
              <div>
                {slot.periodStart}–{slot.periodEnd}
              </div>
            )}
            {slot.change && (
              <div className="font-medium text-red-600">{CHANGE_LABELS[slot.change.eventType]}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
