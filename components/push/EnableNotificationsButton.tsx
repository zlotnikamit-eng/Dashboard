"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64Safe);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function EnableNotificationsButton() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }
  }, []);

  async function handleEnable() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("חסר מפתח VAPID");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("ההרשמה להתראות נכשלה");
      setSubscribed(true);
      setMessage("התראות הופעלו בהצלחה");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusy(false);
    }
  }

  async function handleTest() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      setMessage(`נשלחה התראת בדיקה ל-${data.sent ?? 0} מכשירים`);
    } catch {
      setMessage("שליחת התראת הבדיקה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-sm text-neutral-500">
        הדפדפן הזה לא תומך בהתראות. באייפון יש להוסיף את האתר למסך הבית (Add to Home Screen) ולפתוח
        אותו מהאפליקציה שנוספה כדי שההתראות יעבדו.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleEnable}
          disabled={busy || subscribed}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          {subscribed ? "התראות מופעלות" : "הפעלת התראות"}
        </button>
        {subscribed && (
          <button
            onClick={handleTest}
            disabled={busy}
            className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            שלח התראת בדיקה
          </button>
        )}
      </div>
      {permission === "denied" && (
        <p className="text-sm text-red-600">ההרשאה נדחתה — יש לאפשר התראות בהגדרות הדפדפן.</p>
      )}
      {message && <p className="text-sm text-neutral-500">{message}</p>}
    </div>
  );
}
