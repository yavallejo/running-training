"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export const MARQUEE_ITEMS = [
  "3K",
  "5K",
  "7K",
  "10K",
  "15K",
  "21K",
  "42K",
  "TU CARRERA TE ESPERA",
];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 28,
        repeat: -1,
      });
    }, trackRef);
    return () => mm.revert();
  }, []);

  return (
    <div
      className="relative border-y border-border/50 bg-surface/40 py-5 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center whitespace-nowrap will-change-transform"
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="flex items-center text-sm font-mono tracking-[0.3em] uppercase text-muted-foreground"
          >
            <span className="px-8">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
