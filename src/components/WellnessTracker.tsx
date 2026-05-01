"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WellnessData {
  date: string;
  sleep: number;
  legs: number;
  energy: number;
  notes?: string;
}

const STORAGE_KEY = "runplan-pro_wellness";

export function loadWellnessData(): WellnessData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWellnessData(data: WellnessData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getTodaysWellness(): WellnessData | null {
  const all = loadWellnessData();
  const today = new Date().toISOString().split('T')[0];
  return all.find(w => w.date === today) || null;
}

const STATUS_CONFIG = [
  { min: 4, color: "text-success", bg: "bg-success", label: "Excelente" },
  { min: 3, color: "text-warning", bg: "bg-warning", label: "Regular" },
  { min: 0, color: "text-danger", bg: "bg-danger", label: "Bajo" },
];

const getStatusInfo = (value: number) => {
  const config = STATUS_CONFIG.find(c => value >= c.min);
  return config || STATUS_CONFIG[STATUS_CONFIG.length - 1];
};

const METRICS = [
  { key: 'sleep' as const, label: 'Sueño', icon: '😴', desc: '¿Cómo dormiste?' },
  { key: 'legs' as const, label: 'Piernas', icon: '🦵', desc: 'Sensación muscular' },
  { key: 'energy' as const, label: 'Energía', icon: '⚡', desc: 'Nivel de energía' },
];

export default function WellnessTracker() {
  const [todaysData, setTodaysData] = useState<WellnessData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sleep, setSleep] = useState(3);
  const [legs, setLegs] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const existing = getTodaysWellness();
    if (existing) {
      setTodaysData(existing);
      setSleep(existing.sleep);
      setLegs(existing.legs);
      setEnergy(existing.energy);
      setNotes(existing.notes || "");
    }
  }, []);

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const all = loadWellnessData();
    const existingIndex = all.findIndex(w => w.date === today);
    const newData: WellnessData = { date: today, sleep, legs, energy, notes };

    if (existingIndex >= 0) {
      all[existingIndex] = newData;
    } else {
      all.push(newData);
    }

    saveWellnessData(all);
    setTodaysData(newData);
    setShowForm(false);
  };

  const averageScore = todaysData ? Math.round((todaysData.sleep + todaysData.legs + todaysData.energy) / 3) : 0;
  const overallStatus = getStatusInfo(averageScore);

  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <span className="text-xl">💆‍♀️</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
              Bienestar Diario
            </h3>
            <p className="text-xs text-muted-foreground">¿Cómo te sientes hoy?</p>
          </div>
        </div>
        {todaysData && !showForm && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${overallStatus.bg}`} />
            <span className={`text-xs font-medium ${overallStatus.color}`}>
              {overallStatus.label}
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
            {METRICS.map((metric) => {
              const value = metric.key === 'sleep' ? sleep : metric.key === 'legs' ? legs : energy;
              const setter = metric.key === 'sleep' ? setSleep : metric.key === 'legs' ? setLegs : setEnergy;

              return (
                <div key={metric.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{metric.icon}</span>
                      <div>
                        <span className="text-xs font-medium text-foreground">{metric.label}</span>
                        <p className="text-[10px] text-muted-foreground">{metric.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getStatusInfo(value).color}`}>{value}/5</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
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
              );
            })}

            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre cómo te sientes..."
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
            <div className="grid grid-cols-3 gap-2 mb-3">
              {METRICS.map((metric) => {
                const value = metric.key === 'sleep' ? todaysData.sleep : metric.key === 'legs' ? todaysData.legs : todaysData.energy;
                const status = getStatusInfo(value);

                return (
                  <div key={metric.key} className="text-center p-2 rounded-xl bg-surface-elevated">
                    <span className="text-lg">{metric.icon}</span>
                    <p className="text-lg font-bold text-foreground mt-1" style={{ fontFamily: "var(--font-urbanist)" }}>
                      {value}
                    </p>
                    <p className={`text-[10px] font-medium ${status.color}`}>{status.label}</p>
                  </div>
                );
              })}
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
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Registra cómo te sientes para mejor seguimiento
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Registrar bienestar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}