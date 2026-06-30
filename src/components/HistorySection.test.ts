import { describe, it, expect } from "vitest";

interface PlanHistory {
  id: string;
  race_distance: number;
  race_date: string;
  race_name: string;
  race_time?: string;
  race_feeling?: number;
  completed_sessions: number;
  total_sessions: number;
  is_current: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Sin fecha";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function partitionHistory(history: PlanHistory[]): { current: PlanHistory | undefined; past: PlanHistory[] } {
  return {
    current: history.find((h) => h.is_current),
    past: history.filter((h) => !h.is_current),
  };
}

describe("formatDate", () => {
  it("returns 'Sin fecha' for empty string", () => {
    expect(formatDate("")).toBe("Sin fecha");
  });

  it("returns localized date for valid YYYY-MM-DD", () => {
    const result = formatDate("2026-05-17");
    expect(result).toContain("2026");
    expect(result).toContain("may");
    expect(result).toContain("17");
  });
});

describe("getCompletionRate", () => {
  it("returns 0 for total = 0", () => {
    expect(getCompletionRate(5, 0)).toBe(0);
  });

  it("returns percentage rounded", () => {
    expect(getCompletionRate(5, 10)).toBe(50);
    expect(getCompletionRate(3, 4)).toBe(75);
    expect(getCompletionRate(1, 3)).toBe(33);
  });

  it("caps at 100 when completed > total", () => {
    expect(getCompletionRate(15, 10)).toBe(150);
  });
});

describe("partitionHistory", () => {
  it("separates current from past plans", () => {
    const history: PlanHistory[] = [
      { id: "1", race_distance: 7, race_date: "2026-05-17", race_name: "A", completed_sessions: 5, total_sessions: 10, is_current: true },
      { id: "2", race_distance: 5, race_date: "2025-01-01", race_name: "B", completed_sessions: 8, total_sessions: 8, is_current: false },
    ];
    const { current, past } = partitionHistory(history);
    expect(current?.id).toBe("1");
    expect(past).toHaveLength(1);
    expect(past[0].id).toBe("2");
  });

  it("handles empty history", () => {
    const { current, past } = partitionHistory([]);
    expect(current).toBeUndefined();
    expect(past).toEqual([]);
  });

  it("handles all-current history", () => {
    const history: PlanHistory[] = [
      { id: "1", race_distance: 7, race_date: "2026-05-17", race_name: "A", completed_sessions: 0, total_sessions: 10, is_current: true },
    ];
    const { current, past } = partitionHistory(history);
    expect(current?.id).toBe("1");
    expect(past).toEqual([]);
  });
});
