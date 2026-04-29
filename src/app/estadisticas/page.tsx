"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrainingSession, EVENT_DATE, EVENT_DISTANCE, generateTrainingPlan, PLAN_VERSION } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";
import { BADGES, checkAchievements } from "@/lib/achievements";
import { loadWellnessData, WellnessData } from "@/components/WellnessTracker";
import { loadWeightEffortData, WeightEffortData } from "@/components/WeightEffortTracker";

const STORAGE_KEY = "yadira_training_plan";

export default function EstadisticasPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [weightEffortData, setWeightEffortData] = useState<WeightEffortData[]>([]);

  useEffect(() => {
    try {
      const session = getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const planStored = localStorage.getItem(STORAGE_KEY);
      const storedVersion = localStorage.getItem(`${STORAGE_KEY}_version`);
      const generated = generateTrainingPlan();
      
      let sessionsData: TrainingSession[];
      if (planStored && storedVersion === PLAN_VERSION) {
        try {
          const parsed = JSON.parse(planStored);
          sessionsData = generated.map((gen) => {
            const saved = parsed.find((s: TrainingSession) => s.id === gen.id);
            return saved ? { ...gen, completed: saved.completed ?? false } : gen;
          });
        } catch {
          sessionsData = generated;
        }
      } else {
        sessionsData = generated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
        localStorage.setItem(`${STORAGE_KEY}_version`, PLAN_VERSION);
      }
      setSessions(sessionsData);

      const eventDate = new Date(EVENT_DATE);
      const today = new Date();
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, diffDays));
    } catch (error) {
      console.error("Error loading estadisticas:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setWellnessData(loadWellnessData());
    setWeightEffortData(loadWeightEffortData());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    );
  }

  const completedSessions = sessions.filter(s => s.completed);
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0;
  const totalDistance = completedSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalPlannedDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
  const nextSession = sessions.find(s => !s.completed);

  // Calculate averages
  const avgSleep = wellnessData.length > 0
    ? (wellnessData.reduce((sum, w) => sum + w.sleep, 0) / wellnessData.length).toFixed(1)
    : null;
  const avgLegs = wellnessData.length > 0
    ? (wellnessData.reduce((sum, w) => sum + w.legs, 0) / wellnessData.length).toFixed(1)
    : null;
  const avgEnergy = wellnessData.length > 0
    ? (wellnessData.reduce((sum, w) => sum + w.energy, 0) / wellnessData.length).toFixed(1)
    : null;
  const avgEffort = weightEffortData.filter(d => d.effort).length > 0
    ? (weightEffortData.filter(d => d.effort).reduce((sum, d) => sum + (d.effort || 0), 0) / weightEffortData.filter(d => d.effort).length).toFixed(1)
    : null;
  const recentWeight = weightEffortData.filter(d => d.weight).length > 0
    ? weightEffortData.filter(d => d.weight).slice(-1)[0].weight
    : null;

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Estadísticas</h1>
            <p className="mt-1 text-sm text-foreground/50">
              Progreso al 17 de mayo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Días restantes", value: daysLeft, color: "text-secondary", bg: "bg-secondary/5" },
            { label: "Sesiones", value: completedSessions.length, sub: `/ ${totalSessions}`, color: "text-primary", bg: "bg-primary/5" },
            { label: "Distancia", value: totalDistance, sub: `km / ${totalPlannedDistance} km`, color: "text-green-500", bg: "bg-green-500/5" },
            { label: "Cumplimiento", value: completionRate, sub: "%", color: "text-blue-500", bg: "bg-blue-500/5" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`rounded-xl border border-foreground/5 ${stat.bg} p-4`}
            >
              <p className="text-xs text-foreground/50">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.color}`}>
                {stat.value}
                {stat.sub && <span className="ml-1 text-sm font-normal text-foreground/40">{stat.sub}</span>}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Wellness Stats */}
        {wellnessData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 space-y-3"
          >
            <h2 className="text-sm font-medium text-foreground">💆‍♀️ Bienestar Promedio</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "😴 Sueño", value: avgSleep, icon: "🌙" },
                { label: "🦵 Piernas", value: avgLegs, icon: "💪" },
                { label: "⚡ Energía", value: avgEnergy, icon: "🔋" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-foreground/5 bg-background p-3 text-center">
                  <p className="text-[10px] text-foreground/40 mb-1">{item.label}</p>
                  <p className="text-lg font-semibold text-foreground">{item.value || "-"}</p>
                  <p className="text-[9px] text-foreground/30">/ 5</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weight & Effort Stats */}
        {weightEffortData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 space-y-3"
          >
            <h2 className="text-sm font-medium text-foreground">⚖️ Peso e Esfuerzo</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-foreground/5 bg-background p-3 text-center">
                <p className="text-[10px] text-foreground/40 mb-1">⚖️ Peso Actual</p>
                <p className="text-lg font-semibold text-foreground">{recentWeight || "-"} <span className="text-xs font-normal text-foreground/40">kg</span></p>
              </div>
              <div className="rounded-xl border border-foreground/5 bg-background p-3 text-center">
                <p className="text-[10px] text-foreground/40 mb-1">💪 Esfuerzo Promedio</p>
                <p className="text-lg font-semibold text-foreground">{avgEffort || "-"} <span className="text-xs font-normal text-foreground/40">/ 5</span></p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 space-y-3"
        >
          {[
            { label: "Distancia", current: totalDistance, total: EVENT_DISTANCE, color: "bg-gradient-to-r from-primary to-secondary" },
            { label: "Sesiones", current: completedSessions.length, total: totalSessions, color: "bg-primary" },
          ].map((bar) => (
            <div key={bar.label} className="rounded-xl border border-foreground/5 p-4">
              <div className="mb-1.5 flex justify-between">
                <span className="text-xs text-foreground/50">{bar.label}</span>
                <span className="text-xs text-foreground/50">
                  {bar.current} / {bar.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bar.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((bar.current / bar.total) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-foreground">Logros</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {BADGES.map((badge) => {
              const stored = localStorage.getItem("yadira_achievements");
              const unlockedBadges = stored ? JSON.parse(stored) : [];
              const isUnlocked = unlockedBadges.includes(badge.id);
              
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl border p-3 text-center transition-colors ${
                    isUnlocked 
                      ? "border-primary/20 bg-primary/5" 
                      : "border-foreground/5 bg-foreground/[0.02] opacity-40"
                  }`}
                >
                  <div className="text-2xl mb-1">{isUnlocked ? badge.icon : "🔒"}</div>
                  <p className={`text-[10px] font-medium ${isUnlocked ? "text-foreground" : "text-foreground/40"}`}>
                    {badge.name}
                  </p>
                  {isUnlocked && (
                    <p className="text-[9px] text-foreground/40 mt-0.5">
                      {badge.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {nextSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4"
          >
            <h2 className="text-sm font-medium text-foreground mb-1">Próxima sesión</h2>
            <p className="text-sm text-foreground/70">
              <span className="font-medium">{nextSession.dayLabel}</span> · {nextSession.workout}
            </p>
          </motion.div>
        )}

        {completedSessions.length === totalSessions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-xl border border-green-500/10 bg-green-500/[0.03] p-4 text-center"
          >
            <p className="text-xl font-semibold text-green-500">🎉 ¡Plan completado!</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
