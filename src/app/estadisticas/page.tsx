"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrainingSession, EVENT_DATE, EVENT_DISTANCE, generateTrainingPlan, loadUserProgress } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";
import { BADGES, checkAchievements } from "@/lib/achievements";
import { loadWellnessData, WellnessData } from "@/components/WellnessTracker";
import { loadWeightEffortData, WeightEffortData } from "@/components/WeightEffortTracker";

export default function EstadisticasPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [weightEffortData, setWeightEffortData] = useState<WeightEffortData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const sessionsData = await generateTrainingPlan(session.planId);
        const progressMap = await loadUserProgress(session.userId);

        const sessionsWithProgress = sessionsData.map(s => {
          const progress = progressMap.get(s.id);
          if (progress) {
            return { ...s, ...progress };
          }
          return s;
        });

        setSessions(sessionsWithProgress);

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
    };

    loadData();
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
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
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
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Estadísticas</h1>
            <p className="mt-1 text-base text-muted-foreground">
              Progreso al 17 de mayo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {[
            { label: "Días restantes", value: daysLeft, color: "text-secondary", bg: "bg-secondary/5" },
            { label: "Sesiones", value: completedSessions.length, sub: `/ ${totalSessions}`, color: "text-primary", bg: "bg-primary/5" },
            { label: "Distancia", value: totalDistance.toFixed(1), sub: `km`, color: "text-green-500", bg: "bg-green-500/5" },
            { label: "Cumplimiento", value: completionRate, sub: "%", color: "text-blue-500", bg: "bg-blue-500/5" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`rounded-2xl border border-border ${stat.bg} p-4`}
            >
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`} style={{ fontFamily: "var(--font-urbanist)" }}>
                {stat.value}
                {stat.sub && <span className="text-base font-normal text-muted-foreground ml-1">{stat.sub}</span>}
              </p>
            </motion.div>
          ))}
        </div>

        {wellnessData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 space-y-3"
          >
            <h2 className="text-base font-semibold text-foreground">💆‍♀️ Bienestar Promedio</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "😴 Sueño", value: avgSleep, icon: "🌙" },
                { label: "🦵 Piernas", value: avgLegs, icon: "💪" },
                { label: "⚡ Energía", value: avgEnergy, icon: "🔋" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>{item.value || "-"}</p>
                  <p className="text-xs text-muted-foreground/50">/ 5</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {weightEffortData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 space-y-3"
          >
            <h2 className="text-base font-semibold text-foreground">⚖️ Peso e Esfuerzo</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">⚖️ Peso Actual</p>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {recentWeight || "-"} <span className="text-base font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">💪 Esfuerzo Promedio</p>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {avgEffort || "-"} <span className="text-base font-normal text-muted-foreground">/ 5</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 space-y-4"
        >
          {[
            { label: "Distancia", current: totalDistance, total: EVENT_DISTANCE, color: "bg-gradient-to-r from-primary to-secondary" },
            { label: "Sesiones", current: completedSessions.length, total: totalSessions, color: "bg-primary" },
          ].map((bar) => (
            <div key={bar.label} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-muted-foreground">{bar.label}</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {bar.current.toFixed(1)} / {bar.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-base font-semibold text-foreground">Logros</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const stored = localStorage.getItem("runplan-pro_achievements");
              const unlockedBadges = stored ? JSON.parse(stored) : [];
              const isUnlocked = unlockedBadges.includes(badge.id);

              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl border p-4 text-center transition-colors ${
                    isUnlocked
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-surface opacity-50"
                  }`}
                >
                  <div className="text-3xl mb-2">{isUnlocked ? badge.icon : "🔒"}</div>
                  <p className={`text-sm font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.name}
                  </p>
                  {isUnlocked && (
                    <p className="text-xs text-muted-foreground mt-1">
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
            className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-4"
          >
            <h2 className="text-base font-semibold text-foreground mb-1">Próxima sesión</h2>
            <p className="text-base text-muted-foreground">
              <span className="font-medium text-foreground">{nextSession.dayLabel}</span> · {nextSession.workout}
            </p>
          </motion.div>
        )}

        {completedSessions.length === totalSessions && totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center"
          >
            <p className="text-xl font-bold text-green-500">🎉 ¡Plan completado!</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}