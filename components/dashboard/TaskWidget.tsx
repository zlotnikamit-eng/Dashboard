import Link from "next/link";
import { getNextUndoneTasks } from "@/lib/tasks/queries";

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
  }).format(date);
}

export async function TaskWidget() {
  const tasks = await getNextUndoneTasks(3);

  if (tasks.length === 0) {
    return <p className="text-neutral-500">אין מטלות פתוחות</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-3 py-2">
          <div>
            <div className="font-medium">{task.title}</div>
            {task.subject && <div className="text-sm text-neutral-500">{task.subject}</div>}
          </div>
          {task.dueDate && (
            <div className="text-sm text-neutral-500">{formatDueDate(task.dueDate)}</div>
          )}
        </li>
      ))}
      <li className="pt-2">
        <Link href="/tasks" className="text-sm text-blue-600">
          כל המטלות ←
        </Link>
      </li>
    </ul>
  );
}
