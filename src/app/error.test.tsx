import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "@/app/global-error";
import AppError from "@/app/error";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("GlobalError fallback", () => {
  const originalLocation = window.location;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // GlobalError renders <html>/<body> per Next.js global-error contract;
    // jsdom hosts components inside a <div>, so React logs a DOM-nesting
    // warning that is a test-environment artifact. Filter only that warning
    // and let any other console.error through.
    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((...args: unknown[]) => {
        const message = String(args[0] ?? "");
        if (message.includes("<html> cannot be a child of")) return;
        process.stderr.write(args.map(String).join(" ") + "\n");
      });

    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
