"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroSceneWrapper() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <HeroScene key={resolvedTheme} theme={resolvedTheme} />
    </div>
  );
}
