"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: "max",
            scrub: 0.3,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none"
      aria-hidden="true"
      data-testid="scroll-progress"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-primary via-primary to-primary/60 shadow-[0_0_8px_rgba(255,59,48,0.5)]"
      />
    </div>
  );
}
