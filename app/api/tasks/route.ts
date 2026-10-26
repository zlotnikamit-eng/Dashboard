import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createTaskSchema = z.object({
  title: z.string().min(1),
  notes: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  dayIndex: z.number().int().nullable().optional(),
  periodNumber: z.number().int().nullable().optional(),
  personalSlotId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dueDate, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : null },
  });
  return NextResponse.json({ task }, { status: 201 });
}
