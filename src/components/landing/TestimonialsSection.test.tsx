import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TestimonialsSection, { TESTIMONIALS } from "./TestimonialsSection";

describe("TESTIMONIALS data", () => {
  it("tiene 6 testimonios con todos los campos completos", () => {
    expect(TESTIMONIALS).toHaveLength(6);
    for (const t of TESTIMONIALS) {
      expect(t.name.trim()).not.toBe("");
      expect(t.initials.trim()).not.toBe("");
      expect(t.location.trim()).not.toBe("");
      expect(t.distance).toMatch(/^\d+K$/);
      expect(t.result.trim()).not.toBe("");
      expect(t.quote.length).toBeGreaterThan(40);
    }
  });

  it("no repite nombres", () => {
    const names = TESTIMONIALS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("TestimonialsSection", () => {
  it("renderiza la sección con su anchor y encabezado", () => {
    const { container } = render(<TestimonialsSection />);

    expect(container.querySelector("#testimonios")).toBeInTheDocument();
    expect(screen.getByText("Testimonios")).toBeInTheDocument();
    expect(screen.getByText("la meta")).toBeInTheDocument();
  });

  it("renderiza los 6 testimonios con nombre, distancia y resultado", () => {
    render(<TestimonialsSection />);

    for (const t of TESTIMONIALS) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
      expect(
        screen.getByText(`${t.distance} · ${t.result}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(t.location))
      ).toBeInTheDocument();
    }
  });

  it("muestra las citas de los corredores", () => {
    render(<TestimonialsSection />);

    const first = TESTIMONIALS[0];
    expect(screen.getByText(new RegExp(first.quote.slice(0, 30)))).toBeInTheDocument();
  });
});
