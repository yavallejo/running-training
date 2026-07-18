/**
 * Splits an element's text content into per-word masked spans for
 * staggered word-by-word reveals. Idempotent: if the element was
 * already split, returns the existing inner spans.
 *
 * Preserves nested markup (e.g. colored <span> words) and whitespace,
 * so screen readers still read the full sentence.
 */
export function splitWords(element: HTMLElement): HTMLElement[] {
  const existing = element.querySelectorAll<HTMLElement>("[data-word-inner]");
  if (existing.length) return Array.from(existing);

  const inners: HTMLElement[] = [];

  const wrapTextNode = (node: Node) => {
    const text = node.textContent ?? "";
    const parts = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const outer = document.createElement("span");
        outer.className = "inline-block overflow-hidden align-bottom";
        const inner = document.createElement("span");
        inner.className = "inline-block will-change-transform";
        inner.setAttribute("data-word-inner", "");
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
        inners.push(inner);
      }
    }
    node.parentNode?.replaceChild(frag, node);
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      wrapTextNode(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  Array.from(element.childNodes).forEach(walk);
  return inners;
}
