import { prisma } from "@/lib/db";

export async function getAllTasks() {
  return prisma.task.findMany({
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
  });
}

// Undone tasks with a due date first (soonest first), then undone tasks with
// no due date (oldest-created first) filling any remaining slots.
export async function getNextUndoneTasks(limit = 3) {
  return prisma.task.findMany({
    where: { done: false },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    take: limit,
  });
}
