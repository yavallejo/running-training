"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { TrainingSession, generateTrainingPlan, EVENT_DATE, EVENT_NAME, PLAN_VERSION } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";
import DatePickerModal from "@/components/DatePickerModal";
import { parseLocalDate, getLocalDateString, formatDayLabel, checkBlockedSessions } from "@/lib/date-utils";

const STORAGE_KEY = "yadira_training_plan";
const SAVE_DEBOUNCE_MS = 500;

export default function PlanPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  
  // New states for features
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 300, height: 600 });
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserName(session.name || "Yadira");
    
    const todayStr = getLocalDateString(new Date());
    setToday(todayStr);
    
    loadPlan(todayStr);
    setLoading(false);
  }, [router]);

  const loadPlan = (todayStr: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(`${STORAGE_KEY}_version`);
    const generated = generateTrainingPlan();
    
    let sessionsData: TrainingSession[];
    if (stored && storedVersion === PLAN_VERSION) {
      try {
        const parsed = JSON.parse(stored);
        sessionsData = generated.map((gen) => {
          const saved = parsed.find((s: TrainingSession) => s.id === gen.id);
          return saved ? { ...gen, ...saved, completed: saved.completed ?? false } : gen;
        });
      } catch {
        sessionsData = generated;
      }
    } else {
      sessionsData = generated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      localStorage.setItem(`${STORAGE_KEY}_version`, PLAN_VERSION);
    }

    // Check for blocked sessions
    sessionsData = checkBlockedSessions(sessionsData, todayStr);
    
    // Sort by date
    sessionsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setSessions(sessionsData);
  };

  const savePlan = useCallback((updated: TrainingSession[]) => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTimeout(() => setSaving(false), SAVE_DEBOUNCE_MS);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === id);
      const willComplete = !session?.completed;
      
      if (willComplete) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      
      const updated = prev.map(s => 
        s.id === id ? { ...s, completed: !s.completed } : s
      );
      savePlan(updated);
      return updated;
    });
  }, [savePlan]);

  const getCardState = useCallback((session: TrainingSession): string => {
    if (session.completed && session.rescheduled) return 'rescheduled-completed';
    if (session.completed) return 'completed';
    if (session.blocked) return 'blocked';
    if (session.rescheduled) return 'rescheduled';
    
    // Compare dates directly as strings (both are YYYY-MM-DD)
    if (session.date === today) return 'today';
    
    // For missed/blocked, parse dates manually to avoid UTC issues
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    };
    
    const sessionDate = parseLocalDate(session.date);
    const todayDate = parseLocalDate(today);
    
    if (sessionDate < todayDate && !session.rescheduleUsed) return 'missed';
    if (sessionDate < todayDate && session.rescheduleUsed) return 'blocked';
    
    return 'normal';
  }, [today]);

  const handleReschedule = useCallback((id: string, newDate: Date) => {
    const dateStr = newDate.toISOString().split("T")[0];
    
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            originalDate: s.date,
            date: dateStr,
            dayLabel: formatDayLabel(dateStr),
            rescheduled: true,
            rescheduleUsed: true,
          };
        }
        return s;
      });
      
      // Re-sort by date
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      savePlan(updated);
      return updated;
    });
    setShowDatePicker(null);
  }, [savePlan]);

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

  const completedCount = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8 relative">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}
      
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Hola, {userName} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-foreground/50">
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

        <div className="mb-4 sm:mb-6 rounded-xl border border-foreground/5 bg-background p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-foreground/60">Progreso</span>
            <span className="text-xs sm:text-sm font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1.5 text-[10px] sm:text-xs text-foreground/40">
            {completedCount}/{totalSessions} sesiones
            {saving && <span className="ml-2 text-green-500">· Guardado</span>}
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {sessions.map((session, index) => {
              const state = getCardState(session);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className={`rounded-xl border p-3 sm:p-4 transition-colors relative overflow-hidden ${
                    state === 'today' 
                      ? 'border-primary/50 shadow-lg shadow-primary/20 bg-primary/[0.05]'
                      : state === 'completed'
                      ? 'border-primary/30 bg-primary/5'
                      : state === 'rescheduled-completed'
                      ? 'border-green-500/30 bg-green-500/5'
                      : state === 'rescheduled'
                      ? 'border-secondary/50 bg-secondary/5 shadow-md shadow-secondary/10'
                      : state === 'missed'
                      ? 'border-dashed border-foreground/10 bg-foreground/[0.02] opacity-60'
                      : state === 'blocked'
                      ? 'border-red-500/30 bg-red-500/[0.03] opacity-50 cursor-not-allowed'
                      : 'border-foreground/5 hover:border-foreground/10'
                  }`}
                >
                  {/* State badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {state === 'today' && (
                      <motion.span 
                        animate={{ scale: [1, 1.01, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"
                      >
                        HOY
                      </motion.span>
                    )}
                    {state === 'missed' && (
                      <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-medium">
                        PERDIDO
                      </span>
                    )}
                    {state === 'rescheduled' && (
                      <motion.span 
                        animate={{ scale: [1, 1.01, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-medium"
                      >
                        ⚡ REPROGRAMADA - ¡DEBE HACERSE!
                      </motion.span>
                    )}
                    {state === 'blocked' && (
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-medium">
                        🔴 BLOQUEADA
                      </span>
                    )}
                    {state === 'rescheduled-completed' && (
                      <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-medium">
                        ✓ REPROGRAMADA Y COMPLETADA
                      </span>
                    )}
                    <span className={`text-xs sm:text-sm font-medium text-foreground ${
                      state === 'missed' ? 'line-through text-foreground/40' : ''
                    }`}>
                      {session.dayLabel}
                      {session.originalDate && (
                        <span className="ml-2 text-[10px] sm:text-xs text-foreground/40">
                          (Original: {session.originalDate})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => toggleComplete(session.id)}
                      disabled={state === 'blocked'}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        session.completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-foreground/20 hover:border-primary"
                      } ${state === 'blocked' ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                          <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5">
                            {session.workout}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1 sm:gap-1.5">
                          <span className="rounded-full bg-secondary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-secondary">
                            {session.distance} km
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-foreground/40 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {session.details}
                      </p>

                      {/* Missed state message */}
                      {state === 'missed' && (
                        <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-orange-500/70">
                          😢 No completado - ¡Ánimo, sigue adelante!
                        </p>
                      )}

                      {/* Blocked state message */}
                      {state === 'blocked' && (
                        <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-red-500/70">
                          No completada después de reprogramar
                        </p>
                      )}

                      {/* Reschedule button for missed sessions */}
                      {state === 'missed' && !session.rescheduleUsed && (
                        <button 
                          onClick={() => setShowDatePicker(session.id)} 
                          className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-secondary hover:text-secondary/80 underline"
                        >
                          ⚡ Reprogramar (1 vez)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DatePicker modal */}
                  {showDatePicker === session.id && (
                    <DatePickerModal
                      sessionId={session.id}
                      sessions={sessions}
                      onConfirm={handleReschedule}
                      onCancel={() => setShowDatePicker(null)}
                    />
                  )}

                  {/* Effect for rescheduled-completed */}
                  {state === 'rescheduled-completed' && (
                    <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-green-500/5 rounded-bl-full" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <footer className="mt-6 sm:mt-8 rounded-xl border border-foreground/5 bg-foreground/[0.02] p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-foreground/70">
            🏃‍♀️ {EVENT_NAME}
          </p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-foreground/40">
            7 km recreativos · ¡Tú puedes!
          </p>
        </footer>
      </div>
    </main>
  );
}
