"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useSpring, useTransform } from "framer-motion";
import { TrainingSession, EVENT_DATE, EVENT_DISTANCE, generateTrainingPlan, PLAN_VERSION } from "@/lib/training-plan";

const STORAGE_KEY = "yadira_training_plan";
const USER_KEY = "yadira_user";

function AnimatedNumber({ value, duration = 1 }: { value: number; duration?: number }) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setCurrent(v));
    return unsubscribe;
  }, [display]);

  return <motion.span>{current}</motion.span>;
}

export default function EstadisticasPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (!user?.authenticated) {
        router.replace("/login");
        return;
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      router.replace("/login");
      return;
    }

    // Load plan data
    const planStored = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(`${STORAGE_KEY}_version`);
    const generated = generateTrainingPlan();
    
    if (planStored && storedVersion === PLAN_VERSION) {
      try {
        const parsed = JSON.parse(planStored);
        const merged = generated.map((gen) => {
          const saved = parsed.find((s: TrainingSession) => s.id === gen.id);
          return saved ? { ...gen, completed: saved.completed ?? false } : gen;
        });
        setSessions(merged);
      } catch {
        setSessions(generated);
      }
    } else {
      setSessions(generated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      localStorage.setItem(`${STORAGE_KEY}_version`, PLAN_VERSION);
    }

    // Calculate days left to event
    const eventDate = new Date(EVENT_DATE);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diffDays));

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.completed);
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0;
  const totalDistance = completedSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalPlannedDistance = sessions.reduce((sum, s) => sum + s.distance, 0);

  // Find next session
  const nextSession = sessions.find((s) => !s.completed);

  return (
    <div className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Estadísticas</h1>
          <p className="mt-2 text-foreground/60">
            Tu progreso hacia el evento del 24 de mayo
          </p>
        </motion.div>

        {/* Main stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            {
              label: "Días restantes",
              value: daysLeft,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              color: "text-secondary",
              bg: "bg-secondary/10",
            },
            {
              label: "Sesiones completadas",
              value: completedSessions.length,
              sub: `/ ${totalSessions}`,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Distancia recorrida",
              value: totalDistance,
              sub: `km / ${totalPlannedDistance} km`,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "% Cumplimiento",
              value: completionRate,
              sub: "%",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-foreground/10 bg-background p-5"
            >
              <div className={`inline-flex rounded-lg ${stat.bg} p-3 ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <p className="text-sm text-foreground/60">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">
                <AnimatedNumber value={stat.value} />
                {stat.sub && <span className="text-lg font-normal text-foreground/40">{stat.sub}</span>}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Progress towards goal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-foreground/10 bg-background p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Progreso hacia 7km</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-foreground/60">Distancia completada</span>
                <span className="text-sm font-medium text-foreground">
                  {totalDistance} km / {EVENT_DISTANCE} km
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-foreground/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalDistance / EVENT_DISTANCE) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-foreground/60">Sesiones completadas</span>
                <span className="text-sm font-medium text-foreground">
                  {completedSessions.length} / {totalSessions}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-foreground/10 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next session */}
        {nextSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Próxima sesión</h2>
            <p className="text-foreground">
              <span className="font-medium">{nextSession.dayLabel}</span> - {nextSession.workout}
            </p>
            <p className="text-sm text-foreground/60 mt-1">
              {nextSession.details}
            </p>
          </motion.div>
        )}

        {/* Message if all completed */}
        {completedSessions.length === totalSessions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center"
          >
            <p className="text-2xl font-bold text-green-500">🎉 ¡Plan completado!</p>
            <p className="mt-2 text-foreground/60">
              Has terminado todas las sesiones. ¡Prepárate para el evento del 24 de mayo!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
