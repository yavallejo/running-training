"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface MagneticWrapProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic hover effect: the wrapped element is gently pulled toward
 * the cursor and springs back on leave. Fine pointers + motion allowed only.
 */
export default function MagneticWrap({
  children,
  strength = 0.35,
  className,
}: MagneticWrapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, [strength]);

  return (
    <div ref={ref} className={className} data-magnetic>
      {children}
    </div>
  );
}
