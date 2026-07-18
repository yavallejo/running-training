import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectionsContent from "./SectionsContent";

describe("SectionsContent", () => {
  it("renderiza las secciones principales con sus anchors", () => {
    const { container } = render(<SectionsContent />);

    for (const id of ["problema", "solucion", "pasos", "testimonios", "comunidad", "cta"]) {
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
    }
  });

  it("muestra los encabezados clave del landing", () => {
    render(<SectionsContent />);

    expect(screen.getByText(/El problema no es/i)).toBeInTheDocument();
    expect(screen.getByText(/no tenés plan/i)).toBeInTheDocument();
    expect(screen.getByText(/De 4 a 18 semanas/i)).toBeInTheDocument();
    expect(screen.getByText(/en tu bolsillo/i)).toBeInTheDocument();
    expect(screen.getByText(/No corras/i)).toBeInTheDocument();
  });

  it("renderiza los 3 pasos y las 9 funcionalidades", () => {
    render(<SectionsContent />);

    expect(screen.getByText("Entrás")).toBeInTheDocument();
    expect(screen.getByText("Seguí")).toBeInTheDocument();
    expect(screen.getByText("Llegás")).toBeInTheDocument();

    const featureTitles = [
      "Plan Diario",
      "Cuenta Regresiva",
      "Seguimiento de Progreso",
      "Logros y Badges",
      "Recursos y Guías",
      "Desde Cualquier Dispositivo",
      "Tu Tiempo Final",
      "Múltiples Carreras",
      "Compartí Tu Progreso",
    ];
    for (const title of featureTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("el CTA final dispara el evento open-login-modal", () => {
    const handler = vi.fn();
    window.addEventListener("open-login-modal", handler);

    render(<SectionsContent />);
    fireEvent.click(screen.getByRole("button", { name: /empezá ahora/i }));

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("open-login-modal", handler);
  });

  it("el mid-CTA de solución dispara el evento open-login-modal", () => {
    const handler = vi.fn();
    window.addEventListener("open-login-modal", handler);

    render(<SectionsContent />);
    fireEvent.click(screen.getByRole("button", { name: /empezá tu plan hoy/i }));

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("open-login-modal", handler);
  });

  it("muestra el mini leaderboard de la comunidad", () => {
    render(<SectionsContent />);

    expect(screen.getByText(/ranking · 10k/i)).toBeInTheDocument();
    expect(screen.getByText("Valentina P.")).toBeInTheDocument();
    expect(screen.getByText("Martín G.")).toBeInTheDocument();
    expect(screen.getByText(/tu nombre podría estar acá/i)).toBeInTheDocument();
    // posición única del leaderboard ("05" solo existe en el ranking)
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getAllByText("01").length).toBeGreaterThan(0);
  });
});
