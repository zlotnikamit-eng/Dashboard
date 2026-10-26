import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EnableNotificationsButton } from "@/components/push/EnableNotificationsButton";
import { SyncNowButton } from "@/components/settings/SyncNowButton";

function formatSyncTime(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

async function SyncStatus() {
  const config = await prisma.appConfig.findUnique({ where: { id: 1 } });

  if (!config?.lastSyncAt) {
    return <p className="text-sm text-neutral-500">עדיין לא בוצע סנכרון</p>;
  }

  const isError = config.lastSyncStatus?.startsWith("error");
  return (
    <p className={`text-sm ${isError ? "text-red-600" : "text-neutral-500"}`}>
      סנכרון אחרון: {formatSyncTime(config.lastSyncAt)}
      {isError ? ` — ${config.lastSyncStatus}` : ""}
    </p>
  );
}

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-4 md:p-8" dir="rtl">
      <h1 className="text-xl font-semibold">הגדרות</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">התראות</h2>
        <EnableNotificationsButton />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">סנכרון</h2>
        <Suspense fallback={<p>טוען...</p>}>
          <SyncStatus />
        </Suspense>
        <SyncNowButton />
      </section>

      <Link href="/setup/edit" className="block text-sm text-blue-600">
        עדכון מערכת השעות האישית ←
      </Link>
    </main>
  );
}
