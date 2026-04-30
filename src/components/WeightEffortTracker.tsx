"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WeightEffortData {
  date: string;
  weight?: number;
  effort?: number;
  notes?: string;
}

const STORAGE_KEY = "runplan-pro_weight_effort";

export function loadWeightEffortData(): WeightEffortData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWeightEffortData(data: WeightEffortData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getTodaysData(): WeightEffortData | null {
  const all = loadWeightEffortData();
  const today = new Date().toISOString().split('T')[0];
  return all.find(w => w.date === today) || null;
}

const EFFORT_LABELS = ["", "Muy fácil", "Fácil", "Moderado", "Difícil", "Muy difícil"];

const getEffortColor = (value: number) => {
  if (value <= 2) return { text: "text-success", bg: "bg-success", label: "Fácil" };
  if (value <= 3) return { text: "text-warning", bg: "bg-warning", label: "Moderado" };
  return { text: "text-danger", bg: "bg-danger", label: "Difícil" };
};

export default function WeightEffortTracker() {
  const [todaysData, setTodaysData] = useState<WeightEffortData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [effort, setEffort] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const existing = getTodaysData();
    if (existing) {
      setTodaysData(existing);
      setWeight(existing.weight?.toString() || "");
      setEffort(existing.effort || 3);
      setNotes(existing.notes || "");
    }
  }, []);

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const all = loadWeightEffortData();
    const existingIndex = all.findIndex(w => w.date === today);

    const newData: WeightEffortData = {
      date: today,
      weight: weight ? parseFloat(weight) : undefined,
      effort,
      notes: notes || undefined
    };

    if (existingIndex >= 0) {
      all[existingIndex] = newData;
    } else {
      all.push(newData);
    }

    saveWeightEffortData(all);
    setTodaysData(newData);
    setShowForm(false);
  };

  const effortInfo = getEffortColor(effort);

  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-xl">⚖️</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
              Peso y Esfuerzo
            </h3>
            <p className="text-xs text-muted-foreground">Seguimiento físico</p>
          </div>
        </div>
        {todaysData && !showForm && effortInfo && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${effortInfo.bg}`} />
            <span className={`text-xs font-medium ${effortInfo.text}`}>
              {effortInfo.label}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <span className="text-base">⚖️</span>
                  Peso corporal
                </label>
                {weight && (
                  <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
                    {weight} kg
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 65.5"
                className="w-full h-12 rounded-xl border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💪</span>
                  <div>
                    <span className="text-xs font-medium text-foreground">Esfuerzo percibido</span>
                    <p className="text-[10px] text-muted-foreground">RPE de hoy</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${effortInfo.text}`} style={{ fontFamily: "var(--font-syne)" }}>
                  {effort}/5 - {EFFORT_LABELS[effort]}
                </div>
              </div>
              <div className="relative">
                <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-success via-warning to-danger"
                    initial={{ width: 0 }}
                    animate={{ width: `${(effort / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre tu estado físico..."
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-elevated text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : todaysData ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              {todaysData.weight && (
                <div className="p-3 rounded-xl bg-surface-elevated text-center">
                  <span className="text-lg">⚖️</span>
                  <p className="text-2xl font-bold text-foreground mt-1" style={{ fontFamily: "var(--font-syne)" }}>
                    {todaysData.weight}
                  </p>
                  <p className="text-[10px] text-muted-foreground">kg</p>
                </div>
              )}
              {todaysData.effort && (
                <div className="p-3 rounded-xl bg-surface-elevated text-center">
                  <span className="text-lg">💪</span>
                  <p className={`text-2xl font-bold mt-1 ${effortInfo.text}`} style={{ fontFamily: "var(--font-syne)" }}>
                    {todaysData.effort}
                  </p>
                  <p className={`text-[10px] font-medium ${effortInfo.text}`}>
                    {EFFORT_LABELS[todaysData.effort]}
                  </p>
                </div>
              )}
            </div>
            {todaysData.notes && (
              <p className="text-xs text-muted-foreground/70 italic bg-surface-elevated p-2 rounded-lg">
                "{todaysData.notes}"
              </p>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-3 py-2 rounded-xl bg-surface-elevated text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Editar registro
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-surface-elevated mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Registra tu peso y esfuerzo percibido
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Agregar registro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}