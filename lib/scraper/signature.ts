import { createHash } from "node:crypto";

export function makeSignature(
  subject: string,
  room: string | null,
  teacher: string | null
): string {
  const normalized = [subject, room ?? "", teacher ?? ""]
    .map((s) => s.trim().toLowerCase())
    .join("|");
  return createHash("sha1").update(normalized).digest("hex").slice(0, 16);
}
