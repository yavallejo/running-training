"use client";

import { useState, useEffect, useMemo } from "react";
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
  // New fields
  age: number | null;
  sex: string;
  weight: number | null;
  resting_heart_rate: number | null;
  max_heart_rate: number | null;
  preferred_terrain: string;
  goal_type: string;
  has_treadmill: boolean;
  progressive_pace: boolean;
  medical_clearance: boolean;
}

const DISTANCES = [
  { value: 3, label: "3K" },
  { value: 5, label: "5K" },
  { value: 7, label: "7K" },
  { value: 10, label: "10K" },
  { value: 15, label: "15K" },
  { value: 21, label: "21K" },
  { value: 42, label: "42K" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Prefiero no decir" },
];

const TERRAIN_OPTIONS = [
  { value: "road", label: "Asfalto" },
  { value: "track", label: "Pista" },
  { value: "trail", label: "Trail" },
  { value: "treadmill", label: "Cinta" },
  { value: "mixed", label: "Mixto" },
];

const GOAL_OPTIONS = [
  { value: "compete", label: "Competir" },
  { value: "fitness", label: "Fitness general" },
  { value: "weight_loss", label: "Perder peso" },
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
            injury_description,
            age,
            sex,
            weight,
            resting_heart_rate,
            max_heart_rate,
            preferred_terrain,
            goal_type,
            has_treadmill,
            progressive_pace,
            medical_clearance
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
        // New fields
        age: profileData.age || null,
        sex: profileData.sex || "other",
        weight: profileData.weight || null,
        resting_heart_rate: profileData.resting_heart_rate || null,
        max_heart_rate: profileData.max_heart_rate || null,
        preferred_terrain: profileData.preferred_terrain || "road",
        goal_type: profileData.goal_type || "fitness",
        has_treadmill: profileData.has_treadmill || false,
        progressive_pace: profileData.progressive_pace !== false,
        medical_clearance: profileData.medical_clearance || false,
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
          // New fields
          age: profile.age,
          sex: profile.sex,
          weight: profile.weight,
          resting_heart_rate: profile.resting_heart_rate,
          max_heart_rate: profile.max_heart_rate,
          preferred_terrain: profile.preferred_terrain,
          goal_type: profile.goal_type,
          has_treadmill: profile.has_treadmill,
          progressive_pace: profile.progressive_pace,
          medical_clearance: profile.medical_clearance,
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

  const daysUntilRace = useMemo(() => {
    if (!profile?.race_date) return null;
    const race = new Date(profile.race_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }, [profile?.race_date]);

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

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-5 rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent border border-primary/20"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/65 flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(255,59,48,0.35)] flex-shrink-0">
              <span className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-urbanist)" }}>
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Corredor</p>
                  <h1 className="text-xl font-black tracking-tight truncate" style={{ fontFamily: "var(--font-urbanist)" }}>
                    {profile.username}
                  </h1>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono text-primary bg-primary/8 hover:bg-primary/15 border border-primary/25 transition-all"
                  >
                    EDITAR
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {profile.race_distance}K
                </span>
                <span className="text-border text-sm">·</span>
                <span className="text-sm text-muted-foreground truncate">{profile.race_name || "Mi Carrera"}</span>
              </div>
            </div>
          </div>

          {profile.race_date && (
            <div className="relative mt-4 pt-4 border-t border-primary/12 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-1">DÍAS PARA LA CARRERA</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-primary leading-none" style={{ fontFamily: "var(--font-urbanist)" }}>
                    {daysUntilRace !== null ? (daysUntilRace > 0 ? daysUntilRace : "¡Hoy!") : "—"}
                  </span>
                  {daysUntilRace !== null && daysUntilRace > 0 && (
                    <span className="text-xs font-mono text-muted-foreground">días</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-1">FECHA DE CARRERA</p>
                <p className="text-sm font-semibold">
                  {new Date(profile.race_date + "T00:00:00").toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {new Date(profile.race_date + "T00:00:00").getFullYear()}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-mono"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-mono"
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
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              Tu Carrera
            </h2>
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
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                <span className="text-4xl font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {profile.race_distance}K
                </span>
                <div>
                  <p className="text-sm font-semibold">{profile.race_name || "Mi Carrera"}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {profile.race_date
                      ? new Date(profile.race_date + "T00:00:00").toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Fecha no definida"}
                  </p>
                </div>
              </div>
              {profile.start_date && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                  <span className="text-sm text-muted-foreground">Inicio del plan</span>
                  <span className="text-sm font-mono font-medium">
                    {new Date(profile.start_date + "T00:00:00").toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
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
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              Tu Perfil de Entrenamiento
            </h2>
          </div>

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

        {/* Physiology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm mb-4"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              Tu Cuerpo
            </h2>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Edad
                  </label>
                  <input
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                    placeholder="28"
                    min="16"
                    max="99"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Sexo
                  </label>
                  <select
                    value={profile.sex}
                    onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  >
                    {SEX_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || null })}
                    placeholder="70"
                    min="30"
                    max="200"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                    FC Reposo (lpm)
                  </label>
                  <input
                    type="number"
                    value={profile.resting_heart_rate || ""}
                    onChange={(e) => setProfile({ ...profile, resting_heart_rate: parseInt(e.target.value) || null })}
                    placeholder="60"
                    min="30"
                    max="120"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  FC Máxima (lpm)
                </label>
                <input
                  type="number"
                  value={profile.max_heart_rate || ""}
                  onChange={(e) => setProfile({ ...profile, max_heart_rate: parseInt(e.target.value) || null })}
                  placeholder="190"
                  min="100"
                  max="220"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                />
                <p className="text-[10px] font-mono text-muted-foreground">
                  Si no la conoces, la estimaremos según tu edad
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Edad</span>
                <span className="text-sm font-mono font-medium">
                  {profile.age ? `${profile.age} años` : "No especificada"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Sexo</span>
                <span className="text-sm font-mono font-medium">
                  {SEX_OPTIONS.find(o => o.value === profile.sex)?.label || "No especificado"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Peso</span>
                <span className="text-sm font-mono font-medium">
                  {profile.weight ? `${profile.weight} kg` : "No especificado"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">FC Reposo</span>
                <span className="text-sm font-mono font-medium">
                  {profile.resting_heart_rate ? `${profile.resting_heart_rate} lpm` : "No especificada"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">FC Máxima</span>
                <span className="text-sm font-mono font-medium">
                  {profile.max_heart_rate ? `${profile.max_heart_rate} lpm` : "Estimada por edad"}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm mb-4"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              Tus Preferencias
            </h2>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Terreno Preferido
                </label>
                <select
                  value={profile.preferred_terrain}
                  onChange={(e) => setProfile({ ...profile, preferred_terrain: e.target.value })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                >
                  {TERRAIN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Objetivo Principal
                </label>
                <select
                  value={profile.goal_type}
                  onChange={(e) => setProfile({ ...profile, goal_type: e.target.value })}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                >
                  {GOAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_treadmill}
                    onChange={(e) => setProfile({ ...profile, has_treadmill: e.target.checked })}
                    className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium">Tengo acceso a treadmill/cinta</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.progressive_pace}
                    onChange={(e) => setProfile({ ...profile, progressive_pace: e.target.checked })}
                    className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium">Ritmo progresivo (mejora semanal)</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Terreno</span>
                <span className="text-sm font-mono font-medium">
                  {TERRAIN_OPTIONS.find(o => o.value === profile.preferred_terrain)?.label || "No especificado"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Objetivo</span>
                <span className="text-sm font-mono font-medium">
                  {GOAL_OPTIONS.find(o => o.value === profile.goal_type)?.label || "No especificado"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Cinta</span>
                <span className="text-sm font-mono font-medium">
                  {profile.has_treadmill ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <span className="text-sm text-muted-foreground">Ritmo</span>
                <span className="text-sm font-mono font-medium">
                  {profile.progressive_pace ? "Progresivo" : "Constante"}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
          transition={{ delay: 0.6 }}
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
