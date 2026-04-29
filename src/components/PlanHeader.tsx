"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import WellnessTracker from "./WellnessTracker";
import WeightEffortTracker from "./WeightEffortTracker";
import { TrainingSession } from "@/lib/training-plan";

interface PlanHeaderProps {
  userName: string;
  sessions: TrainingSession[];
  completedCount: number;
  motivacionalMessage: { text: string; icon: string } | null;
}

export default function PlanHeader({ userName, sessions, completedCount, motivacionalMessage }: PlanHeaderProps) {
  const totalSessions = sessions.length;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  const router = useRouter();

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('runplan-pro_session');
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <header className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Hola, {userName} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-foreground/50">
            Carrera Recreativa 7km · 17 mayo
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Countdown Timer */}
      <div className="mb-4 sm:mb-6">
        <CountdownTimer />
      </div>

      {/* Motivational Message */}
      {motivacionalMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 flex items-start gap-2.5"
        >
          <span className="text-xl flex-shrink-0">{motivacionalMessage.icon}</span>
          <div>
            <p className="text-[11px] sm:text-xs text-foreground/70 leading-relaxed">
              {motivacionalMessage.text}
            </p>
          </div>
        </motion.div>
      )}

      {/* Wellness Tracker */}
      <div className="mb-4 sm:mb-6">
        <WellnessTracker />
      </div>

      {/* Weight & Effort Tracker */}
      <div className="mb-4 sm:mb-6">
        <WeightEffortTracker />
      </div>

      {/* Progress Bar */}
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
        </p>
      </div>
    </>
  );
}
