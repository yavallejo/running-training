"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PostWorkoutModalProps {
  session: {
    id: string;
    workout: string;
    distance: number;
    dayLabel: string;
  };
  onSave: (data: {
    actualTime: string;
    actualPace: string;
    feeling: number;
    notes: string;
  }) => void;
  onClose: () => void;
}

export default function PostWorkoutModal({ session, onSave, onClose }: PostWorkoutModalProps) {
  const [time, setTime] = useState("");
  const [feeling, setFeeling] = useState(0);
  const [notes, setNotes] = useState("");

  // Calculate pace from time and distance
  const calculatePace = (timeStr: string, distance: number): string => {
    if (!timeStr || !distance) return "";
    const parts = timeStr.split(":");
    if (parts.length !== 2) return "";
    const minutes = parseInt(parts[0]) + parseInt(parts[1]) / 60;
    const paceMin = Math.floor(minutes / distance);
    const paceSec = Math.round((minutes / distance - paceMin) * 60);
    return `~${paceMin}:${paceSec.toString().padStart(2, '0')} min/km`;
  };

  const handleSave = () => {
    const actualPace = calculatePace(time, session.distance);
    onSave({
      actualTime: time,
      actualPace,
      feeling,
      notes,
    });
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm rounded-2xl bg-background border border-foreground/10 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg">🎉</span>
          </div>
          <h3 className="text-base font-semibold text-foreground">¡Sesión Completada!</h3>
          <p className="text-xs text-foreground/50 mt-0.5">
            {session.dayLabel} · {session.workout}
          </p>
        </div>

        <div className="space-y-3">
          {/* Time Input */}
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Tiempo real (min:seg)
            </label>
            <input
              type="text"
              placeholder="ej. 32:45"
              value={time}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow format MM:SS
                if (/^\d{0,2}:?\d{0,2}$/.test(val)) {
                  setTime(val);
                }
              }}
              className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            {time && (
              <p className="mt-1 text-[10px] text-foreground/40">
                Ritmo: {calculatePace(time, session.distance) || "..."}
              </p>
            )}
          </div>

          {/* Feeling Stars */}
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              ¿Cómo te sentiste?
            </label>
            <div className="flex gap-1.5 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeeling(star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= feeling ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Notas (opcional)
            </label>
            <textarea
              placeholder="¿Cómo fue tu entrenamiento?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-foreground/10 px-4 py-2 text-sm font-medium text-foreground/60 hover:bg-foreground/5 transition-colors"
          >
            Omitir
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
