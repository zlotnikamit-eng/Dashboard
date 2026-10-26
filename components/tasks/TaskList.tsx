"use client";

import { useMemo, useState } from "react";
import type { Task } from "@prisma/client";
import { groupTasksByDueDate } from "@/lib/tasks/grouping";
import { TaskForm } from "@/components/tasks/TaskForm";

const SECTION_LABELS: { key: "overdue" | "today" | "thisWeek" | "later" | "noDate"; label: string }[] = [
  { key: "overdue", label: "באיחור" },
  { key: "today", label: "היום" },
  { key: "thisWeek", label: "השבוע" },
  { key: "later", label: "בהמשך" },
  { key: "noDate", label: "ללא תאריך" },
];

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", dateStyle: "short" }).format(date);
}

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showDone, setShowDone] = useState(false);

  async function toggleDone(task: Task) {
    const nextDone = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: nextDone }),
      });
      if (!res.ok) throw new Error("update failed");
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
    }
  }

  function addTask(task: Task) {
    setTasks((prev) => [task, ...prev]);
  }

  const undone = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const done = useMemo(() => tasks.filter((t) => t.done), [tasks]);
  const buckets = useMemo(() => groupTasksByDueDate(undone), [undone]);

  return (
    <div className="space-y-6" dir="rtl">
      <TaskForm onCreated={addTask} />

      {SECTION_LABELS.map(({ key, label }) => {
        const items = buckets[key];
        if (items.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500">{label}</h2>
            <ul className="divide-y divide-neutral-200">
              {items.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleDone} />
              ))}
            </ul>
          </section>
        );
      })}

      <label className="flex items-center gap-2 text-sm text-neutral-500">
        <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
        הצג מטלות שהושלמו
      </label>

      {showDone && done.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">הושלמו</h2>
          <ul className="divide-y divide-neutral-200">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleDone} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <input type="checkbox" checked={task.done} onChange={() => onToggle(task)} />
      <div className="flex-1">
        <div className={task.done ? "text-neutral-400 line-through" : "font-medium"}>{task.title}</div>
        {task.subject && <div className="text-sm text-neutral-500">{task.subject}</div>}
        {task.notes && <div className="text-sm text-neutral-500">{task.notes}</div>}
      </div>
      {task.dueDate && <div className="text-sm text-neutral-500">{formatDueDate(task.dueDate)}</div>}
    </li>
  );
}
