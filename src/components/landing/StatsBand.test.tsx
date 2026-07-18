import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatsBand, { LANDING_STATS } from "./StatsBand";

describe("StatsBand", () => {
  it("renderiza las 4 estadísticas con valor, label y detalle", () => {
    const { container } = render(<StatsBand />);

    const counters = container.querySelectorAll("[data-count]");
    expect(counters).toHaveLength(4);
    expect(Array.from(counters).map((c) => c.getAttribute("data-count"))).toEqual(
      LANDING_STATS.map((s) => String(s.value))
    );

    for (const stat of LANDING_STATS) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.detail)).toBeInTheDocument();
    }
  });

  it("incluye el claim de marca '0 EXCUSAS'", () => {
    render(<StatsBand />);
    expect(screen.getByText("EXCUSAS")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
