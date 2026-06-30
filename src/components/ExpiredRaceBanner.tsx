"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExpiredRaceBannerProps {
  raceName: string;
  raceDate: string;
  raceDistance: number;
  completedSessions: number;
  totalSessions: number;
  onRegisterResult: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  {
    icon: "🌟",
    title: "¡Lo importante es correr!",
    subtitle: "Cada paso cuenta, no importa el tiempo",
  },
  {
    icon: "💪",
    title: "Ya diste el primer paso",
    subtitle: "Terminar es ganar",
  },
  {
    icon: "🏃",
    title: "El único rival eres tú",
    subtitle: "Comparte tu logro con el mundo",
  },
  {
    icon: "🎯",
    title: "Correr te hace mejor",
    subtitle: "Un paso a la vez",
  },
  {
    icon: "✨",
    title: "Tu próxima carrera te espera",
    subtitle: "Sigue creciendo como corredor",
  },
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}

function getDaysAgo(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const raceDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - raceDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export default function ExpiredRaceBanner({
  raceName,
  raceDate,
  raceDistance,
  completedSessions,
  totalSessions,
  onRegisterResult,
}: ExpiredRaceBannerProps) {
  const router = useRouter();
  const [message] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
  const daysAgo = getDaysAgo(raceDate);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border border-primary/20 p-5 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl shrink-0">
          {message.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-primary tracking-wide">
              {daysAgo === 0
                ? "¡Hoy es tu carrera!"
                : daysAgo === 1
                ? "¡Tu carrera fue ayer!"
                : `Tu carrera fue hace ${daysAgo} días`}
            </span>
          </div>

          <h3
            className="text-lg font-black text-foreground mb-1"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            {raceName}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">
            {formatDate(raceDate)} · {raceDistance} km · {completionRate}% del plan completado
          </p>

          <p className="text-base font-semibold text-foreground mb-4">
            {message.title}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRegisterResult}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <span>🏁</span>
              Registrar mi resultado
            </button>

            <button
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border/50 text-sm font-semibold hover:bg-background transition-all"
            >
              <span>📅</span>
              Planea nueva carrera
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
