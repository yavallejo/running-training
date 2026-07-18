"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export const LANDING_STATS = [
  { value: 7, label: "DISTANCIAS", detail: "3K a 42K" },
  { value: 18, label: "SEMANAS MÁX.", detail: "plan maratón" },
  { value: 9, label: "HERRAMIENTAS", detail: "todo incluido" },
  { value: 0, label: "EXCUSAS", detail: "solo seguí el plan" },
] as const;

export default function StatsBand() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const counters = rootRef.current?.querySelectorAll("[data-count]") ?? [];
      counters.forEach((el) => {
        const target = Number(el.getAttribute("data-count"));
        if (!target) return; // "0 EXCUSAS" stays 0
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = String(Math.round(state.v));
          },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      data-reveal
      aria-label="El plan en números"
      className="relative py-16 sm:py-20 px-4 overflow-hidden border-y border-border/50 bg-surface/30"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {LANDING_STATS.map((stat) => (
            <div key={stat.label} data-reveal-item className="text-center group">
              <div
                className="text-5xl sm:text-6xl font-black tracking-tight text-primary group-hover:scale-105 transition-transform duration-500"
                style={{ fontFamily: "var(--font-urbanist)" }}
                data-count={stat.value}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-xs font-mono tracking-[0.25em] uppercase text-foreground">
                {stat.label}
              </div>
              <div className="mt-1 text-[11px] font-mono tracking-wide text-muted-foreground">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
