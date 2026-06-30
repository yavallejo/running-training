import { describe, it, expect } from "vitest";
import { BADGES, evaluateBadges } from "@/lib/achievements";
import type { TrainingSession } from "@/lib/training-plan";

const makeSession = (overrides: Partial<TrainingSession> = {}): TrainingSession => ({
  id: `session-${Math.random()}`,
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

const allCompleted = (count: number, distance = 5, dates: string[] = []): TrainingSession[] =>
  Array.from({ length: count }, (_, i) =>
    makeSession({
      id: `s${i + 1}`,
      sessionOrder: i + 1,
      date: dates[i] || `2026-05-${String(i + 1).padStart(2, "0")}`,
      distance,
      actualDistance: distance,
      completed: true,
    })
  );

describe("evaluateBadges - first-run", () => {
  it("does not unlock with no completed sessions", () => {
    const result = evaluateBadges([makeSession()], new Set());
    const badge = result.find((b) => b.id === "first-run");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });

  it("unlocks with 1 completed session", () => {
    const sessions = allCompleted(1);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "first-run");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });
});

describe("evaluateBadges - streak-3", () => {
  it("unlocks with 3 consecutive completed sessions", () => {
    const sessions = allCompleted(3, 5, ["2026-05-01", "2026-05-02", "2026-05-03"]);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "streak-3");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });

  it("does not unlock with 2 completed in a row", () => {
    const sessions = allCompleted(2, 5, ["2026-05-01", "2026-05-02"]);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "streak-3");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });

  it("resets streak on a missed day", () => {
    const sessions: TrainingSession[] = [
      ...allCompleted(2, 5, ["2026-05-01", "2026-05-02"]),
      makeSession({ id: "s3", date: "2026-05-03", completed: false }),
      ...allCompleted(2, 5, ["2026-05-04", "2026-05-05"]),
    ];
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "streak-3");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });
});

describe("evaluateBadges - 5k-complete", () => {
  it("unlocks when accumulated actual distance >= 5km", () => {
    const sessions = allCompleted(1, 5);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "5k-complete");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });

  it("does not unlock below 5km", () => {
    const sessions = allCompleted(2, 2);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "5k-complete");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });
});

describe("evaluateBadges - halfway", () => {
  it("unlocks at 50% of plan", () => {
    const sessions = allCompleted(5);
    const plan = [...sessions, ...Array.from({ length: 5 }, (_, i) =>
      makeSession({ id: `p${i}`, sessionOrder: 6 + i, date: `2026-05-${10 + i}`, completed: false })
    )];
    const result = evaluateBadges(plan, new Set());
    const badge = result.find((b) => b.id === "halfway");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });

  it("does not unlock below 50%", () => {
    const sessions = allCompleted(4);
    const plan = [...sessions, ...Array.from({ length: 6 }, (_, i) =>
      makeSession({ id: `p${i}`, sessionOrder: 5 + i, date: `2026-05-${10 + i}`, completed: false })
    )];
    const result = evaluateBadges(plan, new Set());
    const badge = result.find((b) => b.id === "halfway");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });
});

describe("evaluateBadges - finish", () => {
  it("unlocks at 100% of plan", () => {
    const sessions = allCompleted(3);
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "finish");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });

  it("does not unlock with empty plan", () => {
    const result = evaluateBadges([], new Set());
    const badge = result.find((b) => b.id === "finish");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBeFalsy();
  });
});

describe("evaluateBadges - rescheduler", () => {
  it("unlocks when any session is rescheduled", () => {
    const sessions = [makeSession({ rescheduled: true })];
    const result = evaluateBadges(sessions, new Set());
    const badge = result.find((b) => b.id === "rescheduler");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });
});

describe("evaluateBadges - unlocked Set is respected", () => {
  it("treats already-unlocked badges as unlocked even if condition is false", () => {
    const unlocked = new Set(["first-run"]);
    const result = evaluateBadges([makeSession()], unlocked);
    const badge = result.find((b) => b.id === "first-run");
    expect((badge as { unlocked?: boolean } | undefined)?.unlocked).toBe(true);
  });
});

describe("BADGES - structure", () => {
  it("every badge has id, name, icon, description, condition", () => {
    for (const badge of BADGES) {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(typeof badge.condition).toBe("function");
    }
  });

  it("badge ids are unique", () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
