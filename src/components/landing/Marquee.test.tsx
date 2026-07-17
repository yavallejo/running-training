import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Marquee, { MARQUEE_ITEMS } from "./Marquee";

describe("Marquee", () => {
  it("incluye todas las distancias del plan", () => {
    for (const distance of ["3K", "5K", "7K", "10K", "15K", "21K", "42K"]) {
      expect(MARQUEE_ITEMS).toContain(distance);
    }
  });

  it("duplica el contenido para el loop infinito y es decorativo", () => {
    const { container } = render(<Marquee />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    // contenido duplicado: cada item aparece exactamente 2 veces
    expect(screen.getAllByText("42K")).toHaveLength(2);
    expect(screen.getAllByText("TU CARRERA TE ESPERA")).toHaveLength(2);
  });
});
