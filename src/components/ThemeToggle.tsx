"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

interface ThemeToggleProps {
  className?: string;
  children?: React.ReactNode;
}

export default function ThemeToggle({ className, children }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const flashTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timers = flashTimers.current;
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleToggle = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    if (shouldReduceMotion) {
      setTheme(next);
      return;
    }

    const color = next === "dark" ? "#0d0d0f" : "#ffffff";
    setFlashColor(color);
    setTheme(next);

    flashTimers.current.push(
      setTimeout(() => {
        setFlashColor(null);
      }, 360)
    );
  }, [resolvedTheme, setTheme, shouldReduceMotion]);

  const buttonClass = children
    ? className ?? ""
    : `justify-center w-10 h-10 rounded-lg hover:bg-surface ${className ?? ""}`;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all overflow-hidden ${buttonClass}`}
        aria-label={resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        <div className={children ? "flex-shrink-0" : ""}>
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedTheme}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: -180, scale: 0.5 }
              }
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: 180, scale: 0.5 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{ perspective: 600 }}
            >
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            </motion.div>
          </AnimatePresence>
        </div>
        {children}
      </button>

      <AnimatePresence>
        {flashColor && (
          <motion.div
            key="theme-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{ backgroundColor: flashColor }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
