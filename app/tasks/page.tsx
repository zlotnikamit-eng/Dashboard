import { Suspense } from "react";
import { getAllTasks } from "@/lib/tasks/queries";
import { TaskList } from "@/components/tasks/TaskList";

async function TasksSection() {
  const tasks = await getAllTasks();
  return <TaskList initialTasks={tasks} />;
}

export default function TasksPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 md:p-8" dir="rtl">
      <h1 className="mb-4 text-xl font-semibold">מטלות</h1>
      <Suspense fallback={<p>טוען...</p>}>
        <TasksSection />
      </Suspense>
    </main>
  );
}
