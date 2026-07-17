import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HeroContent from "./HeroContent";

describe("HeroContent", () => {
  it("renderiza el título principal y el subtítulo", () => {
    render(<HeroContent />);

    expect(screen.getByText("QUERÉS CORRER.")).toBeInTheDocument();
    expect(
      screen.getByText("PERO NO SABÉS CÓMO ARRANCAR.")
    ).toBeInTheDocument();
  });

  it("muestra las tres categorías de distancia", () => {
    render(<HeroContent />);

    expect(screen.getByText("3K–7K")).toBeInTheDocument();
    expect(screen.getByText("10K–15K")).toBeInTheDocument();
    expect(screen.getByText("21K–42K")).toBeInTheDocument();
  });

  it("el CTA dispara el evento open-login-modal", () => {
    const handler = vi.fn();
    window.addEventListener("open-login-modal", handler);

    render(<HeroContent />);
    fireEvent.click(screen.getByRole("button", { name: /arrancá tu plan/i }));

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("open-login-modal", handler);
  });
});
