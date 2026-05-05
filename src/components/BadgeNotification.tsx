"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeNotificationProps {
  badge: {
    icon: string;
    name: string;
    description: string;
  } | null;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badge) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 400);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  const dismiss = () => {
    setShow(false);
    setTimeout(onClose, 400);
  };

  return (
    <AnimatePresence>
      {show && badge && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.75 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[360px] px-4 cursor-pointer"
          onClick={dismiss}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(255,59,48,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-orange-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_20%_-10%,rgba(255,255,255,0.22),transparent)]" />

            <motion.div
              initial={{ x: "-110%" }}
              animate={{ x: "320%" }}
              transition={{ duration: 1.3, delay: 0.25, ease: "easeOut" }}
              className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/22 to-transparent skew-x-[-18deg] pointer-events-none"
            />

            <div className="relative p-4 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: [0, 1.25, 1], rotate: [-25, 4, 0] }}
                transition={{ delay: 0.1, duration: 0.5, ease: "backOut" }}
                className="w-14 h-14 flex-shrink-0 rounded-xl bg-white/18 border border-white/28 flex items-center justify-center"
              >
                <span className="text-3xl leading-none select-none">{badge.icon}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[10px] font-mono text-white/65 tracking-[0.18em] uppercase mb-0.5">
                  Logro desbloqueado
                </p>
                <p
                  className="text-base font-black text-white tracking-tight leading-snug truncate"
                  style={{ fontFamily: "var(--font-urbanist)" }}
                >
                  {badge.name}
                </p>
                <p className="text-xs text-white/72 mt-0.5 truncate">{badge.description}</p>
              </motion.div>

              <button
                className="flex-shrink-0 w-6 h-6 rounded-md bg-white/12 hover:bg-white/22 flex items-center justify-center text-white/55 hover:text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss();
                }}
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className="h-[2px] bg-white/30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
