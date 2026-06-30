"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface RaceResultModalProps {
  isOpen: boolean;
  raceName: string;
  raceDate: string;
  raceDistance: number;
  planId: string;
  onClose: () => void;
  onResultSaved: () => void;
}

const FEELING_OPTIONS = [
  { value: 5, emoji: "😊", label: "¡Increíble!" },
  { value: 4, emoji: "😤", label: "Bien" },
  { value: 3, emoji: "😐", label: "Normal" },
  { value: 2, emoji: "😵", label: "Difícil" },
  { value: 1, emoji: "🤢", label: "Muy mal" },
];

export default function RaceResultModal({
  isOpen,
  raceName,
  raceDate,
  raceDistance,
  planId,
  onClose,
  onResultSaved,
}: RaceResultModalProps) {
  const [raceTime, setRaceTime] = useState("");
  const [feeling, setFeeling] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const validateTimeFormat = (time: string): boolean => {
    const regex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
    return regex.test(time);
  };

  const formatTimeInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}:${numbers.slice(4, 6)}`;
  };

  const handleSave = async () => {
    if (!raceTime || !validateTimeFormat(raceTime)) {
      setError("Ingresa un tiempo válido (HH:MM:SS)");
      return;
    }

    if (!feeling) {
      setError("Selecciona cómo te sentiste");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const session = getSession();
      if (!session?.userId) {
        setError("No se encontró la sesión");
        return;
      }

      const deadlineAt = new Date(raceDate);
      deadlineAt.setDate(deadlineAt.getDate() + 10);

      const { error: insertError } = await supabase.from("race_results").insert({
        user_id: session.userId,
        plan_id: planId,
        race_date: raceDate,
        race_time: raceTime,
        race_feeling: feeling,
        completed: true,
        deadline_at: deadlineAt.toISOString(),
      });

      if (insertError) {
        console.error("Error saving race result:", insertError);
        setError("Error al guardar. Intenta de nuevo.");
        return;
      }

      onResultSaved();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError("Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-border/50 rounded-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🏁</span>
              </div>
              <div>
                <h2
                  className="text-lg font-black tracking-tight"
                  style={{ fontFamily: "var(--font-urbanist)" }}
                >
                  ¡Tu Carrera!
                </h2>
                <p className="text-xs font-mono text-muted-foreground">
                  {raceName} · {formatDate(raceDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-sm text-center text-muted-foreground">
              ¿Cómo te fue corriendo tus {raceDistance} km?
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                Tiempo Final
              </label>
              <input
                type="text"
                value={raceTime}
                onChange={(e) => setRaceTime(formatTimeInput(e.target.value))}
                placeholder="01:30:00"
                maxLength={8}
                className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-center text-xl font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
              />
              <p className="text-[10px] text-muted-foreground text-center">
                Formato: HH:MM:SS
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                ¿Cómo te sentiste?
              </label>
              <div className="flex justify-center gap-2">
                {FEELING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFeeling(option.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      feeling === option.value
                        ? "bg-primary/20 border-2 border-primary scale-110"
                        : "bg-background/50 border border-border/50 hover:border-primary/30"
                    }`}
                    title={option.label}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-danger text-center font-mono"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
              >
                Omitir
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
