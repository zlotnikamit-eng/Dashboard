import { Suspense } from "react";
import { PersonalScheduleGrid } from "@/components/schedule/PersonalScheduleGrid";

export default function SchedulePage() {
  return (
    <main className="p-4 md:p-8" dir="rtl">
      <h1 className="mb-4 text-xl font-semibold">מערכת שעות שבועית</h1>
      <Suspense fallback={<p>טוען...</p>}>
        <PersonalScheduleGrid />
      </Suspense>
    </main>
  );
}
