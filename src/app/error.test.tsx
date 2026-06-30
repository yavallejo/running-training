import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "@/app/global-error";
import AppError from "@/app/error";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("GlobalError fallback", () => {
  const originalLocation = window.location;
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });
  });
  afterEach(() => {
    Object.defineProperty(window, "location", { value: originalLocation, writable: true });
  });

  it("renders the catastrophic error UI", () => {
    const error = new Error("Kaboom") as Error & { digest?: string };
    error.digest = "abc123";
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByText(/Algo salió muy mal/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: abc123/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al inicio/i })).toBeInTheDocument();
  });

  it("calls reset when reintentar is clicked", () => {
    const error = new Error("Kaboom") as Error & { digest?: string };
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});

describe("AppError fallback (route-level)", () => {
  it("renders the route-level error UI", () => {
    const error = new Error("Route failed") as Error & { digest?: string };
    const reset = vi.fn();
    render(<AppError error={error} reset={reset} />);

    expect(screen.getByText(/No pudimos cargar esta vista/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
  });

  it("renders without digest when missing", () => {
    const error = new Error("No digest");
    const reset = vi.fn();
    render(<AppError error={error} reset={reset} />);

    expect(screen.queryByText(/ID:/i)).not.toBeInTheDocument();
  });
});
