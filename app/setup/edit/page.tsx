import { Suspense } from "react";
import { SetupPicker } from "@/components/schedule/SetupPicker";

export default function SetupEditPage() {
  return (
    <main className="p-4 md:p-8" dir="rtl">
      <h1 className="mb-4 text-xl font-semibold">עריכת המערכת שלי</h1>
      <Suspense fallback={<p>טוען את המערכת...</p>}>
        <SetupPicker />
      </Suspense>
    </main>
  );
}
