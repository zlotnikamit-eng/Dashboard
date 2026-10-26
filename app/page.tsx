import { Suspense } from "react";
import Link from "next/link";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentChanges } from "@/components/dashboard/RecentChanges";
import { TaskWidget } from "@/components/dashboard/TaskWidget";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-4 md:p-8" dir="rtl">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">לוח הבקרה שלי</h1>
        <nav className="flex gap-4 text-sm text-blue-600">
          <Link href="/schedule">מערכת שעות</Link>
          <Link href="/tasks">מטלות</Link>
          <Link href="/settings">הגדרות</Link>
        </nav>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-medium">היום</h2>
        <Suspense fallback={<p>טוען...</p>}>
          <TodaySchedule />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">שינויים אחרונים</h2>
        <Suspense fallback={<p>טוען...</p>}>
          <RecentChanges />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">מטלות קרובות</h2>
        <Suspense fallback={<p>טוען...</p>}>
          <TaskWidget />
        </Suspense>
      </section>

      <Link href="/setup/edit" className="block text-sm text-blue-600">
        המערכת שלי השתנתה? ←
      </Link>
    </main>
  );
}
