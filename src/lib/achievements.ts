import { TrainingSession } from "./training-plan";
import { supabase } from "./supabase";
import { getSession } from "./auth";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (sessions: TrainingSession[], unlockedIds: Set<string>) => boolean;
}

const computeStreak = (sessions: TrainingSession[]): number => {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  let max = 0;
  let current = 0;
  for (const s of sorted) {
    if (s.completed) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
};

const completedCount = (sessions: TrainingSession[]): number =>
  sessions.filter((s) => s.completed).length;

export const BADGES: Badge[] = [
  {
    id: "first-run",
    name: "Primera Carrera",
    icon: "🎯",
    description: "Completaste tu primera sesión de entrenamiento",
    condition: (sessions) => completedCount(sessions) >= 1,
  },
  {
    id: "streak-3",
    name: "Racha de 3",
    icon: "🔥",
    description: "3 sesiones completadas una tras otra",
    condition: (sessions) => computeStreak(sessions) >= 3,
  },
  {
    id: "streak-7",
    name: "En llamas",
    icon: "🔥🔥",
    description: "7 sesiones seguidas completadas",
    condition: (sessions) => computeStreak(sessions) >= 7,
  },
  {
    id: "5k-complete",
    name: "Meta 5K",
    icon: "🏃",
    description: "Acumulaste 5 km de distancia real",
    condition: (sessions) =>
      sessions
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + (s.actualDistance ?? s.distance), 0) >= 5,
  },
  {
    id: "10k-complete",
    name: "Doble dígito",
    icon: "🚀",
    description: "Acumulaste 10 km de distancia real",
    condition: (sessions) =>
      sessions
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + (s.actualDistance ?? s.distance), 0) >= 10,
  },
  {
    id: "rescheduler",
    name: "Reprogramadora",
    icon: "⚡",
    description: "Usaste la reprogramación por primera vez",
    condition: (sessions) => sessions.some((s) => s.rescheduled),
  },
  {
    id: "halfway",
    name: "Mitad del Camino",
    icon: "💪",
    description: "50% de las sesiones completadas",
    condition: (sessions) => {
      const total = sessions.length;
      return total > 0 && completedCount(sessions) >= total / 2;
    },
  },
  {
    id: "almost-there",
    name: "Casi Lista",
    icon: "🎉",
    description: "80% de las sesiones completadas",
    condition: (sessions) => {
      const total = sessions.length;
      return total > 0 && completedCount(sessions) >= total * 0.8;
    },
  },
  {
    id: "finish",
    name: "Meta Cumplida",
    icon: "🏆",
    description: "100% de las sesiones completadas",
    condition: (sessions) => {
      const total = sessions.length;
      return total > 0 && completedCount(sessions) === total;
    },
  },
  {
    id: "super-7k",
    name: "Súper 7K",
    icon: "⚡",
    description: "¡Completaste el evento de 7 km!",
    condition: (_, unlocked) => unlocked.has("event-7k"),
  },
];

export async function loadUnlockedAchievements(): Promise<Set<string>> {
  try {
    const session = getSession();
    if (!session?.userId) return new Set();
    const { data, error } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", session.userId);
    if (error) {
      console.error("Error loading achievements:", error);
      return new Set();
    }
    return new Set((data || []).map((r) => r.achievement_id));
  } catch (err) {
    console.error("Error:", err);
    return new Set();
  }
}

export async function persistUnlockedAchievements(
  newlyUnlockedIds: string[]
): Promise<Set<string>> {
  if (newlyUnlockedIds.length === 0) return await loadUnlockedAchievements();
  const session = getSession();
  if (!session?.userId) return new Set();

  const rows = newlyUnlockedIds.map((achievement_id) => ({
    user_id: session.userId,
    achievement_id,
  }));

  const { error } = await supabase
    .from("user_achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });

  if (error) {
    console.error("Error saving achievements:", error);
  }
  return await loadUnlockedAchievements();
}

export async function checkAndPersistAchievements(
  sessions: TrainingSession[]
): Promise<Badge[]> {
  const unlocked = await loadUnlockedAchievements();
  const newlyUnlocked: Badge[] = [];

  for (const badge of BADGES) {
    if (unlocked.has(badge.id)) continue;
    if (badge.condition(sessions, unlocked)) {
      newlyUnlocked.push(badge);
    }
  }

  if (newlyUnlocked.length > 0) {
    await persistUnlockedAchievements(newlyUnlocked.map((b) => b.id));
  }

  return newlyUnlocked;
}

export function evaluateBadges(
  sessions: TrainingSession[],
  unlockedIds: Set<string>
): Badge[] {
  return BADGES.map((badge) => ({
    ...badge,
    unlocked: unlockedIds.has(badge.id) || badge.condition(sessions, unlockedIds),
  }));
}
