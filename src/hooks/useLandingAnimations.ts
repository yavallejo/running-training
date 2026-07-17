"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Landing-wide scroll animations:
 * - [data-reveal] sections: header ([data-reveal-head]) + items ([data-reveal-item])
 *   fade/slide in with stagger when the section enters the viewport.
 * - [data-steps-line]: the "finish line" connecting the 3 steps draws itself
 *   (scaleX) tied to scroll progress (scrub).
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
        const heads = section.querySelectorAll("[data-reveal-head]");
        const items = section.querySelectorAll("[data-reveal-item]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
        if (heads.length) {
          tl.fromTo(
            heads,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 }
          );
        }
        if (items.length) {
          tl.fromTo(
            items,
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, duration: 0.8 },
            "-=0.5"
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

    return () => mm.revert();
  }, [ref]);
}
