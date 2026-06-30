"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export default function TrophiesSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const session = getSession();
        if (!session?.userId) {
          setLoading(false);
          return;
        }

        const [achievementsRes, userAchRes] = await Promise.all([
          supabase.from("achievements").select("*").order("requirement_value", { ascending: true }),
          supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", session.userId)
        ]);

        if (achievementsRes.data) {
          setAchievements(achievementsRes.data);
        }
        if (userAchRes.data) {
          setUserAchievements(userAchRes.data);
        }
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const ua = userAchievements.find(ua => ua.achievement_id === achievementId);
    if (!ua) return null;
    return new Date(ua.unlocked_at).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

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
        {achievements.map((achievement, index) => {
          const unlocked = isUnlocked(achievement.id);
          const unlockedDate = getUnlockedDate(achievement.id);

          return (
            <motion.div
              key={achievement.id}
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
                {achievement.icon}
              </div>
              <p className={`text-xs font-semibold mb-1 ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {achievement.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {achievement.description}
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
