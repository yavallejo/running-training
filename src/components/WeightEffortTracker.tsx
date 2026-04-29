"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface WeightEffortData {
  date: string;
  weight?: number; // kg
  effort?: number; // 1-5 (perceived effort)
  notes?: string;
}

const STORAGE_KEY = "runplan-pro_weight_effort";

export function loadWeightEffortData(): WeightEffortData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading weight/effort data:', error);
    return [];
  }
}

export function saveWeightEffortData(data: WeightEffortData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving weight/effort data:', error);
  }
}

export function getTodaysData(): WeightEffortData | null {
  const all = loadWeightEffortData();
  const today = new Date().toISOString().split('T')[0];
  return all.find(w => w.date === today) || null;
}

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
      effort: effort,
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

  const getEffortLabel = (value: number) => {
    const labels = ["", "Muy fácil", "Fácil", "Moderado", "Difícil", "Muy difícil"];
    return labels[value] || "";
  };

  const getEffortColor = (value: number) => {
    if (value <= 2) return "text-green-500";
    if (value <= 3) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="rounded-xl border border-foreground/5 bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-foreground/70">
          ⚖️ Peso e Esfuerzo
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[10px] text-primary hover:text-primary/80"
        >
          {todaysData && !showForm ? 'Editar' : showForm ? 'Cancelar' : 'Registrar'}
        </button>
      </div>

      {todaysData && !showForm ? (
        <div className="space-y-1.5">
          {todaysData.weight && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-foreground/50">⚖️ Peso</span>
              <span className="font-medium text-foreground">{todaysData.weight} kg</span>
            </div>
          )}
          {todaysData.effort && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-foreground/50">💪 Esfuerzo promedio</span>
              <span className={`font-medium ${getEffortColor(todaysData.effort)}`}>
                {getEffortLabel(todaysData.effort)} ({todaysData.effort}/5)
              </span>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          {/* Weight */}
          <div>
            <label className="text-[10px] text-foreground/50 mb-1 block">⚖️ Peso (opcional)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej: 65.5"
              className="w-full rounded-lg border border-foreground/10 bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Effort */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-foreground/50">💪 Esfuerzo percibido</span>
              <span className={`text-[10px] font-medium ${getEffortColor(effort)}`}>
                {getEffortLabel(effort)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-foreground/30">
              <span>Fácil</span>
              <span>Difícil</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre tu estado físico..."
              className="w-full rounded-lg border border-foreground/10 bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </motion.div>
      )}
    </div>
  );
}
