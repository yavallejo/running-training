"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ToastNotificationProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
  icon?: string;
  type?: "info" | "warning" | "success";
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
}

export default function ToastNotification({
  isVisible,
  message,
  subMessage,
  icon = "⏰",
  type = "info",
  onClose,
  action,
  autoClose = 0,
}: ToastNotificationProps) {
  useEffect(() => {
    if (autoClose > 0 && isVisible) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, onClose]);

  const bgColor =
    type === "warning"
      ? "bg-warning/10 border-warning/30"
      : type === "success"
      ? "bg-success/10 border-success/30"
      : "bg-surface border-border/50";

  const iconBgColor =
    type === "warning"
      ? "bg-warning/20"
      : type === "success"
      ? "bg-success/20"
      : "bg-primary/10";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4"
          role="status"
          aria-live="polite"
        >
          <div
            className={`${bgColor} border rounded-2xl p-4 shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center text-xl shrink-0`}
                aria-hidden="true"
              >
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{message}</p>
                {subMessage && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {subMessage}
                  </p>
                )}

                {action && (
                  <button
                    onClick={action.onClick}
                    className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    {action.label} →
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                aria-label="Cerrar notificación"
                className="w-6 h-6 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
