"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrainingSession, generateTrainingPlan, EVENT_DATE, EVENT_NAME, PLAN_VERSION } from "@/lib/training-plan";

const STORAGE_KEY = "yadira_training_plan";
const USER_KEY = "yadira_user";

export default function PlanPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check auth
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (!user?.name) {
        router.replace("/login");
        return;
      }
      setUserName(user.name);
    } catch {
      localStorage.removeItem(USER_KEY);
      router.replace("/login");
      return;
    }

    // Load plan
    loadPlan();
    setLoading(false);
  }, [router]);

  const loadPlan = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(`${STORAGE_KEY}_version`);
    const generated = generateTrainingPlan();
    
    // Force update if plan version changed
    if (stored && storedVersion === PLAN_VERSION) {
      try {
        const parsed = JSON.parse(stored);
        const merged = generated.map((gen) => {
          const saved = parsed.find((s: TrainingSession) => s.id === gen.id);
          return saved ? { ...gen, completed: saved.completed ?? false } : gen;
        });
        setSessions(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        setSessions(generated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
        localStorage.setItem(`${STORAGE_KEY}_version`, PLAN_VERSION);
      }
    } else {
      setSessions(generated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      localStorage.setItem(`${STORAGE_KEY}_version`, PLAN_VERSION);
    }
  };

  const savePlan = useCallback((updated: TrainingSession[]) => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTimeout(() => setSaving(false), 800);
  }, []);

  const toggleComplete = (id: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSessions(updated);
    savePlan(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    router.replace("/login");
  };

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

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalSessions = sessions.length;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <div className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Hola, {userName} 👋
            </h1>
            <p className="mt-2 text-foreground/60">
              Tu plan de entrenamiento para el {EVENT_NAME} (24 mayo)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
          >
            Salir
          </button>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-2xl border border-foreground/10 bg-background p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground/80">
              Progreso general
            </span>
            <span className="text-sm font-bold text-primary">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-foreground/40">
            {completedCount} de {totalSessions} sesiones completadas
          </p>
          {saving && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-green-500"
            >
              ✓ Guardado
            </motion.p>
          )}
        </motion.div>

        {/* Training sessions */}
        <div className="space-y-4">
          <AnimatePresence>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border p-5 transition-colors ${
                  session.completed
                    ? "border-primary/30 bg-primary/5"
                    : "border-foreground/10 bg-background hover:border-foreground/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(session.id)}
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      session.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground/30 hover:border-primary"
                    }`}
                  >
                    {session.completed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {session.dayLabel}
                        </p>
                        <p className="text-sm text-foreground/60">
                          {session.workout}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                          {session.distance} km
                        </span>
                        <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/60">
                          {session.targetPace}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-foreground/50">
                      {session.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Event info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-secondary/20 bg-secondary/5 p-6 text-center"
        >
          <p className="text-lg font-semibold text-foreground">
            🏃‍♀️ {EVENT_NAME} - 24 de mayo de 2026
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Objetivo: 7 km recreativos. ¡Tú puedes!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
