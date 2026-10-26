import { getRecentChangeEvents } from "@/lib/schedule/queries";

function formatDetectedAt(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export async function RecentChanges() {
  const events = await getRecentChangeEvents(5);

  if (events.length === 0) {
    return <p className="text-neutral-500">אין שינויים אחרונים</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {events.map((event) => (
        <li key={event.id} className="py-2">
          <div>{event.description}</div>
          <div className="text-sm text-neutral-500">{formatDetectedAt(event.detectedAt)}</div>
        </li>
      ))}
    </ul>
  );
}
