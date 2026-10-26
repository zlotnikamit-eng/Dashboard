import type { DiffEventType } from "@/lib/sync/diff";

export const CHANGE_LABELS: Record<DiffEventType, string> = {
  cancelled: "מבוטל",
  room_change: "שינוי חדר",
  substitute: "מורה מחליפה",
  removed_lesson: "לא מופיע יותר",
};
