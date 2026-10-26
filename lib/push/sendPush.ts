import webpush from "web-push";
import { prisma } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export type PushPayload = { title: string; body: string; url?: string };

// Sends to every stored subscription; a 404/410 means the subscription is
// gone on the browser's end, so it's deleted instead of retried.
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany();
  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          removed++;
        }
      }
    })
  );

  return { sent, removed };
}
