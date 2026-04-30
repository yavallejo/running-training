"use client";

import { motion } from "framer-motion";
import { TrainingSession } from "@/lib/training-plan";

interface PlanStatsProps {
  sessions: TrainingSession[];
  completedCount: number;
}

export default function PlanStats({ sessions, completedCount }: PlanStatsProps) {
  const totalSessions = sessions.length;
  const totalDistance = sessions.filter(s => s.completed).reduce((sum, s) => sum + s.distance, 0);
  const totalPlannedDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-syne)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Tu Progreso
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-surface-elevated border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Sesiones</span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
            {completedCount}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ {totalSessions}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-surface-elevated border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Distancia</span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
            {totalDistance.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-surface-elevated border border-border p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium">Tasa de completion</span>
          <span className="text-sm font-bold text-primary" style={{ fontFamily: "var(--font-syne)" }}>{completionRate}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{totalPlannedDistance} km planeados</span>
          <span>{(totalPlannedDistance - totalDistance).toFixed(1)} km restantes</span>
        </div>
      </motion.div>
    </div>
  );
}