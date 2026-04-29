import { TrainingSession } from "./training-plan";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (sessions: TrainingSession[], achievements: string[]) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-run",
    name: "Primera Carrera",
    icon: "🎯",
    description: "Completaste tu primera sesión de entrenamiento",
    condition: (sessions) => sessions.some(s => s.id === "session-1" && s.completed),
  },
  {
    id: "streak-3",
    name: "Racha de 3",
    icon: "🔥",
    description: "3 sesiones completadas una tras otra",
    condition: (sessions) => {
      const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
      let streak = 0;
      for (const s of sorted) {
        if (s.completed) {
          streak++;
          if (streak >= 3) return true;
        } else {
          streak = 0;
        }
      }
      return false;
    },
  },
  {
    id: "5k-complete",
    name: "Meta 5K",
    icon: "🏃",
    description: "Completaste los 5 km de la sesión 7",
    condition: (sessions) => sessions.some(s => s.id === "session-7" && s.completed),
  },
  {
    id: "rescheduler",
    name: "Reprogramadora",
    icon: "⚡",
    description: "Usaste la reprogramación por primera vez",
    condition: (sessions) => sessions.some(s => s.rescheduled),
  },
  {
    id: "halfway",
    name: "Mitad del Camino",
    icon: "💪",
    description: "50% de las sesiones completadas",
    condition: (sessions) => {
      const completed = sessions.filter(s => s.completed).length;
      return completed >= sessions.length / 2;
    },
  },
  {
    id: "almost-there",
    name: "Casi Lista",
    icon: "🎉",
    description: "80% de las sesiones completadas",
    condition: (sessions) => {
      const completed = sessions.filter(s => s.completed).length;
      return completed >= sessions.length * 0.8;
    },
  },
  {
    id: "super-7k",
    name: "Súper 7K",
    icon: "⚡",
    description: "¡Completaste el evento de 7 km!",
    condition: (_, achievements) => achievements.includes("event-7k"),
  },
];

export function checkAchievements(
  sessions: TrainingSession[], 
  savedAchievements: string[] = []
): { newBadges: Badge[]; allBadges: Badge[] } {
  const newBadges: Badge[] = [];
  
  const allBadges = BADGES.map(badge => {
    const isUnlocked = badge.condition(sessions, savedAchievements);
    const wasUnlocked = savedAchievements.includes(badge.id);
    
    if (isUnlocked && !wasUnlocked) {
      newBadges.push(badge);
    }
    
    return {
      ...badge,
      unlocked: isUnlocked,
    };
  });

    return { newBadges, allBadges };
}

export function saveAchievements(newBadgeIds: string[]) {
  try {
    const stored = localStorage.getItem("yadira_achievements");
    const current = stored ? JSON.parse(stored) : [];
    const updated = [...new Set([...current, ...newBadgeIds])];
    localStorage.setItem("yadira_achievements", JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving achievements:', error);
    return newBadgeIds;
  }
}
