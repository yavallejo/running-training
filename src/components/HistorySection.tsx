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
    if (!session?.userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: plans, error: plansError } = await supabase
        .from("user_plans")
        .select("id, plan_id, plan_name, plan_level, race_distance, race_date, race_name, total_sessions, is_active, created_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false });

      if (plansError) {
        console.error("Error loading plans:", plansError);
        setLoading(false);
        return;
      }

      if (!plans || plans.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const planIds = plans.map((p) => p.id);

      const [resultsRes, progressRes] = await Promise.all([
        supabase
          .from("race_results")
          .select("id, plan_id, race_date, race_time, race_feeling")
          .in("plan_id", planIds),
        supabase
          .from("user_progress")
          .select("session_id, plan_id")
          .eq("user_id", session.userId)
          .eq("completed", true)
          .in("plan_id", planIds),
      ]);

      const raceResultsByPlan = new Map<string, RaceResult>();
      resultsRes.data?.forEach((r) => {
        if (!raceResultsByPlan.has(r.plan_id)) {
          raceResultsByPlan.set(r.plan_id, r as RaceResult);
        }
      });

      const sessionCountByPlan = new Map<string, number>();
      progressRes.data?.forEach((p) => {
        if (!p.plan_id) return;
        sessionCountByPlan.set(p.plan_id, (sessionCountByPlan.get(p.plan_id) || 0) + 1);
      });

      const historyItems: PlanHistory[] = plans.map((p) => {
        const raceResult = raceResultsByPlan.get(p.id);
        return {
          id: p.id,
          plan_id: p.plan_id,
          plan_name: p.plan_name || "Plan",
          plan_level: p.plan_level || "beginner",
          race_distance: p.race_distance || 7,
          race_date: p.race_date || "",
          race_name: p.race_name || "Carrera",
          race_time: raceResult?.race_time,
          race_feeling: raceResult?.race_feeling,
          completed_sessions: sessionCountByPlan.get(p.id) || 0,
          total_sessions: p.total_sessions || 0,
          is_current: p.is_active,
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
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="sr-only">Cargando historial…</span>
      </div>
    );
  }

  const currentPlan = history.find((h) => h.is_current);
  const pastPlans = history.filter((h) => !h.is_current);

  return (
    <div className="space-y-6">
      {currentPlan && (
        <section aria-labelledby="current-plan-heading">
          <h3 id="current-plan-heading" className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
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
              {currentPlan.total_sessions > 0 && (
                <span>· {currentPlan.completed_sessions}/{currentPlan.total_sessions} sesiones</span>
              )}
            </div>
          </div>
        </section>
      )}

      {pastPlans.length > 0 && (
        <section aria-labelledby="past-plans-heading">
          <h3 id="past-plans-heading" className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
            Planes Anteriores ({pastPlans.length})
          </h3>
          <div className="space-y-3">
            {pastPlans.map((plan) => {
              const completionRate = getCompletionRate(plan.completed_sessions, plan.total_sessions);
              const hasResult = !!plan.race_time;

              return (
                <article
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

                  {plan.total_sessions > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {plan.completed_sessions} de {plan.total_sessions} sesiones
                        </span>
                        <span className="font-mono font-medium">{completionRate}%</span>
                      </div>
                      <div
                        className="h-1.5 rounded-full bg-border/30 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={completionRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📅 {formatDate(plan.race_date)}</span>
                      {plan.race_feeling && (
                        <span aria-label={`Sensación: ${plan.race_feeling}/5`}>
                          {FEELING_EMOJIS[plan.race_feeling]}
                        </span>
                      )}
                    </div>

                    {completionRate < 100 && plan.total_sessions > 0 && (
                      <button
                        onClick={() => router.push("/onboarding")}
                        className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                      >
                        Nuevo plan →
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {history.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-muted-foreground mb-4">
            No tienes planes anteriores
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          >
            Crear nuevo plan
          </button>
        </div>
      )}
    </div>
  );
}
