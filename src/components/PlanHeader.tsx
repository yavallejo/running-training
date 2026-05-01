"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import WellnessTracker from "./WellnessTracker";
import WeightEffortTracker from "./WeightEffortTracker";
import { TrainingSession } from "@/lib/training-plan";
import { clearSession } from "@/lib/auth";

interface PlanHeaderProps {
  userName: string;
  sessions: TrainingSession[];
  completedCount: number;
  motivacionalMessage: { text: string; icon: string } | null;
  raceDistance?: number;
  raceDate?: string;
  raceName?: string;
}

export default function PlanHeader({ userName, sessions, completedCount, motivacionalMessage, raceDistance = 7, raceDate = "2026-05-17", raceName = "Carrera Recreativa" }: PlanHeaderProps) {
  const totalSessions = sessions.length;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const router = useRouter();

  const handleLogout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  const formattedRaceDate = raceDate ? new Date(raceDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '17 may';

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="var(--surface)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
                {progress}%
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
              ¡Hola, {userName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {completedCount}/{totalSessions} sesiones completadas
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-surface self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Salir
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-surface border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Distancia</span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
            {raceDistance}<span className="text-sm text-muted-foreground font-normal ml-1">km</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{raceName}</p>
</motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-primary/10 via-surface to-surface border border-primary/20 p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">
            {motivacionalMessage?.icon || "🔥"}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {motivacionalMessage?.text || "Cada paso cuenta. ¡Sigue así!"}
          </p>
        </div>
      </motion.div>

    </>
  );
}