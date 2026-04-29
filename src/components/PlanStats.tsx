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
  const nextSession = sessions.find(s => !s.completed);

  return (
    <div className="mb-4 sm:mb-6 grid gap-3 sm:grid-cols-2">
      {[
        { label: "Sesiones", value: completedCount, sub: `/ ${totalSessions}`, color: "text-primary", bg: "bg-primary/5" },
        { label: "Distancia", value: totalDistance, sub: `km / ${totalPlannedDistance} km`, color: "text-green-500", bg: "bg-green-500/5" },
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
  );
}
