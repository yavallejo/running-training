import { describe, expect, it } from "vitest";
import { splitWords } from "./split-words";

describe("splitWords", () => {
  it("divide el texto en palabras con máscara preservando el contenido", () => {
    const el = document.createElement("h2");
    el.textContent = "No corras solo";

    const words = splitWords(el);

    expect(words).toHaveLength(3);
    expect(words.map((w) => w.textContent)).toEqual(["No", "corras", "solo"]);
    // el texto completo sigue siendo legible (screen readers)
    expect(el.textContent).toBe("No corras solo");
    // cada palabra queda envuelta en una máscara overflow-hidden
    const outer = words[0].parentElement;
    expect(outer?.className).toContain("overflow-hidden");
  });

  it("preserva spans anidados con sus clases", () => {
    const el = document.createElement("h2");
    el.innerHTML = `Ellos ya cruzaron <span class="text-primary">la meta</span>`;

    const words = splitWords(el);

    expect(words).toHaveLength(5);
    const colored = el.querySelector(".text-primary");
    expect(colored).not.toBeNull();
    expect(colored?.textContent).toBe("la meta");
    // las palabras dentro del span anidado también se dividen
    expect(colored?.querySelectorAll("[data-word-inner]")).toHaveLength(2);
  });

  it("es idempotente: no vuelve a dividir un elemento ya dividido", () => {
    const el = document.createElement("h2");
    el.textContent = "Cada día que pasa";

    const first = splitWords(el);
    const second = splitWords(el);

    expect(second).toHaveLength(first.length);
    expect(second[0]).toBe(first[0]);
  });
});
