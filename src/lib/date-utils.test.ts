import { describe, it, expect } from "vitest";
import {
  parseLocalDate,
  getLocalDateString,
  formatDayLabel,
  checkBlockedSessions,
  getRaceDeadline,
  getDaysAgo,
} from "@/lib/date-utils";
import type { TrainingSession } from "@/lib/training-plan";

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD as local date (not UTC)", () => {
    const d = parseLocalDate("2026-05-17");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(17);
  });

  it("does not shift to previous day in negative-UTC timezones", () => {
    const d = parseLocalDate("2026-01-01");
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe(0);
  });
});

describe("getLocalDateString", () => {
  it("formats a Date as YYYY-MM-DD", () => {
    const d = new Date(2026, 4, 17);
    expect(getLocalDateString(d)).toBe("2026-05-17");
  });

  it("pads single-digit month and day", () => {
    const d = new Date(2026, 0, 5);
    expect(getLocalDateString(d)).toBe("2026-01-05");
  });
});

describe("getRaceDeadline", () => {
  it("returns race date + 10 days by default", () => {
    const deadline = getRaceDeadline("2026-05-17");
    expect(getRaceDeadline("2026-05-17").getDate()).toBe(27);
    expect(deadline.getMonth()).toBe(4);
  });

  it("respects custom daysAfter parameter", () => {
    const deadline = getRaceDeadline("2026-05-17", 30);
    expect(deadline.getDate()).toBe(16);
    expect(deadline.getMonth()).toBe(5);
  });

  it("rolls over month correctly", () => {
    const deadline = getRaceDeadline("2026-05-25", 10);
    expect(deadline.getDate()).toBe(4);
    expect(deadline.getMonth()).toBe(5);
  });
});

describe("getDaysAgo", () => {
  it("returns 0 for today", () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(getDaysAgo(todayStr)).toBe(0);
  });

  it("returns positive number for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
    expect(getDaysAgo(pastStr)).toBe(5);
  });

  it("clamps to 0 for future dates (does not return negative)", () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
    expect(getDaysAgo(futureStr)).toBe(0);
  });
});

describe("checkBlockedSessions", () => {
  const baseSession = (overrides: Partial<TrainingSession> = {}): TrainingSession => ({
    id: "s1",
    sessionOrder: 1,
    date: "2026-05-17",
    dayLabel: "Mon",
    workout: "Easy run",
    workoutType: "easy",
    details: "",
    distance: 5,
    targetPace: "5:30",
    completed: false,
    rescheduled: false,
    rescheduleUsed: false,
    blocked: false,
    ...overrides,
  });

  it("marks rescheduled sessions in the past as blocked if not completed", () => {
    const result = checkBlockedSessions(
      [baseSession({ id: "s1", rescheduled: true, date: "2026-05-17" })],
      "2026-05-20"
    );
    expect(result[0].blocked).toBe(true);
  });

  it("does not block completed sessions even if rescheduled and past", () => {
    const result = checkBlockedSessions(
      [baseSession({ id: "s1", rescheduled: true, date: "2026-05-17", completed: true })],
      "2026-05-20"
    );
    expect(result[0].blocked).toBe(false);
  });

  it("does not block future rescheduled sessions", () => {
    const result = checkBlockedSessions(
      [baseSession({ id: "s1", rescheduled: true, date: "2026-05-25" })],
      "2026-05-20"
    );
    expect(result[0].blocked).toBe(false);
  });

  it("does not block non-rescheduled past sessions", () => {
    const result = checkBlockedSessions(
      [baseSession({ id: "s1", rescheduled: false, date: "2026-05-17" })],
      "2026-05-20"
    );
    expect(result[0].blocked).toBe(false);
  });
});

describe("formatDayLabel", () => {
  it("returns abbreviated day-month string with day number", () => {
    const result = formatDayLabel("2026-05-17");
    expect(result).toMatch(/^\S+ \d+ \S+$/);
    expect(result).toContain("17");
  });
});
