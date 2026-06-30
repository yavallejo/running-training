"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface PlanHistory {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_level: string;
  race_distance: number;
  race_date: string;
  race_name: string;
  race_time?: string;
  race_feeling?: number;
  completed_sessions: number;
  total_sessions: number;
  created_at: string;
  is_current: boolean;
}

interface RaceResult {
  id: string;
  plan_id: string;
  race_date: string;
  race_time: string;
  race_feeling: number;
}

const FEELING_EMOJIS: Record<number, string> = {
  5: "😊",
  4: "😤",
  3: "😐",
  2: "😵",
  1: "🤢",
};

export default function HistorySection() {
  const router = useRouter();
  const [history, setHistory] = useState<PlanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    const session = getSession();
    if (!session?.userId) return;

    try {
      const { data: users } = await supabase
        .from("users")
        .select(`
          id,
          username,
          plan_id,
          race_distance,
          race_date,
          race_name,
          created_at,
          plans:plan_id (name, level)
        `)
        .eq("id", session.userId)
        .order("created_at", { ascending: false });

      if (!users || users.length === 0) {
        setLoading(false);
        return;
      }

      const { data: raceResults } = await supabase
        .from("race_results")
        .select("id, plan_id, race_date, race_time, race_feeling")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false });

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("session_id")
        .eq("user_id", session.userId)
        .eq("completed", true);

      const sessionCount = progressData?.length || 0;

      const raceResultsMap = new Map<string, RaceResult>();
      raceResults?.forEach(rr => {
        if (!raceResultsMap.has(rr.plan_id)) {
          raceResultsMap.set(rr.plan_id, rr);
        }
      });

      const historyItems: PlanHistory[] = users.map(user => {
        const raceResult = raceResultsMap.get(user.plan_id || "");
        const isExpired = user.race_date ? new Date(user.race_date) < new Date() : false;
        const estimatedTotalSessions = Math.ceil((user.race_distance || 7) * 2);

        return {
          id: user.id,
          plan_id: user.plan_id || "",
          plan_name: (user.plans as any)?.name || "Plan",
          plan_level: (user.plans as any)?.level || "beginner",
          race_distance: user.race_distance || 7,
          race_date: user.race_date || "",
          race_name: user.race_name || "Carrera",
          race_time: raceResult?.race_time,
          race_feeling: raceResult?.race_feeling,
          completed_sessions: isExpired ? Math.min(sessionCount, estimatedTotalSessions) : sessionCount,
          total_sessions: estimatedTotalSessions,
          created_at: user.created_at,
          is_current: !isExpired,
        };
      });

      setHistory(historyItems);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
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

  const currentPlan = history.find(h => h.is_current);
  const pastPlans = history.filter(h => !h.is_current);

  return (
    <div className="space-y-6">
      {currentPlan && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
            Plan Actual
          </h3>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">{currentPlan.plan_name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentPlan.race_distance}K · {currentPlan.race_name}
                </p>
              </div>
              <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-mono uppercase">
                En Progreso
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>📅 {formatDate(currentPlan.race_date)}</span>
            </div>
          </div>
        </div>
      )}

      {pastPlans.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
            Planes Anteriores ({pastPlans.length})
          </h3>
          <div className="space-y-3">
            {pastPlans.map((plan) => {
              const completionRate = getCompletionRate(plan.completed_sessions, plan.total_sessions);
              const hasResult = !!plan.race_time;

              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-surface/50 border border-border/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{plan.plan_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.race_distance}K · {plan.race_name}
                      </p>
                    </div>
                    {hasResult ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-mono">
                        {plan.race_time}
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-warning/10 text-warning text-[10px] font-mono">
                        Sin resultado
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {plan.completed_sessions} de {plan.total_sessions} sesiones
                      </span>
                      <span className="font-mono font-medium">{completionRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📅 {formatDate(plan.race_date)}</span>
                      {plan.race_feeling && (
                        <span>{FEELING_EMOJIS[plan.race_feeling]}</span>
                      )}
                    </div>

                    {completionRate < 100 && (
                      <button
                        onClick={() => router.push("/onboarding")}
                        className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                      >
                        Completar →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-muted-foreground mb-4">
            No tienes planes anteriores
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            Crear nuevo plan
          </button>
        </div>
      )}
    </div>
  );
}
