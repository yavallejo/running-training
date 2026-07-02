import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DiscoverCallout from "@/components/DiscoverCallout";

describe("DiscoverCallout", () => {
  const defaultProps = {
    title: "Activá tu perfil público",
    description: "Aparecé en los rankings de corredores.",
    ctaLabel: "Activar ahora",
    ctaHref: "/profile",
    storageKey: "test_dismissed",
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the title, description and CTA when not dismissed", () => {
    render(<DiscoverCallout {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Activar ahora/ })).toHaveAttribute("href", "/profile");
  });

  it("hides when sessionStorage has the dismiss key", () => {
    sessionStorage.setItem("discover-callout:test_dismissed", "1");
    render(<DiscoverCallout {...defaultProps} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
  });

  it("dismisses and persists on close click", async () => {
    render(<DiscoverCallout {...defaultProps} />);
    const closeBtn = screen.getByRole("button", { name: /Cerrar sugerencia/i });
    fireEvent.click(closeBtn);
    expect(sessionStorage.getItem("discover-callout:test_dismissed")).toBe("1");
    await waitFor(() => {
      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
    });
  });

  it("dismiss button has type=button to avoid form submission", () => {
    render(<DiscoverCallout {...defaultProps} />);
    const closeBtn = screen.getByRole("button", { name: /Cerrar sugerencia/i });
    expect(closeBtn).toHaveAttribute("type", "button");
  });

  it("CTA link has focus ring padding", () => {
    render(<DiscoverCallout {...defaultProps} />);
    const link = screen.getByRole("link", { name: /Activar ahora/ });
    expect(link.className).toMatch(/px-1/);
  });

  it("icon is aria-hidden", () => {
    render(<DiscoverCallout {...defaultProps} icon="🎉" />);
    const icon = screen.getByText("🎉");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("uses role=region with aria-label for screen readers", () => {
    render(<DiscoverCallout {...defaultProps} />);
    const region = screen.getByRole("region", { name: defaultProps.title });
    expect(region).toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    render(<DiscoverCallout {...defaultProps} icon="🏆" />);
    expect(screen.getByText("🏆")).toBeInTheDocument();
  });
});
