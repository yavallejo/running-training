"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PostWorkoutModalProps {
  session: {
    id: string;
    workout: string;
    distance: number;
    dayLabel: string;
    completed?: boolean;
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
  onQuickComplete?: () => void;
  onClose: () => void;
}

const FEELINGS = [
  { value: 1, emoji: "😓", label: "Muy difícil" },
  { value: 2, emoji: "😐", label: "Difícil" },
  { value: 3, emoji: "🙂", label: "Bien" },
  { value: 4, emoji: "😊", label: "Muy bien" },
  { value: 5, emoji: "🔥", label: "Excelente" },
];

export default function PostWorkoutModal({ session, onSave, onQuickComplete, onClose }: PostWorkoutModalProps) {
  const isEditing = !!session.completed;
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
    return `${paceMin}:${paceSec.toString().padStart(2, "0")} min/km`;
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

  const kmDiff = parseFloat(kmCompleted || "0") - session.distance;
  const pace = time ? calculatePace(time, session.distance) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-surface border border-border/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="relative px-5 pt-4 pb-5 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.05 }}
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_8px_20px_-4px_rgba(255,59,48,0.35)] ${
              isEditing
                ? "bg-gradient-to-br from-info to-info/70"
                : "bg-gradient-to-br from-primary to-primary/70"
            }`}
          >
            {isEditing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </motion.div>
          <h3 className="text-lg font-black text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
            {isEditing ? "Editar entrenamiento" : "¿Cómo fue tu sesión?"}
          </h3>
          <p className="text-xs font-mono text-muted-foreground mt-1 tracking-wide">
            {session.dayLabel} · {session.workout}
          </p>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Time + Pace */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                TIEMPO (min:seg)
              </label>
              <input
                type="text"
                placeholder="32:45"
                value={time}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,2}:?\d{0,2}$/.test(val)) setTime(val);
                }}
                className="w-full h-11 rounded-xl border border-border/50 bg-background/60 px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                KM COMPLETADOS
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder={session.distance.toString()}
                value={kmCompleted}
                onChange={(e) => setKmCompleted(e.target.value)}
                className="w-full h-11 rounded-xl border border-border/50 bg-background/60 px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Computed feedback */}
          <AnimatePresence>
            {(pace || Math.abs(kmDiff) > 0.05) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                {pace && (
                  <div className="flex-1 px-3 py-2 rounded-lg bg-primary/8 border border-primary/15 text-center">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">RITMO</p>
                    <p className="text-sm font-bold text-primary">{pace}</p>
                  </div>
                )}
                {Math.abs(kmDiff) > 0.05 && (
                  <div className={`flex-1 px-3 py-2 rounded-lg text-center ${kmDiff > 0 ? "bg-success/8 border border-success/20" : "bg-warning/8 border border-warning/20"}`}>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">DIFERENCIA</p>
                    <p className={`text-sm font-bold ${kmDiff > 0 ? "text-success" : "text-warning"}`}>
                      {kmDiff > 0 ? "+" : ""}{kmDiff.toFixed(1)} km
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feeling */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              ¿CÓMO TE SENTISTE?
            </label>
            <div className="flex gap-2">
              {FEELINGS.map(({ value, emoji, label }) => (
                <motion.button
                  key={value}
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setFeeling(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    feeling === value
                      ? "bg-primary/12 border-primary/40 scale-105 shadow-sm"
                      : "bg-background/40 border-border/40 hover:border-border hover:bg-surface"
                  }`}
                  title={label}
                >
                  <span className={`text-xl leading-none transition-all ${feeling === value ? "" : "opacity-50"}`}>
                    {emoji}
                  </span>
                  {feeling === value && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[8px] font-mono text-primary tracking-wide leading-none"
                    >
                      {label.split(" ")[0].toUpperCase()}
                    </motion.p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              NOTAS (OPCIONAL)
            </label>
            <textarea
              placeholder="¿Cómo fue tu entrenamiento?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-background transition-all resize-none"
            />
          </div>

          {/* Actions */}
          {isEditing ? (
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-border/50 bg-background/50 text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-info to-info/85 text-sm font-bold text-white hover:opacity-90 transition-all"
              >
                Guardar cambios
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/85 text-sm font-bold text-white hover:opacity-92 transition-all shadow-[0_4px_14px_-3px_rgba(255,59,48,0.35)]"
              >
                Guardar y marcar como completado
              </button>
              {onQuickComplete && (
                <button
                  type="button"
                  onClick={onQuickComplete}
                  className="w-full h-10 rounded-xl border border-border/50 bg-background/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                >
                  Marcar como completado sin registrar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground py-1 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
