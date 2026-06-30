"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface RankingUser {
  id: string;
  username: string;
  race_distance: number;
  race_date: string;
  race_name: string;
  is_public_profile: boolean;
  achievementCount: number;
  bestRaceTime: number | null;
  totalKm: number;
}

type SortBy = "achievements" | "distance" | "pace";

function parseTimeToSeconds(time: string): number | null {
  const match = time.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3], 10);
  return h * 3600 + m * 60 + s;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RankingsPage() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("achievements");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterDistance, setFilterDistance] = useState<number | "all">("all");

  const loadRankings = useCallback(async () => {
    try {
      const { data: publicUsers, error: usersError } = await supabase
        .from("users")
        .select("id, username, race_distance, race_date, race_name, is_public_profile")
        .eq("is_public_profile", true)
        .order("username", { ascending: true });

      if (usersError) {
        console.error("Error loading users:", usersError);
        setLoading(false);
        return;
      }

      if (!publicUsers || publicUsers.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = publicUsers.map((u) => u.id);

      const [achievementsRes, resultsRes, progressRes] = await Promise.all([
        supabase
          .from("user_achievements")
          .select("user_id, achievement_id")
          .in("user_id", userIds),
        supabase
          .from("race_results")
          .select("user_id, race_time")
          .in("user_id", userIds)
          .not("race_time", "is", null),
        supabase
          .from("user_progress")
          .select("user_id, actual_distance, completed")
          .in("user_id", userIds)
          .eq("completed", true),
      ]);

      const achievementCounts: Record<string, number> = {};
      achievementsRes.data?.forEach((a) => {
        achievementCounts[a.user_id] = (achievementCounts[a.user_id] || 0) + 1;
      });

      const bestTimes: Record<string, number> = {};
      resultsRes.data?.forEach((r) => {
        const seconds = parseTimeToSeconds(r.race_time);
        if (seconds !== null) {
          if (!bestTimes[r.user_id] || seconds < bestTimes[r.user_id]) {
            bestTimes[r.user_id] = seconds;
          }
        }
      });

      const totals: Record<string, number> = {};
      progressRes.data?.forEach((p) => {
        if (p.actual_distance) {
          totals[p.user_id] = (totals[p.user_id] || 0) + p.actual_distance;
        }
      });

      const ranked: RankingUser[] = publicUsers.map((u) => ({
        id: u.id,
        username: u.username,
        race_distance: u.race_distance || 7,
        race_date: u.race_date || "",
        race_name: u.race_name || "Carrera",
        is_public_profile: true,
        achievementCount: achievementCounts[u.id] || 0,
        bestRaceTime: bestTimes[u.id] ?? null,
        totalKm: totals[u.id] || 0,
      }));

      setUsers(ranked);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (session?.userId) {
      setCurrentUserId(session.userId);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sort = params.get("sort");
      if (sort === "distance" || sort === "pace" || sort === "achievements") {
        setSortBy(sort);
      }
      const dist = params.get("distance");
      if (dist && dist !== "all") {
        const parsed = parseInt(dist, 10);
        if (!isNaN(parsed)) setFilterDistance(parsed);
      }
    }

    loadRankings();
  }, [loadRankings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (sortBy !== "achievements") params.set("sort", sortBy);
    if (filterDistance !== "all") params.set("distance", String(filterDistance));
    const qs = params.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [sortBy, filterDistance]);

  const sortedUsers = useMemo(() => {
    let filtered = users;
    if (filterDistance !== "all") {
      filtered = users.filter((u) => u.race_distance === filterDistance);
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "achievements") {
        return b.achievementCount - a.achievementCount;
      }
      if (sortBy === "distance") {
        return b.totalKm - a.totalKm;
      }
      if (sortBy === "pace") {
        if (a.bestRaceTime === null && b.bestRaceTime === null) return 0;
        if (a.bestRaceTime === null) return 1;
        if (b.bestRaceTime === null) return -1;
        return a.bestRaceTime - b.bestRaceTime;
      }
      return 0;
    });
    return sorted;
  }, [users, sortBy, filterDistance]);

  const distances = useMemo(() => {
    const set = new Set(users.map((u) => u.race_distance));
    return Array.from(set).sort((a, b) => a - b);
  }, [users]);

  return (
    <main className="flex-1 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                Rankings
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Corredores que comparten su progreso
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        {users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 space-y-3"
          >
            <div
              className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border/30"
              role="tablist"
              aria-label="Ordenar por"
            >
              {[
                { value: "achievements" as const, label: "Trofeos", icon: "🏆" },
                { value: "distance" as const, label: "Km", icon: "📏" },
                { value: "pace" as const, label: "Tiempo", icon: "⏱️" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  role="tab"
                  aria-selected={sortBy === opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    sortBy === opt.value
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span aria-hidden="true">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {distances.length > 1 && (
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtrar por distancia">
                <button
                  aria-pressed={filterDistance === "all"}
                  onClick={() => setFilterDistance("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    filterDistance === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/30"
                  }`}
                >
                  Todas
                </button>
                {distances.map((d) => (
                  <button
                    key={d}
                    aria-pressed={filterDistance === d}
                    onClick={() => setFilterDistance(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      filterDistance === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/30"
                    }`}
                  >
                    {d}K
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-surface/80 border border-border/50 text-center"
          >
            <div className="text-5xl mb-4">🏃</div>
            <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
              Aún no hay corredores públicos
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sé el primero en compartir tu progreso con la comunidad.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 transition-all"
            >
              Activar perfil público
            </Link>
          </motion.div>
        ) : sortedUsers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface/80 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              No hay corredores en esta categoría todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedUsers.map((user, index) => {
              const isCurrentUser = user.id === currentUserId;
              const rank = index + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? "bg-primary/10 border-primary/30"
                      : rank <= 3
                      ? "bg-surface border-border/50"
                      : "bg-surface/60 border-border/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-center shrink-0">
                      {medal ? (
                        <span className="text-xl">{medal}</span>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground font-mono">
                          #{rank}
                        </span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-white" style={{ fontFamily: "var(--font-urbanist)" }}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate" style={{ fontFamily: "var(--font-urbanist)" }}>
                          {user.username}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-[10px] font-mono text-primary">(tú)</span>
                          )}
                        </p>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground shrink-0">
                          {user.race_distance}K
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground font-mono">
                        <span>🏆 {user.achievementCount}</span>
                        <span>📏 {user.totalKm.toFixed(0)}km</span>
                        {user.bestRaceTime !== null && (
                          <span>⏱️ {formatTime(user.bestRaceTime)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && users.length > 0 && currentUserId && !users.find((u) => u.id === currentUserId) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              ¿Quieres aparecer en el ranking?
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 transition-all"
            >
              Activar perfil público
            </Link>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
