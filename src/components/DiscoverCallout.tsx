"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";

interface DiscoverCalloutProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  storageKey: string;
  icon?: string;
}

const STORAGE_PREFIX = "discover-callout:";
const DISMISSED_VALUE = "1";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // sessionStorage may be disabled (Safari private, sandboxed iframes)
  }
}

export default function DiscoverCallout({
  title,
  description,
  ctaLabel,
  ctaHref,
  storageKey,
  icon = "💡",
}: DiscoverCalloutProps) {
  const [dismissed, setDismissed] = useState(() => safeGet(storageKey) === DISMISSED_VALUE);
  const shouldReduceMotion = useReducedMotion();

  const handleDismiss = () => {
    safeSet(storageKey, DISMISSED_VALUE);
    setDismissed(true);
  };

  const motionProps = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          {...motionProps}
          role="region"
          aria-label={title}
          className="relative p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0" aria-hidden="true">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              <a
                href={ctaHref}
                className="inline-flex items-center gap-1 mt-2 px-1 py-0.5 text-xs font-mono font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded transition-colors"
              >
                {ctaLabel} →
              </a>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Cerrar sugerencia"
              className="w-6 h-6 p-1 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
