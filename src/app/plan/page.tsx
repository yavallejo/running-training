"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { TrainingSession, generateTrainingPlan, loadUserProgress, saveUserProgress } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";
import DatePickerModal from "@/components/DatePickerModal";
import PostWorkoutModal from "@/components/PostWorkoutModal";
import BadgeNotification from "@/components/BadgeNotification";
import CalendarView from "@/components/CalendarView";
import ShareModal from "@/components/ShareModal";
import PlanHeader from "@/components/PlanHeader";
import PlanStats from "@/components/PlanStats";
import SessionCard from "@/components/SessionCard";
import { checkBlockedSessions } from "@/lib/date-utils";
import { checkAchievements, saveAchievements } from "@/lib/achievements";
import { getTodaysMessage } from "@/lib/motivational-messages";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function PlanPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [planName, setPlanName] = useState("");
  const [raceDistance, setRaceDistance] = useState(7);
  const [raceDate, setRaceDate] = useState("2026-05-17");
  const [raceName, setRaceName] = useState("Carrera Recreativa");

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 300, height: 600 });
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showPostWorkout, setShowPostWorkout] = useState<string | null>(null);
  const [showShare, setShowShare] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<{ icon: string; name: string; description: string } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [today, setToday] = useState("");
  const [motivationalMessage, setMotivationalMessage] = useState<{ text: string; icon: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserName(session.username || "");
    setUserId(session.userId);
    setPlanName(session.planName || "");
    setRaceDistance(session.raceDistance || 7);
    setRaceDate(session.raceDate || "2026-05-17");
    setRaceName(session.raceName || "Carrera Recreativa");

    const todayStr = new Date().toISOString().split("T")[0];
    setToday(todayStr);

    loadPlan(session.planId, session.raceDistance, session.raceDate, session.userId, todayStr);
    setLoading(false);
  }, [router]);

  const loadPlan = async (planId: string, rDistance: number, rDate: string, uId: string, todayStr: string) => {
    try {
      const [sessionsData, progressMap] = await Promise.all([
        generateTrainingPlan(planId, rDistance, rDate),
        loadUserProgress(uId)
      ]);

      const sessionsWithProgress = sessionsData.map(s => {
        const progress = progressMap.get(s.id);
        if (progress) {
          return { ...s, ...progress };
        }
        return s;
      });

      const withBlocked = checkBlockedSessions(sessionsWithProgress, todayStr);
      withBlocked.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSessions(withBlocked);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const saveProgress = useCallback(async (updated: TrainingSession[]) => {
    setSaving(true);
    if (userId) {
      const promises = updated.map(s =>
        saveUserProgress(userId, s.id, {
          completed: s.completed,
          rescheduled: s.rescheduled,
          rescheduledTo: (s as any).rescheduledTo,
          actualTime: s.actualTime,
          actualPace: s.actualPace,
          feeling: s.feeling,
          notes: s.notes
        })
      );
      await Promise.all(promises);
    }
    setTimeout(() => setSaving(false), 500);
  }, [userId]);

  const toggleComplete = useCallback((id: string) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === id);
      const willComplete = !session?.completed;

      if (willComplete) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        setShowPostWorkout(id);
      }

      const updated = prev.map(s =>
        s.id === id ? { ...s, completed: !s.completed } : s
      );

      if (willComplete) {
        const stored = localStorage.getItem("runplan-pro_achievements");
        const currentAchievements = stored ? JSON.parse(stored) : [];
        const { newBadges } = checkAchievements(updated, currentAchievements);

        if (newBadges.length > 0) {
          saveAchievements(newBadges.map(b => b.id));
          const badge = newBadges[0];
          setNewBadge({
            icon: badge.icon,
            name: badge.name,
            description: badge.description,
          });
        }
      }

      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  const handlePostWorkoutSave = useCallback((id: string, data: {
    actualTime: string;
    actualPace: string;
    feeling: number;
    notes: string;
  }) => {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, ...data } : s
      );
      saveProgress(updated);
      return updated;
    });
    setShowPostWorkout(null);
  }, [saveProgress]);

  const getCardState = useCallback((session: TrainingSession): string => {
    if (session.completed && session.rescheduled) return 'rescheduled-completed';
    if (session.completed) return 'completed';
    if (session.blocked) return 'blocked';
    if (session.rescheduled) return 'rescheduled';
    if (session.date === today) return 'today';

    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const sessionDate = parseLocalDate(session.date);
    const todayDate = parseLocalDate(today);

    if (sessionDate < todayDate && !session.rescheduleUsed) return 'missed';
    if (sessionDate < todayDate && session.rescheduleUsed) return 'blocked';

    return 'normal';
  }, [today]);

  const handleReschedule = useCallback((id: string, newDate: Date) => {
    const dateStr = newDate.toISOString().split("T")[0];

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            originalDate: s.date,
            date: dateStr,
            rescheduled: true,
            rescheduleUsed: true,
          };
        }
        return s;
      });

      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      saveProgress(updated);
      return updated;
    });
    setShowDatePicker(null);
  }, [saveProgress]);

  useEffect(() => {
    if (sessions.length > 0) {
      const todaySession = sessions.find(s => s.date === today);
      const sessionNumber = todaySession ? todaySession.sessionOrder : 0;
      const completedCount = sessions.filter(s => s.completed).length;
      const message = getTodaysMessage(sessionNumber, sessions.length, completedCount);
      setMotivationalMessage(message);
    }
  }, [sessions, today]);

  const handleLogout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    );
  }

  const completedCount = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8 relative">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}

      <BadgeNotification
        badge={newBadge}
        onClose={() => setNewBadge(null)}
      />

      <div className="mx-auto max-w-2xl">
        <PlanHeader
          userName={userName}
          sessions={sessions}
          completedCount={completedCount}
          motivacionalMessage={motivationalMessage}
          raceDistance={raceDistance}
          raceDate={raceDate}
          raceName={raceName}
        />

        <div className="flex justify-end">
          <button
            onClick={() => setViewMode(prev => prev === 'list' ? 'calendar' : 'list')}
            className="text-xs px-3 py-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors"
          >
            {viewMode === 'list' ? '📅 Calendario' : '📋 Lista'}
          </button>
        </div>

        {viewMode === 'calendar' && (
          <CalendarView
            sessions={sessions}
            onSessionClick={(id) => {
              const element = document.getElementById(id);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {viewMode === 'list' && (
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {sessions.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  state={getCardState(session)}
                  onToggleComplete={() => toggleComplete(session.id)}
                  onShowDatePicker={() => setShowDatePicker(session.id)}
                  onReschedule={(id, date) => handleReschedule(id, date)}
                  onShowPostWorkout={() => setShowPostWorkout(session.id)}
                  onShowShare={() => setShowShare(session.id)}
                  showDatePickerId={showDatePicker}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={() => setShowShare('plan')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-sm text-primary"
          >
            📤 Compartir Progreso Completo
          </button>
        </div>

        <div className="mt-6 sm:mt-8">
          <PlanStats sessions={sessions} completedCount={completedCount} />
        </div>

        <footer className="mt-6 sm:mt-8 rounded-xl border border-foreground/5 bg-foreground/[0.02] p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-foreground/70">
            🏃‍♀️ {raceName} - Plan: {planName}
          </p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-foreground/40">
            {raceDistance} km recreativos · ¡Tú puedes!
          </p>
        </footer>
      </div>

      {showDatePicker && (
        <DatePickerModal
          sessionId={showDatePicker}
          sessions={sessions}
          onConfirm={(id: string, date: Date) => handleReschedule(id, date)}
          onCancel={() => setShowDatePicker(null)}
        />
      )}

      {showPostWorkout && (
        <PostWorkoutModal
          session={sessions.find(s => s.id === showPostWorkout)!}
          onSave={(data) => handlePostWorkoutSave(showPostWorkout, data)}
          onClose={() => setShowPostWorkout(null)}
        />
      )}

      {showShare === 'plan' && (
        <ShareModal
          planProgress={{
            completed: completedCount,
            total: totalSessions,
            distance: sessions.filter(s => s.completed).reduce((sum, s) => sum + s.distance, 0),
            totalDistance: sessions.reduce((sum, s) => sum + s.distance, 0)
          }}
          onClose={() => setShowShare(null)}
        />
      )}

      {showShare && showShare !== 'plan' && (
        <ShareModal
          session={sessions.find(s => s.id === showShare)}
          planProgress={{
            completed: completedCount,
            total: totalSessions,
            distance: sessions.filter(s => s.completed).reduce((sum, s) => sum + s.distance, 0),
            totalDistance: sessions.reduce((sum, s) => sum + s.distance, 0)
          }}
          onClose={() => setShowShare(null)}
        />
      )}
    </main>
  );
}
