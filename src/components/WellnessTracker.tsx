"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface WellnessData {
  date: string;
  sleep: number; // 1-5
  legs: number; // 1-5 (1=very sore, 5=great)
  energy: number; // 1-5
  notes?: string;
}

const STORAGE_KEY = "runplan-pro_wellness";

export function loadWellnessData(): WellnessData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading wellness data:', error);
    return [];
  }
}

export function saveWellnessData(data: WellnessData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving wellness data:', error);
  }
}

export function getTodaysWellness(): WellnessData | null {
  const all = loadWellnessData();
  const today = new Date().toISOString().split('T')[0];
  return all.find(w => w.date === today) || null;
}

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

  const getStatusColor = (value: number) => {
    if (value >= 4) return "text-green-500";
    if (value >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusText = (value: number) => {
    if (value >= 4) return "Bueno";
    if (value >= 3) return "Regular";
    return "Bajo";
  };

  return (
    <div className="rounded-xl border border-foreground/5 bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-foreground/70">
          💆‍♀️ Bienestar de Hoy
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
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-foreground/50">😴 Sueño</span>
            <span className={`font-medium ${getStatusColor(todaysData.sleep)}`}>
              {getStatusText(todaysData.sleep)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-foreground/50">🦵 Piernas</span>
            <span className={`font-medium ${getStatusColor(todaysData.legs)}`}>
              {getStatusText(todaysData.legs)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-foreground/50">⚡ Energía</span>
            <span className={`font-medium ${getStatusColor(todaysData.energy)}`}>
              {getStatusText(todaysData.energy)}
            </span>
          </div>
          {todaysData.notes && (
            <p className="text-[10px] text-foreground/40 italic mt-1">
              "{todaysData.notes}"
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          {/* Sleep */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-foreground/60">😴 Sueño</span>
              <span className="text-[10px] text-foreground/40">{sleep}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-foreground/30">
              <span>Poco</span>
              <span>Mucho</span>
            </div>
          </div>

          {/* Legs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-foreground/60">🦵 Sensación de piernas</span>
              <span className="text-[10px] text-foreground/40">{legs}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={legs}
              onChange={(e) => setLegs(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-foreground/30">
              <span>Doloridas</span>
              <span>Frescas</span>
            </div>
          </div>

          {/* Energy */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-foreground/60">⚡ Energía</span>
              <span className="text-[10px] text-foreground/40">{energy}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-foreground/30">
              <span>Cansancio</span>
              <span>Llena de energía</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas opcionales..."
              className="w-full rounded-lg border border-foreground/10 bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </motion.div>
      )}
    </div>
  );
}
