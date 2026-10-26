export function LessonChip({
  subject,
  room,
  teacher,
  isSelected,
  onClick,
}: {
  subject: string;
  room: string | null;
  teacher: string | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2 py-1 text-right text-xs transition-colors ${
        isSelected
          ? "border-blue-600 bg-blue-50 text-blue-900"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <div className="font-medium">{subject}</div>
      {(room || teacher) && (
        <div className="text-neutral-500">{[room, teacher].filter(Boolean).join(" · ")}</div>
      )}
    </button>
  );
}
