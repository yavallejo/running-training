import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MagneticWrap from "./MagneticWrap";

describe("MagneticWrap", () => {
  it("renderiza los children dentro del wrapper magnético", () => {
    render(
      <MagneticWrap>
        <button>Empezá ahora</button>
      </MagneticWrap>
    );

    expect(screen.getByRole("button", { name: "Empezá ahora" })).toBeInTheDocument();
  });

  it("aplica la clase pasada por props", () => {
    const { container } = render(
      <MagneticWrap className="inline-block relative">
        <span>contenido</span>
      </MagneticWrap>
    );

    const wrapper = container.querySelector("[data-magnetic]");
    expect(wrapper).toHaveClass("inline-block");
  });
});
