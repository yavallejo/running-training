"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface UserProfile {
  id: string;
  username: string;
  race_distance: number;
  race_date: string;
  race_name: string;
  start_date: string;
  experience_level: string;
  current_weekly_km: number;
  available_days_per_week: number;
  minutes_per_session: number;
  has_injuries: boolean;
  injury_description: string;
}

const TIME_RUNNING_OPTIONS = [
  { value: "never", label: "Nunca he corrido" },
  { value: "less-3-months", label: "Menos de 3 meses" },
  { value: "3-6-months", label: "3 a 6 meses" },
  { value: "6-12-months", label: "6 a 12 meses" },
  { value: "more-1-year", label: "Más de 1 año" },
];

const DISTANCES = [
  { value: 3, label: "3K" },
  { value: 5, label: "5K" },
  { value: 7, label: "7K" },
  { value: 10, label: "10K" },
  { value: 15, label: "15K" },
  { value: 21, label: "21K" },
  { value: 42, label: "42K" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(`
          id,
          username,
          race_distance,
          race_date,
          race_name,
          start_date,
          user_profiles (
            experience_level,
            current_weekly_km,
            available_days_per_week,
            minutes_per_session,
            has_injuries,
            injury_description
          )
        `)
        .eq("id", session.userId)
        .single();

      if (userError || !user) {
        console.error("Error loading profile:", userError);
        setLoading(false);
        return;
      }

      const profileData = user.user_profiles?.[0] || {};

      setProfile({
        id: user.id,
        username: user.username,
        race_distance: user.race_distance || 7,
        race_date: user.race_date || "",
        race_name: user.race_name || "",
        start_date: user.start_date || "",
        experience_level: profileData.experience_level || "beginner",
        current_weekly_km: profileData.current_weekly_km || 0,
        available_days_per_week: profileData.available_days_per_week || 3,
        minutes_per_session: profileData.minutes_per_session || 60,
        has_injuries: profileData.has_injuries || false,
        injury_description: profileData.injury_description || "",
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: profile.id,
          experience_level: profile.experience_level,
          current_weekly_km: profile.current_weekly_km,
          available_days_per_week: profile.available_days_per_week,
          minutes_per_session: profile.minutes_per_session,
          has_injuries: profile.has_injuries,
          injury_description: profile.has_injuries ? profile.injury_description : null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        setError("Error al guardar perfil");
        setSaving(false);
        return;
      }

      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          race_distance: profile.race_distance,
          race_date: profile.race_date,
          race_name: profile.race_name,
        })
        .eq("id", profile.id);

      if (userError) {
        setError("Error al actualizar datos");
        setSaving(false);
        return;
      }

      setSuccess("Perfil actualizado correctamente");
      setEditMode(false);
    } catch (err) {
      setError("Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    if (!profile) return;

    setSaving(true);
    setError("");

    try {
      // Here we would call a function to regenerate the plan
      // For now, just update the start_date to today
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
        .from("users")
        .update({
          start_date: tomorrow.toISOString().split("T")[0],
        })
        .eq("id", profile.id);

      if (error) {
        setError("Error al recalcular plan");
      } else {
        setProfile({
          ...profile,
          start_date: tomorrow.toISOString().split("T")[0],
        });
        setSuccess("Plan recalculado desde mañana");
      }
    } catch (err) {
      setError("Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background">
        <p className="text-muted-foreground">Error al cargar perfil</p>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
            MI PERFIL
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            @{profile.username}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-mono"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-mono"
          >
            {success}
          </motion.div>
        )}

        {/* Race Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              Tu Carrera
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs font-mono text-primary hover:underline"
              >
                EDITAR
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Distancia
                </label>
                <select
                  value={profile.race_distance}
                  onChange={(e) => setProfile({ ...profile, race_distance: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                >
                  {DISTANCES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Fecha de Carrera
                </label>
                <input
                  type="date"
                  value={profile.race_date}
                  onChange={(e) => setProfile({ ...profile, race_date: e.target.value })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Nombre de la Carrera
                </label>
                <input
                  type="text"
                  value={profile.race_name}
                  onChange={(e) => setProfile({ ...profile, race_name: e.target.value })}
                  placeholder="Nombre de tu carrera"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {profile.race_distance}K
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  {profile.race_name || "Mi Carrera"}
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                {profile.race_date
                  ? new Date(profile.race_date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha no definida"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Training Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm mb-4"
        >
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
            Tu Perfil de Entrenamiento
          </h2>

          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Experiencia Corriendo
                </label>
                <select
                  value={profile.experience_level}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Km por Semana
                  </label>
                  <input
                    type="number"
                    value={profile.current_weekly_km}
                    onChange={(e) => setProfile({ ...profile, current_weekly_km: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Días por Semana
                  </label>
                  <select
                    value={profile.available_days_per_week}
                    onChange={(e) => setProfile({ ...profile, available_days_per_week: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  >
                    {[2, 3, 4, 5, 6].map((d) => (
                      <option key={d} value={d}>{d} días</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Minutos por Sesión
                </label>
                <select
                  value={profile.minutes_per_session}
                  onChange={(e) => setProfile({ ...profile, minutes_per_session: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>Más de 1 hora</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_injuries}
                    onChange={(e) => setProfile({ ...profile, has_injuries: e.target.checked })}
                    className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium">Tengo lesiones o condiciones médicas</span>
                </label>
              </div>

              {profile.has_injuries && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Describe tu lesión
                  </label>
                  <textarea
                    value={profile.injury_description}
                    onChange={(e) => setProfile({ ...profile, injury_description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all resize-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Nivel</span>
                <span className="text-sm font-mono font-medium capitalize">
                  {profile.experience_level === "beginner" ? "Principiante" : 
                   profile.experience_level === "intermediate" ? "Intermedio" : "Avanzado"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Km por semana</span>
                <span className="text-sm font-mono font-medium">{profile.current_weekly_km} km</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Días disponibles</span>
                <span className="text-sm font-mono font-medium">{profile.available_days_per_week} días</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Tiempo por sesión</span>
                <span className="text-sm font-mono font-medium">{profile.minutes_per_session} min</span>
              </div>
              {profile.has_injuries && (
                <div className="p-3 rounded-xl bg-background/50">
                  <span className="text-sm text-muted-foreground">Lesiones: </span>
                  <span className="text-sm font-mono">{profile.injury_description}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  loadProfile();
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? "GUARDANDO..." : "GUARDAR"}
              </button>
            </>
          ) : (
            <button
              onClick={handleRecalculate}
              disabled={saving}
              className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-mono font-semibold tracking-wide hover:bg-primary/10 transition-all disabled:opacity-50"
            >
              {saving ? "RECALCULANDO..." : "RECALCULAR PLAN"}
            </button>
          )}
        </motion.div>

        {/* Back to plan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <a
            href="/plan"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al Plan
          </a>
        </motion.div>
      </div>
    </main>
  );
}