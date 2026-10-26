"use client";

import { useState } from "react";
import type { Task } from "@prisma/client";

export function TaskForm({ onCreated }: { onCreated: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim() || null,
          notes: notes.trim() || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error("יצירת המטלה נכשלה");
      const { task } = await res.json();
      onCreated(task);
      setTitle("");
      setSubject("");
      setDueDate("");
      setNotes("");
    } catch {
      setError("יצירת המטלה נכשלה, נסה/י שוב");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded border border-neutral-200 p-3" dir="rtl">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="כותרת המטלה"
        className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
        required
      />
      <div className="flex gap-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="מקצוע (לא חובה)"
          className="w-1/2 rounded border border-neutral-300 px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-1/2 rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="הערות (לא חובה)"
        className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
        rows={2}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        הוספת מטלה
      </button>
    </form>
  );
}
