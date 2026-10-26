import type { ParsedChange, ParsedLesson } from "./parseSchedule";

// Heuristic only: the source has no explicit change->lesson link, so this
// scores each same-cell lesson by how much of its subject/teacher/room text
// appears in the change's raw text. Unmatched changes return null rather
// than throwing, since a missed match is just a missing annotation.
export function matchChangeToLesson(
  change: ParsedChange,
  lessonsInSameCell: ParsedLesson[]
): string | null {
  if (lessonsInSameCell.length === 0) return null;
  if (lessonsInSameCell.length === 1) return lessonsInSameCell[0].signature;

  let best: { signature: string; score: number } | null = null;
  for (const lesson of lessonsInSameCell) {
    let score = 0;
    if (lesson.subject && change.rawText.includes(lesson.subject)) score += 2;
    if (lesson.teacher && change.rawText.includes(lesson.teacher)) score += 2;
    if (lesson.room && change.rawText.includes(lesson.room)) score += 1;
    if (score > 0 && (!best || score > best.score)) {
      best = { signature: lesson.signature, score };
    }
  }
  return best?.signature ?? null;
}
