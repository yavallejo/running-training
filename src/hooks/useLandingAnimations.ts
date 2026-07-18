"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

/**
 * Landing-wide scroll animations:
 * - [data-reveal] sections: plain heads ([data-reveal-head]) fade/slide in,
 *   [data-split] headings reveal word-by-word, and cards ([data-reveal-item])
 *   rise with stagger when the section enters the viewport.
 * - [data-steps-line]: the "finish line" connecting the 3 steps draws itself
 *   (scaleX) tied to scroll progress (scrub).
 * - [data-tilt]: subtle 3D tilt toward the cursor on fine pointers.
 *
 * Everything is wrapped in gsap.matchMedia so users with
 * prefers-reduced-motion get fully visible static content.
 */
export function useLandingAnimations(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      sections.forEach((section) => {
        const plainHeads = section.querySelectorAll(
          "[data-reveal-head]:not([data-split])"
        );
        const splitEl = section.querySelector<HTMLElement>("[data-split]");
        const items = section.querySelectorAll("[data-reveal-item]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        if (plainHeads.length) {
          tl.fromTo(
            plainHeads,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.14, duration: 0.9 }
          );
        }
        if (splitEl) {
          const words = splitWords(splitEl);
          tl.fromTo(
            words,
            { yPercent: 115 },
            { yPercent: 0, stagger: 0.045, duration: 0.75 },
            0.25
          );
        }
        if (items.length) {
          tl.fromTo(
            items,
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, duration: 0.8 },
            "-=0.4"
          );
        }
      });
    });

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const line = root.querySelector("[data-steps-line]");
        const grid = root.querySelector("[data-steps-grid]");
        if (!line || !grid) return;
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: grid,
              start: "top 78%",
              end: "bottom 58%",
              scrub: 1,
            },
          }
        );
      }
    );

    mm.add(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-tilt]", root);
        const cleanups = cards.map((card) => {
          gsap.set(card, { transformPerspective: 700 });
          const rxTo = gsap.quickTo(card, "rotationX", {
            duration: 0.5,
            ease: "power3.out",
          });
          const ryTo = gsap.quickTo(card, "rotationY", {
            duration: 0.5,
            ease: "power3.out",
          });
          const onMove = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ryTo(px * 6);
            rxTo(-py * 6);
          };
          const onLeave = () => {
            rxTo(0);
            ryTo(0);
          };
          card.addEventListener("pointermove", onMove);
          card.addEventListener("pointerleave", onLeave);
          return () => {
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
          };
        });
        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, [ref]);
}
