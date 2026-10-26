import { getPersonalSchedule } from "@/lib/schedule/queries";
import { DAY_NAMES } from "@/lib/schedule/dayNames";
import { CHANGE_LABELS } from "@/lib/schedule/changeLabels";

export async function PersonalScheduleGrid() {
  const slots = await getPersonalSchedule();

  if (slots.length === 0) {
    return <p className="text-neutral-500">לא הוגדרה מערכת שעות אישית — יש להשתמש בבחירת המערכת.</p>;
  }

  const dayIndexes = [...new Set(slots.map((s) => s.dayIndex))].sort((a, b) => a - b);
  const days = dayIndexes.map((dayIndex) => ({
    dayIndex,
    label: DAY_NAMES[dayIndex] ?? `יום ${dayIndex}`,
  }));

  const periodMap = new Map<number, { start: string | null; end: string | null }>();
  for (const s of slots) {
    if (!periodMap.has(s.periodNumber)) {
      periodMap.set(s.periodNumber, { start: s.periodStart, end: s.periodEnd });
    }
  }
  const periods = [...periodMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([periodNumber, times]) => ({ periodNumber, ...times }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" dir="rtl">
        <thead>
          <tr>
            <th className="p-2 text-right"></th>
            {days.map((d) => (
              <th key={d.dayIndex} className="whitespace-nowrap p-2 text-right">
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.periodNumber} className="border-t border-neutral-200">
              <td className="whitespace-nowrap p-2 align-top text-neutral-500">
                <div>{p.periodNumber}</div>
                {p.start && p.end && (
                  <div className="text-xs">
                    {p.start}–{p.end}
                  </div>
                )}
              </td>
              {days.map((d) => {
                const slot = slots.find(
                  (s) => s.dayIndex === d.dayIndex && s.periodNumber === p.periodNumber
                );
                return (
                  <td key={d.dayIndex} className="p-2 align-top">
                    {slot && (
                      <div
                        className={`rounded border px-2 py-1 text-right ${
                          slot.change
                            ? "border-red-300 bg-red-50"
                            : "border-neutral-200"
                        }`}
                      >
                        <div className="font-medium">{slot.subject}</div>
                        {(slot.room || slot.teacher) && (
                          <div className="text-neutral-500">
                            {[slot.room, slot.teacher].filter(Boolean).join(" · ")}
                          </div>
                        )}
                        {slot.change && (
                          <div className="font-medium text-red-600">
                            {CHANGE_LABELS[slot.change.eventType]}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
