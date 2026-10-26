"use client";

import { useState } from "react";
import { LessonChip } from "./LessonChip";

type Lesson = {
  dayIndex: number;
  periodNumber: number;
  periodStart: string | null;
  periodEnd: string | null;
  subject: string;
  room: string | null;
  teacher: string | null;
  signature: string;
};

type Day = { dayIndex: number; label: string };
type Period = { periodNumber: number; start: string | null; end: string | null };
type Selection = { dayIndex: number; periodNumber: number; signature: string };

function cellKey(dayIndex: number, periodNumber: number) {
  return `${dayIndex}-${periodNumber}`;
}

export function GradeWideGrid({
  lessons,
  days,
  periods,
  initialSelection,
}: {
  lessons: Lesson[];
  days: Day[];
  periods: Period[];
  initialSelection: Selection[];
}) {
  const [selection, setSelection] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const s of initialSelection) m.set(cellKey(s.dayIndex, s.periodNumber), s.signature);
    return m;
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function toggle(dayIndex: number, periodNumber: number, signature: string) {
    setStatus("idle");
    setSelection((prev) => {
      const next = new Map(prev);
      const key = cellKey(dayIndex, periodNumber);
      if (next.get(key) === signature) {
        next.delete(key);
      } else {
        next.set(key, signature);
      }
      return next;
    });
  }

  async function save() {
    setStatus("saving");
    const selections = [...selection.entries()].flatMap(([key, signature]) => {
      const [dayIndex, periodNumber] = key.split("-").map(Number);
      const lesson = lessons.find(
        (l) => l.dayIndex === dayIndex && l.periodNumber === periodNumber && l.signature === signature
      );
      return lesson
        ? [
            {
              dayIndex,
              periodNumber,
              subject: lesson.subject,
              room: lesson.room,
              teacher: lesson.teacher,
              signature,
            },
          ]
        : [];
    });

    try {
      const res = await fetch("/api/personalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
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
                  const cellLessons = lessons.filter(
                    (l) => l.dayIndex === d.dayIndex && l.periodNumber === p.periodNumber
                  );
                  const selected = selection.get(cellKey(d.dayIndex, p.periodNumber));
                  return (
                    <td key={d.dayIndex} className="p-2 align-top">
                      <div className="flex flex-col gap-1">
                        {cellLessons.map((lesson) => (
                          <LessonChip
                            key={lesson.signature}
                            subject={lesson.subject}
                            room={lesson.room}
                            teacher={lesson.teacher}
                            isSelected={selected === lesson.signature}
                            onClick={() => toggle(d.dayIndex, p.periodNumber, lesson.signature)}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {status === "saving" ? "שומר..." : "שמור"}
        </button>
        {status === "saved" && <span className="text-green-600">נשמר</span>}
        {status === "error" && <span className="text-red-600">שגיאה בשמירה</span>}
      </div>
    </div>
  );
}
