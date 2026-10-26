import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/push/sendPush";

export async function POST() {
  const result = await sendPushToAll({
    title: "בדיקת התראות",
    body: "אם קיבלת את זה, ההתראות עובדות.",
  });
  return NextResponse.json(result);
}
