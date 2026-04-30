"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PostWorkoutModalProps {
  session: {
    id: string;
    workout: string;
    distance: number;
    dayLabel: string;
    actualTime?: string;
    feeling?: number;
    notes?: string;
    actualDistance?: number;
  };
  onSave: (data: {
    actualTime: string;
    actualPace: string;
    feeling: number;
    notes: string;
    actualDistance: number;
  }) => void;
  onClose: () => void;
}

export default function PostWorkoutModal({ session, onSave, onClose }: PostWorkoutModalProps) {
  const [time, setTime] = useState(session.actualTime || "");
  const [feeling, setFeeling] = useState(session.feeling || 0);
  const [notes, setNotes] = useState(session.notes || "");
  const [kmCompleted, setKmCompleted] = useState(
    session.actualDistance ? session.actualDistance.toString() : session.distance.toString()
  );

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
      actualDistance: parseFloat(kmCompleted) || session.distance,
    });
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
            ¡Sesión Completada!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {session.dayLabel} · {session.workout}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              ⏱️ Tiempo real (min:seg)
            </label>
            <input
              type="text"
              placeholder="ej. 32:45"
              value={time}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,2}:?\d{0,2}$/.test(val)) {
                  setTime(val);
                }
              }}
              className="w-full h-12 rounded-xl border border-border bg-surface-elevated px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
            />
            {time && (
              <p className="mt-2 text-sm text-secondary font-medium">
                Ritmo: {calculatePace(time, session.distance) || "..."}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              🏃‍♂️ Km completados (plan: {session.distance} km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder={session.distance.toString()}
              value={kmCompleted}
              onChange={(e) => setKmCompleted(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-surface-elevated px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
            />
            {parseFloat(kmCompleted) < session.distance && (
              <p className="mt-2 text-sm text-warning font-medium">
                Te faltaron {(session.distance - parseFloat(kmCompleted || "0")).toFixed(1)} km
              </p>
            )}
            {parseFloat(kmCompleted) > session.distance && (
              <p className="mt-2 text-sm text-success font-medium">
                ¡Superaste el plan por {(parseFloat(kmCompleted || "0") - session.distance).toFixed(1)} km! 💪
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              ⭐ ¿Cómo te sentiste?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setFeeling(star)}
                  className={`text-3xl transition-all ${star <= feeling ? 'scale-110' : 'opacity-40 hover:opacity-70'}`}
                >
                  {star <= feeling ? (
                    <span className="text-accent">★</span>
                  ) : (
                    <span className="text-muted-foreground">☆</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              📝 Notas (opcional)
            </label>
            <textarea
              placeholder="¿Cómo fue tu entrenamiento?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-border bg-surface-elevated px-4 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Omitir
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}