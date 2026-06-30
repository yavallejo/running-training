"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrainingSession } from "@/lib/training-plan";

const ICON_BG = {
  primary: "bg-primary/10",
  secondary: "bg-secondary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
} as const;

const ICON_COLOR = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  muted: "text-muted-foreground",
} as const;

type IconBg = keyof typeof ICON_BG;
type IconColor = keyof typeof ICON_COLOR;

export interface StatCardProps {
  icon: React.ReactNode;
  iconBg?: IconBg;
  iconColor?: IconColor;
  label: string;
  value: string | number;
  unit?: string;
  ariaLabel: string;
  delay: number;
}

export function useFadeUp(delay: number) {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay },
      };
}

export function StatCard({
  icon,
  iconBg = "primary",
  iconColor = "primary",
  label,
  value,
  unit,
  ariaLabel,
  delay,
}: StatCardProps) {
  const motionProps = useFadeUp(delay);

  return (
    <motion.div
      {...motionProps}
      className="rounded-xl bg-surface-elevated border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${ICON_BG[iconBg]} flex items-center justify-center`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${ICON_COLOR[iconColor]}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            {icon}
          </svg>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground font-urbanist">
        {value}
        {unit && (
          <span className="text-sm font-normal text-muted-foreground ml-1" aria-hidden="true">
            {unit}
          </span>
        )}
        <span className="sr-only">. {ariaLabel}</span>
      </p>
    </motion.div>
  );
}

export default function PlanStats({
  sessions,
  completedCount: completedCountProp,
}: {
  sessions: TrainingSession[];
  completedCount?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.completed);
    const dist = completed.reduce((sum, s) => sum + (s.actualDistance ?? s.distance), 0);
    const planned = sessions.reduce((sum, s) => sum + s.distance, 0);
    const count = completedCountProp ?? completed.length;
    const rawRate = total > 0 ? Math.round((count / total) * 100) : 0;
    const rate = Math.min(100, Math.max(0, rawRate));
    return {
      totalSessions: total,
      totalDistance: dist,
      totalPlannedDistance: planned,
      completedCount: count,
      completionRate: rate,
      remainingDistance: Math.max(0, planned - dist),
      isOverPlanned: total > 0 && dist > planned,
    };
  }, [sessions, completedCountProp]);

  const headerProps = useFadeUp(0);
  const progressProps = useFadeUp(0.2);

  if (stats.totalSessions === 0) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground font-urbanist">Tu Progreso</h3>
        <p className="text-xs text-muted-foreground mt-2">Aún no hay sesiones en este plan.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <motion.h3
        {...headerProps}
        className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2 font-urbanist"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        Tu Progreso
      </motion.h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          iconBg="primary"
          iconColor="primary"
          label="Sesiones"
          value={stats.completedCount}
          unit={`/ ${stats.totalSessions}`}
          ariaLabel={`${stats.completedCount} de ${stats.totalSessions} sesiones completadas`}
          delay={0.1}
        />
        <StatCard
          icon={
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </>
          }
          iconBg="secondary"
          iconColor="secondary"
          label="Distancia"
          value={stats.totalDistance.toFixed(1)}
          unit="km"
          ariaLabel={`${stats.totalDistance.toFixed(1)} kilómetros completados`}
          delay={0.15}
        />
      </div>

      <motion.div
        {...progressProps}
        className="rounded-xl bg-surface-elevated border border-border p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium" id="progress-label">
            Progreso del plan
          </span>
          <span className="text-sm font-bold text-primary font-urbanist" aria-hidden="true">
            {stats.completionRate}%
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full bg-surface overflow-hidden"
          role="progressbar"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${stats.completionRate} por ciento${stats.isOverPlanned ? ", meta superada" : ""}`}
          aria-labelledby="progress-label"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{stats.totalPlannedDistance.toFixed(1)} km planeados</span>
          <span className="flex items-center gap-1">
            {stats.isOverPlanned ? (
              <span className="font-semibold text-success px-1.5 py-0.5 rounded bg-success/10 border border-success/30">
                <span aria-hidden="true">🎉</span> Meta superada
              </span>
            ) : (
              <span aria-hidden="true">{stats.remainingDistance.toFixed(1)} km restantes</span>
            )}
          </span>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {stats.isOverPlanned
            ? "Meta superada. Has corrido más de lo planeado."
            : `${Math.round(stats.remainingDistance)} kilómetros restantes`}
        </div>
      </motion.div>
    </div>
  );
}
