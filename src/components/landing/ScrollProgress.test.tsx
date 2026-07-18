import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScrollProgress from "./ScrollProgress";

describe("ScrollProgress", () => {
  it("renderiza la barra fija decorativa oculta para lectores de pantalla", () => {
    render(<ScrollProgress />);

    const bar = screen.getByTestId("scroll-progress");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar).toHaveClass("fixed", "top-0");
  });
});
