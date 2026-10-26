import type { Task } from "@prisma/client";

export type TaskBuckets = {
  overdue: Task[];
  today: Task[];
  thisWeek: Task[];
  later: Task[];
  noDate: Task[];
};

export function groupTasksByDueDate(tasks: Task[], now: Date = new Date()): TaskBuckets {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const buckets: TaskBuckets = { overdue: [], today: [], thisWeek: [], later: [], noDate: [] };

  for (const task of tasks) {
    if (!task.dueDate) {
      buckets.noDate.push(task);
      continue;
    }
    const due = new Date(task.dueDate);
    if (due < startOfToday) buckets.overdue.push(task);
    else if (due < endOfToday) buckets.today.push(task);
    else if (due < endOfWeek) buckets.thisWeek.push(task);
    else buckets.later.push(task);
  }

  return buckets;
}
