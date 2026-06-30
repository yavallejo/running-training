import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrainingSession } from "@/lib/training-plan";
import PlanStats, { StatCard } from "@/components/PlanStats";

const makeSession = (overrides: Partial<TrainingSession> = {}): TrainingSession => ({
  id: `s-${Math.random()}`,
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

const completedSessions = (n: number, distance = 5): TrainingSession[] =>
  Array.from({ length: n }, (_, i) =>
    makeSession({
      id: `c${i}`,
      sessionOrder: i + 1,
      date: `2026-05-${String(i + 1).padStart(2, "0")}`,
      distance,
      actualDistance: distance,
      completed: true,
    })
  );

describe("PlanStats - completion rate clamping (Fix #4)", () => {
  it("clamps to 100 when prop exceeds total", () => {
    const sessions = completedSessions(5, 5);
    render(<PlanStats sessions={sessions} completedCount={999} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps to 0 when prop is negative", () => {
    const sessions = completedSessions(5, 5);
    render(<PlanStats sessions={sessions} completedCount={-10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("rounds partial values normally", () => {
    const sessions: TrainingSession[] = [
      ...completedSessions(3, 5),
      makeSession({ id: "u1", sessionOrder: 4, completed: false, distance: 5 }),
      makeSession({ id: "u2", sessionOrder: 5, completed: false, distance: 5 }),
    ];
    render(<PlanStats sessions={sessions} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "60");
  });
});

describe("PlanStats - empty plan guard (Fix #7)", () => {
  it("returns early with empty state when totalSessions is 0", () => {
    render(<PlanStats sessions={[]} />);
    expect(screen.getByText(/Aún no hay sesiones en este plan/i)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("does not show 'Meta superada' on empty plan", () => {
    render(<PlanStats sessions={[]} />);
    expect(screen.queryByText(/Meta superada/i)).not.toBeInTheDocument();
  });
});

describe("PlanStats - isOverPlanned only when total > 0 (Fix #7)", () => {
  it("shows celebration when completed distance > planned", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
      makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    expect(screen.getAllByText(/Meta superada/i).length).toBeGreaterThan(0);
  });

  it("does NOT show celebration when dist == planned (boundary)", () => {
    const sessions = completedSessions(2, 5);
    render(<PlanStats sessions={sessions} />);
    expect(screen.queryByText(/Meta superada/i)).not.toBeInTheDocument();
    expect(screen.getByText(/km restantes/i)).toBeInTheDocument();
  });

  it("shows remaining when not yet over planned", () => {
    const sessions: TrainingSession[] = [
      ...completedSessions(1, 5),
      makeSession({ id: "u1", sessionOrder: 2, completed: false, distance: 10 }),
    ];
    render(<PlanStats sessions={sessions} />);
    expect(screen.getByText(/km restantes/i)).toBeInTheDocument();
  });
});

describe("PlanStats - celebration visual state (Reviewer 2 #10)", () => {
  const overPlannedSessions = (): TrainingSession[] => [
    makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
    makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
  ];

  it("uses text-success + font-semibold + bg-success on celebration (non-color cue)", () => {
    render(<PlanStats sessions={overPlannedSessions()} />);
    const matches = screen.getAllByText(/Meta superada/i);
    const visible = matches.find((el) => !el.classList.contains("sr-only"))!;
    expect(visible).toHaveClass("text-success");
    expect(visible).toHaveClass("font-semibold");
    expect(visible).toHaveClass("bg-success/10");
    expect(visible).toHaveClass("border-success/30");
  });

  it("does not apply success styling to 'km restantes'", () => {
    const sessions = completedSessions(1, 5);
    render(<PlanStats sessions={sessions} />);
    const remaining = screen.getByText(/km restantes/i);
    expect(remaining).not.toHaveClass("text-success");
  });
});

describe("PlanStats - emoji aria-hidden (Reviewer 2 #5)", () => {
  it("celebration emoji is aria-hidden so SR doesn't read 'party popper'", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
      makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    const emoji = screen.getByText("🎉");
    expect(emoji).toHaveAttribute("aria-hidden", "true");
  });
});

describe("PlanStats - aria-live on sr-only (Reviewer 2 #6 throttling)", () => {
  const overPlannedSessions = (): TrainingSession[] => [
    makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
    makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
  ];

  it("aria-live is on a sr-only element, not the visible text", () => {
    render(<PlanStats sessions={overPlannedSessions()} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveClass("sr-only");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("announces celebration message in live region", () => {
    render(<PlanStats sessions={overPlannedSessions()} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/Meta superada/i);
  });

  it("rounds remaining distance to whole km in live region to avoid spam", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "c1", sessionOrder: 1, distance: 5, actualDistance: 2.4, completed: true }),
      makeSession({ id: "c2", sessionOrder: 2, distance: 5, completed: false }),
    ];
    render(<PlanStats sessions={sessions} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/8 kilómetros restantes/);
  });

  it("static 'planeados' visible text does not have aria-live", () => {
    const sessions = completedSessions(2, 5);
    render(<PlanStats sessions={sessions} />);
    const planeados = screen.getByText(/km planeados/i);
    expect(planeados).not.toHaveAttribute("aria-live");
  });
});

describe("PlanStats - actualDistance fallback (Fase 1 fix)", () => {
  it("uses actualDistance when present", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "1", distance: 5, actualDistance: 7, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    expect(screen.getByText("7.0")).toBeInTheDocument();
  });

  it("falls back to distance when actualDistance is undefined", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "1", distance: 5, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("treats actualDistance: 0 as 0 (not fallback)", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "1", distance: 5, actualDistance: 0, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});

describe("PlanStats - a11y: aria-valuetext includes celebration state (Fix #1)", () => {
  const overPlannedSessions = (): TrainingSession[] => [
    makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
    makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
  ];

  it("includes celebration suffix when over planned", () => {
    render(<PlanStats sessions={overPlannedSessions()} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuetext", expect.stringMatching(/meta superada/i));
  });

  it("does not include celebration suffix when not over planned", () => {
    const sessions: TrainingSession[] = [
      ...completedSessions(1, 5),
      makeSession({ id: "u", completed: false, distance: 20 }),
    ];
    render(<PlanStats sessions={sessions} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.getAttribute("aria-valuetext")).not.toMatch(/meta superada/i);
  });
});

describe("PlanStats - a11y: aria-live on celebration (Fix #2)", () => {
  it("sr-only live region announces when in celebration state", () => {
    const sessions: TrainingSession[] = [
      makeSession({ id: "c1", sessionOrder: 1, date: "2026-05-01", distance: 10, actualDistance: 12, completed: true }),
      makeSession({ id: "c2", sessionOrder: 2, date: "2026-05-02", distance: 10, actualDistance: 9, completed: true }),
    ];
    render(<PlanStats sessions={sessions} />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/Meta superada/i);
  });
});

describe("PlanStats - a11y: no double announcement (Fix #6)", () => {
  it("hides unit from screen readers but exposes full sentence", () => {
    const sessions: TrainingSession[] = [
      ...completedSessions(3, 5),
      makeSession({ id: "u1", sessionOrder: 4, completed: false, distance: 5 }),
      makeSession({ id: "u2", sessionOrder: 5, completed: false, distance: 5 }),
    ];
    render(<PlanStats sessions={sessions} />);
    const unit = screen.getByText((_, el) => el?.textContent?.trim() === "/ 5" && el?.getAttribute("aria-hidden") === "true");
    expect(unit).toBeInTheDocument();
    const srOnly = screen.getByText(/3 de 5 sesiones completadas/i);
    expect(srOnly).toHaveClass("sr-only");
  });
});

describe("PlanStats - completedCount prop optional", () => {
  it("derives count from sessions when prop is omitted", () => {
    const sessions = completedSessions(2, 5);
    render(<PlanStats sessions={sessions} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/ 2")).toBeInTheDocument();
  });

  it("respects prop when provided (even when 0)", () => {
    const sessions = completedSessions(3, 5);
    render(<PlanStats sessions={sessions} completedCount={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

describe("StatCard - exported and reusable (Fix #9)", () => {
  it("renders with minimal props", () => {
    render(
      <StatCard
        icon={<path d="M0 0" />}
        label="Test"
        value={42}
        ariaLabel="42 unidades"
        delay={0}
      />
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("uses sr-only for ariaLabel and hides unit", () => {
    render(
      <StatCard
        icon={<path d="M0 0" />}
        label="KMs"
        value={10}
        unit="km"
        ariaLabel="10 kilómetros"
        delay={0}
      />
    );
    expect(screen.getByText("km")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/10 kilómetros/i)).toHaveClass("sr-only");
  });
});
