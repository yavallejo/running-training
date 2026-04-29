"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrainingSession, generateTrainingPlan, EVENT_DATE, EVENT_NAME, PLAN_VERSION } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";

const STORAGE_KEY = "yadira_training_plan";
const SAVE_DEBOUNCE_MS = 500;

export default function PlanPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserName(session.name || "Yadira");
    loadPlan();
    setLoading(false);
  }, [router]);

  const loadPlan = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(`${STORAGE_KEY}_version`);
    const generated = generateTrainingPlan();
    
    if (stored && storedVersion === PLAN_VERSION) {
      try {
        const parsed = JSON.parse(stored);
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
  };

  const savePlan = useCallback((updated: TrainingSession[]) => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const timer = setTimeout(() => setSaving(false), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.map(s => 
        s.id === id ? { ...s, completed: !s.completed } : s
      );
      savePlan(updated);
      return updated;
    });
  }, [savePlan]);

  const completedCount = useMemo(() => 
    sessions.filter(s => s.completed).length
  , [sessions]);

  const totalSessions = sessions.length;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  const handleLogout = useCallback(() => {
    clearSession();
    window.location.href = "/login";
  }, []);

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

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Hola, {userName} 👋
            </h1>
            <p className="mt-1 text-sm text-foreground/50">
              {EVENT_NAME} · 24 mayo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </header>

        <div className="mb-6 rounded-xl border border-foreground/5 bg-background p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/60">Progreso</span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1.5 text-xs text-foreground/40">
            {completedCount}/{totalSessions} sesiones
            {saving && <span className="ml-2 text-green-500">· Guardado</span>}
          </p>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className={`rounded-xl border p-4 transition-colors ${
                  session.completed
                    ? "border-primary/20 bg-primary/[0.03]"
                    : "border-foreground/5 hover:border-foreground/10"
                }`}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleComplete(session.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      session.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground/20 hover:border-primary"
                    }`}
                    aria-label={session.completed ? "Marcar incompleto" : "Marcar completado"}
                  >
                    {session.completed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {session.dayLabel}
                        </p>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          {session.workout}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-medium text-secondary">
                          {session.distance} km
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-foreground/40 leading-relaxed line-clamp-3">
                      {session.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="mt-8 rounded-xl border border-foreground/5 bg-foreground/[0.02] p-4 text-center">
          <p className="text-sm font-medium text-foreground/70">
            🏃‍♀️ {EVENT_NAME}
          </p>
          <p className="mt-0.5 text-xs text-foreground/40">
            7 km recreativos · ¡Tú puedes!
          </p>
        </footer>
      </div>
    </main>
  );
}
