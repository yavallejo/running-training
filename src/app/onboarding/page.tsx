"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import dynamic from "next/dynamic";

// @ts-ignore
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";

interface QuizAnswers {
  // Step 1: Experience
  timeRunning: string;
  weeklyKm: string;
  // Step 2: Goal
  goalDistance: number;
  goalDate: string;
  goalName: string;
  // Step 3: Availability
  availableDays: number;
  minutesPerSession: string;
  // Step 4: Physical
  hasInjuries: boolean;
  injuryDescription: string;
  medicalClearance: boolean;
  // Step 5: Physiology
  age: string;
  sex: string;
  weight: string;
  restingHr: string;
  maxHr: string;
  // Step 6: Preferences
  preferredTerrain: string;
  hasTreadmill: boolean;
  progressivePace: boolean;
}

const TIME_RUNNING_OPTIONS = [
  { value: "never", label: "Nunca he corrido" },
  { value: "less-3-months", label: "Menos de 3 meses" },
  { value: "3-6-months", label: "3 a 6 meses" },
  { value: "6-12-months", label: "6 a 12 meses" },
  { value: "more-1-year", label: "Más de 1 año" },
];

const WEEKLY_KM_OPTIONS = [
  { value: "0", label: "0 km (soy principiante total)" },
  { value: "5-10", label: "5 - 10 km" },
  { value: "10-20", label: "10 - 20 km" },
  { value: "20-35", label: "20 - 35 km" },
  { value: "35+", label: "35+ km" },
];

const DISTANCES = [
  { value: 3, label: "3K", weeks: 4 },
  { value: 5, label: "5K", weeks: 6 },
  { value: 7, label: "7K", weeks: 8 },
  { value: 10, label: "10K", weeks: 10 },
  { value: 15, label: "15K", weeks: 12 },
  { value: 21, label: "21K", weeks: 14 },
  { value: 42, label: "42K", weeks: 18 },
];

const AVAILABLE_DAYS_OPTIONS = [
  { value: 2, label: "2 días" },
  { value: 3, label: "3 días" },
  { value: 4, label: "4 días" },
  { value: 5, label: "5 días" },
  { value: 6, label: "6 días" },
];

const MINUTES_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90+", label: "Más de 1 hora" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Prefiero no decir" },
];

const TERRAIN_OPTIONS = [
  { value: "road", label: "Asfalto", icon: "🛣️" },
  { value: "track", label: "Pista", icon: "🏟️" },
  { value: "trail", label: "Trail", icon: "⛰️" },
  { value: "treadmill", label: "Cinta", icon: "🏃" },
  { value: "mixed", label: "Mixto", icon: "🔄" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<QuizAnswers>({
    // Step 1
    timeRunning: "",
    weeklyKm: "",
    // Step 2
    goalDistance: 7,
    goalDate: "",
    goalName: "",
    // Step 3
    availableDays: 3,
    minutesPerSession: "60",
    // Step 4
    hasInjuries: false,
    injuryDescription: "",
    medicalClearance: false,
    // Step 5
    age: "",
    sex: "other",
    weight: "",
    restingHr: "",
    maxHr: "",
    // Step 6
    preferredTerrain: "road",
    hasTreadmill: false,
    progressivePace: true,
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserId(session.userId);
  }, [router]);

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!answers.timeRunning || !answers.weeklyKm) {
        setError("Por favor completa todos los campos");
        return;
      }
    } else if (step === 2) {
      if (!answers.goalDate) {
        setError("Por favor selecciona una fecha");
        return;
      }
    } else if (step === 3) {
      if (!answers.availableDays || !answers.minutesPerSession) {
        setError("Por favor completa todos los campos");
        return;
      }
    } else if (step === 4) {
      if (!answers.medicalClearance) {
        setError("Debes confirmar que has consultado a tu médico");
        return;
      }
    } else if (step === 5) {
      if (!answers.age) {
        setError("Por favor ingresa tu edad");
        return;
      }
      const ageNum = parseInt(answers.age);
      if (ageNum < 16 || ageNum > 99) {
        setError("La edad debe estar entre 16 y 99 años");
        return;
      }
    }

    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      // Calculate experience level
      const experienceLevel = calculateExperienceLevel(answers.timeRunning, answers.weeklyKm);

      // Save to user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: userId,
          experience_level: experienceLevel,
          current_weekly_km: parseWeeklyKm(answers.weeklyKm),
          available_days_per_week: answers.availableDays,
          minutes_per_session: parseInt(answers.minutesPerSession),
          has_injuries: answers.hasInjuries,
          injury_description: answers.hasInjuries ? answers.injuryDescription : null,
          medical_clearance: answers.medicalClearance,
          // New physiology fields
          age: parseInt(answers.age) || null,
          sex: answers.sex,
          weight: answers.weight ? parseFloat(answers.weight) : null,
          resting_heart_rate: answers.restingHr ? parseInt(answers.restingHr) : null,
          max_heart_rate: answers.maxHr ? parseInt(answers.maxHr) : null,
          // New preferences
          preferred_terrain: answers.preferredTerrain,
          has_treadmill: answers.hasTreadmill,
          progressive_pace: answers.progressivePace,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile error:", profileError);
        setError("Error al guardar perfil");
        setLoading(false);
        return;
      }

      // Update users table with goal info
      const { error: userError } = await supabase
        .from("users")
        .update({
          race_distance: answers.goalDistance,
          race_date: answers.goalDate,
          race_name: answers.goalName || "Mi Carrera",
        })
        .eq("id", userId);

      if (userError) {
        console.error("User update error:", userError);
      }

      // Redirect to plan
      router.push("/plan");
    } catch (err) {
      console.error("Error:", err);
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const calculateExperienceLevel = (timeRunning: string, weeklyKm: string): string => {
    if (timeRunning === "never" || timeRunning === "less-3-months") return "beginner";
    if (weeklyKm === "0" || weeklyKm === "5-10") return "beginner";
    if (weeklyKm === "35+") return "advanced";
    if (timeRunning === "more-1-year" && (weeklyKm === "20-35")) return "advanced";
    return "intermediate";
  };

  const parseWeeklyKm = (km: string): number => {
    switch (km) {
      case "0": return 0;
      case "5-10": return 7.5;
      case "10-20": return 15;
      case "20-35": return 27.5;
      case "35+": return 40;
      default: return 0;
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 21);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
            PERSONALIZA TU PLAN
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-2 tracking-wide">
            PASO {step} DE 7
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-surface"
              }`}
            />
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {/* Step 1: Experience */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Tu Experiencia Corriendo
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuánto tiempo llevas corriendo de forma regular?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {TIME_RUNNING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, timeRunning: option.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          answers.timeRunning === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-sm font-mono">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuántos kilómetros corres actualmente por semana?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {WEEKLY_KM_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, weeklyKm: option.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          answers.weeklyKm === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-sm font-mono">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Goal */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Tu Objetivo
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Para qué distancia te estás preparando?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DISTANCES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setAnswers({ ...answers, goalDistance: d.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          answers.goalDistance === d.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <div className="text-lg font-bold">{d.label}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{d.weeks} sem</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuándo es tu carrera?
                  </label>
                  <div className="w-full">
                    <DatePicker
                      selected={answers.goalDate ? new Date(answers.goalDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const formatted = date.toISOString().split("T")[0];
                          setAnswers({ ...answers, goalDate: formatted });
                        }
                      }}
                      minDate={minDate}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Selecciona la fecha de tu carrera"
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                      calendarClassName="dark-datepicker"
                      showPopperArrow={false}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Mínimo 3 semanas desde hoy
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Nombre de la carrera (opcional)
                  </label>
                  <input
                    type="text"
                    value={answers.goalName}
                    onChange={(e) => setAnswers({ ...answers, goalName: e.target.value })}
                    placeholder="Ej: Maratón de Buenos Aires"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Availability */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Tu Disponibilidad
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuántos días por semana puedes entrenar?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_DAYS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, availableDays: option.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          answers.availableDays === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <div className="text-lg font-bold">{option.value}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">días</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuánto tiempo tienes disponible por sesión?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MINUTES_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, minutesPerSession: option.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          answers.minutesPerSession === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-sm font-mono">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Physical Conditions */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Condiciones Físicas
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Tienes alguna lesión o condición médica que debamos conocer?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAnswers({ ...answers, hasInjuries: false, injuryDescription: "" })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        !answers.hasInjuries
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="text-2xl mb-1">✓</div>
                      <div className="text-sm font-mono">No tengo lesiones</div>
                    </button>
                    <button
                      onClick={() => setAnswers({ ...answers, hasInjuries: true })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        answers.hasInjuries
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="text-2xl mb-1">⚠</div>
                      <div className="text-sm font-mono">Tengo una lesión</div>
                    </button>
                  </div>
                </div>

                {answers.hasInjuries && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <label className="text-sm font-medium text-foreground">
                      Describe brevemente tu lesión o condición
                    </label>
                    <textarea
                      value={answers.injuryDescription}
                      onChange={(e) => setAnswers({ ...answers, injuryDescription: e.target.value })}
                      placeholder="Ej: Dolor en rodilla derecha, tendinitis en aquiles..."
                      rows={3}
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all resize-none"
                    />
                  </motion.div>
                )}

                {/* Medical Disclaimer */}
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-500 mb-1">AVISO MÉDICO</p>
                      <p className="text-xs text-muted-foreground">
                        Este plan es generado algorítmicamente y NO sustituye la supervisión médica. Te recomendamos consultar a tu médico antes de iniciar cualquier programa de entrenamiento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Clearance Checkbox */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answers.medicalClearance}
                      onChange={(e) => setAnswers({ ...answers, medicalClearance: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-border/50 bg-background/50 text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm text-muted-foreground">
                      He consultado a mi médico y estoy seguro de que puedo hacer actividad física
                    </span>
                  </label>
                  <p className="text-[10px] font-mono text-muted-foreground ml-7">
                    <a href="/terminos" target="_blank" className="text-primary hover:underline">
                      Ver Términos y Condiciones
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Physiology */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Tu Cuerpo
                </h2>
                <p className="text-sm text-muted-foreground">
                  Esta información nos ayuda a personalizar mejor tu plan (campos opcionales excepto la edad).
                </p>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuántos años tienes? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={answers.age}
                    onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                    placeholder="Ej: 28"
                    min="16"
                    max="99"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Sexo biológico
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SEX_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, sex: option.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          answers.sex === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <span className="text-sm font-mono">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Peso (kg) <span className="text-muted-foreground text-xs">opcional</span>
                    </label>
                    <input
                      type="number"
                      value={answers.weight}
                      onChange={(e) => setAnswers({ ...answers, weight: e.target.value })}
                      placeholder="70"
                      min="30"
                      max="200"
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      FC Reposo (lpm) <span className="text-muted-foreground text-xs">opcional</span>
                    </label>
                    <input
                      type="number"
                      value={answers.restingHr}
                      onChange={(e) => setAnswers({ ...answers, restingHr: e.target.value })}
                      placeholder="60"
                      min="30"
                      max="120"
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    FC Máxima (lpm) <span className="text-muted-foreground text-xs">si la conoces</span>
                  </label>
                  <input
                    type="number"
                    value={answers.maxHr}
                    onChange={(e) => setAnswers({ ...answers, maxHr: e.target.value })}
                    placeholder="190"
                    min="100"
                    max="220"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Si no la conoces, la estimaremos automáticamente según tu edad
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 6: Preferences */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Tus Preferencias
                </h2>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Dónde corres principalmente?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TERRAIN_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers({ ...answers, preferredTerrain: option.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          answers.preferredTerrain === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-background/50 hover:border-foreground/20"
                        }`}
                      >
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div className="text-xs font-mono">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    ¿Tienes acceso a treadmill/cinta para entrenar?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAnswers({ ...answers, hasTreadmill: true })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        answers.hasTreadmill
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="text-2xl mb-1">✓</div>
                      <div className="text-sm font-mono">Sí</div>
                    </button>
                    <button
                      onClick={() => setAnswers({ ...answers, hasTreadmill: false })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        !answers.hasTreadmill
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="text-2xl mb-1">✗</div>
                      <div className="text-sm font-mono">No</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border/50 bg-background/50">
                    <input
                      type="checkbox"
                      checked={answers.progressivePace}
                      onChange={(e) => setAnswers({ ...answers, progressivePace: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-border/50 bg-background/50 text-primary focus:ring-primary/50"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Ritmo progresivo
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tu ritmo mejorará gradualmente durante el plan. Si lo desactivas, mantendrás un ritmo constante.
                      </p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 7: Summary */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Resumen de tu Plan
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <div className="text-xs font-mono text-muted-foreground mb-1">EXPERIENCIA</div>
                    <div className="text-sm font-medium">
                      {TIME_RUNNING_OPTIONS.find(o => o.value === answers.timeRunning)?.label}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {WEEKLY_KM_OPTIONS.find(o => o.value === answers.weeklyKm)?.label}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <div className="text-xs font-mono text-muted-foreground mb-1">OBJETIVO</div>
                    <div className="text-sm font-medium">
                      {DISTANCES.find(d => d.value === answers.goalDistance)?.label} - {answers.goalName || "Mi Carrera"}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      Fecha: {new Date(answers.goalDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <div className="text-xs font-mono text-muted-foreground mb-1">DISPONIBILIDAD</div>
                    <div className="text-sm font-medium">
                      {answers.availableDays} días por semana
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {MINUTES_OPTIONS.find(o => o.value === answers.minutesPerSession)?.label} por sesión
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <div className="text-xs font-mono text-muted-foreground mb-1">FISIOLOGÍA</div>
                    <div className="text-sm font-medium">
                      {answers.age} años · {SEX_OPTIONS.find(o => o.value === answers.sex)?.label}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {answers.weight ? `${answers.weight} kg` : "Peso no especificado"} · 
                      {answers.restingHr ? ` FC Reposo: ${answers.restingHr}` : " FC no especificada"}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <div className="text-xs font-mono text-muted-foreground mb-1">PREFERENCIAS</div>
                    <div className="text-sm font-medium">
                      {TERRAIN_OPTIONS.find(o => o.value === answers.preferredTerrain)?.label} · 
                      {answers.hasTreadmill ? " Con cinta" : " Sin cinta"}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {answers.progressivePace ? "Ritmo progresivo" : "Ritmo constante"}
                    </div>
                  </div>

                  {answers.hasInjuries && (
                    <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                      <div className="text-xs font-mono text-muted-foreground mb-1">CONDICIONES</div>
                      <div className="text-sm font-medium">
                        {answers.injuryDescription}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary font-mono">
                    ✓ Tu plan será generado automáticamente según tus respuestas
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-500 font-mono"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
              >
                ATRÁS
              </button>
            )}
            {step < 7 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? "GENERANDO PLAN..." : "GENERAR MI PLAN"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
