import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPersonalSlots } from "@/lib/schedule/queries";

const selectionSchema = z.object({
  dayIndex: z.number().int().min(0),
  periodNumber: z.number().int().min(1),
  subject: z.string().min(1),
  room: z.string().nullable(),
  teacher: z.string().nullable(),
  signature: z.string().min(1),
});

const bodySchema = z.object({
  selections: z.array(selectionSchema),
});

export async function GET() {
  const slots = await getPersonalSlots();
  return NextResponse.json({ slots });
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { selections } = parsed.data;

  await prisma.$transaction([
    prisma.personalSlot.deleteMany({}),
    prisma.personalSlot.createMany({
      data: selections.map((s) => ({ ...s, active: true })),
    }),
  ]);

  const slots = await getPersonalSlots();
  return NextResponse.json({ slots });
}
