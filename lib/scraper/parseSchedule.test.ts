import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSchedule } from "./parseSchedule";

const fixturePath = path.join(__dirname, "..", "..", "fixtures", "changestable.html");
const html = readFileSync(fixturePath, "utf-8");

test("parses every TTLesson and TTChange div in the fixture", () => {
  const { lessons, changes } = parseSchedule(html);

  const expectedLessons = (html.match(/class="TTLesson"/g) ?? []).length;
  const expectedChanges = (html.match(/class="TTChange/g) ?? []).length;

  assert.equal(lessons.length, expectedLessons);
  assert.equal(changes.length, expectedChanges);
});

test("extracts subject, room, and teacher from a lesson with a room", () => {
  const { lessons } = parseSchedule(html);
  const lesson = lessons.find((l) => l.dayIndex === 0 && l.periodNumber === 1);

  assert.ok(lesson);
  assert.equal(lesson.subject, "אזרחות");
  assert.equal(lesson.room, "213");
  assert.equal(lesson.teacher, "טנדלר אלכס");
});

test("handles a lesson div with no room (subject directly followed by <br>)", () => {
  const { lessons } = parseSchedule(html);
  const lesson = lessons.find((l) => l.room === null);

  assert.ok(lesson, "expected at least one roomless lesson in the fixture");
  assert.ok(lesson.teacher);
});

test("classifies TableFreeChange as cancellation, TableFillChange as substitute, TableEventChange as event", () => {
  const { changes } = parseSchedule(html);

  assert.ok(changes.some((c) => c.changeType === "cancellation"));
  assert.ok(changes.some((c) => c.changeType === "substitute"));
  assert.ok(changes.some((c) => c.changeType === "event"));
});

test("two lessons with identical subject/room/teacher produce the same signature", () => {
  const { lessons } = parseSchedule(html);
  const bySignature = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    bySignature.set(lesson.signature, [...(bySignature.get(lesson.signature) ?? []), lesson]);
  }
  const duplicate = [...bySignature.values()].find((group) => group.length > 1);
  assert.ok(duplicate, "expected at least one repeated subject/room/teacher across the week");
  const [first, ...rest] = duplicate;
  for (const lesson of rest) {
    assert.equal(lesson.subject, first.subject);
    assert.equal(lesson.room, first.room);
    assert.equal(lesson.teacher, first.teacher);
  }
});
