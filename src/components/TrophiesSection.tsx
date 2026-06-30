"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { evaluateBadges } from "@/lib/achievements";
import type { TrainingSession } from "@/lib/training-plan";

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export default function TrophiesSection() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const session = getSession();
        if (!session?.userId) {
          setLoading(false);
          return;
        }

        const [userAchRes, progressRes] = await Promise.all([
          supabase
            .from("user_achievements")
            .select("achievement_id, unlocked_at")
            .eq("user_id", session.userId),
          supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", session.userId),
        ]);

        if (userAchRes.data) {
          setUserAchievements(userAchRes.data);
        }
        if (progressRes.data) {
          const map = new Map(progressRes.data.map((p) => [p.session_id, p]));
          setSessions(
            Array.from(map.entries()).map(([id, p]) => ({
              id,
              sessionOrder: 0,
              date: "",
              dayLabel: "",
              workout: "",
              workoutType: "easy" as const,
              details: "",
              distance: 0,
              targetPace: "",
              completed: !!p.completed,
              rescheduled: !!p.rescheduled,
              rescheduleUsed: false,
              blocked: false,
              actualDistance: p.actual_distance ?? undefined,
              actualTime: p.actual_time ?? undefined,
              actualPace: p.actual_pace ?? undefined,
              feeling: p.feeling ?? undefined,
              notes: p.notes ?? undefined,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const unlockedSet = new Set(userAchievements.map((ua) => ua.achievement_id));
  const badges = evaluateBadges(sessions, unlockedSet);

  const getUnlockedDate = (achievementId: string) => {
    const ua = userAchievements.find((u) => u.achievement_id === achievementId);
    if (!ua) return null;
    return new Date(ua.unlocked_at).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="sr-only">Cargando logros…</span>
      </div>
    );
  }

  const unlockedCount = unlockedSet.size;
  const totalCount = badges.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <div>
            <p className="text-lg font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
              {unlockedCount} / {totalCount}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              Logros desbloqueados
            </p>
          </div>
        </div>
        {unlockedCount === totalCount && totalCount > 0 && (
          <div className="px-3 py-1 rounded-lg bg-warning/20 text-warning text-xs font-mono">
            ¡Completo!
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, index) => {
          const unlocked = unlockedSet.has(badge.id) || (badge as { unlocked?: boolean }).unlocked;
          const unlockedDate = getUnlockedDate(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-2xl border text-center transition-all ${
                unlocked
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
                  : "bg-surface/50 border-border/30 opacity-50"
              }`}
            >
              <div className={`text-3xl mb-2 ${!unlocked && "grayscale"}`}>
                {badge.icon}
              </div>
              <p className={`text-xs font-semibold mb-1 ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {badge.description}
              </p>
              {unlocked && unlockedDate && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {!unlocked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {unlockedCount === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm text-muted-foreground">
            Completa sesiones para desbloquear logros
          </p>
        </div>
      )}
    </div>
  );
}
