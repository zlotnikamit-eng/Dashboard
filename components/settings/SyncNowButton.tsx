"use client";

import { useState } from "react";
import type { SyncResult } from "@/lib/sync/runSync";

export function SyncNowButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "הסנכרון נכשל");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "הסנכרון נכשל");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={busy}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {busy ? "מסנכרן..." : "סנכרון עכשיו"}
      </button>
      {result && (
        <p className="text-sm text-neutral-500">
          נמצאו {result.lessonsStored} שיעורים, {result.changeEventsCreated} שינויים חדשים.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
