"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { registerUser, clearSession } from "@/lib/auth";

const DISTANCES = [
  { value: 3, label: "3K", description: "Principiante absoluto" },
  { value: 5, label: "5K", description: "Principiante" },
  { value: 7, label: "7K", description: "Recreativo" },
  { value: 10, label: "10K", description: "Intermedio" },
  { value: 15, label: "15K", description: "Intermedio avanzado" },
  { value: 21, label: "21K", description: "Medio Maratón" },
  { value: 42, label: "42K", description: "Maratón" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [raceDistance, setRaceDistance] = useState<number>(7);
  const [raceDate, setRaceDate] = useState("");
  const [raceName, setRaceName] = useState("");

  const handleNext = () => {
    if (step === 1) {
      if (!username.trim()) {
        setError("Ingresa un nombre de usuario");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!raceDate) {
        setError("Selecciona la fecha de tu carrera");
        return;
      }
      const raceDateObj = new Date(raceDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 21); // Minimum 3 weeks
      if (raceDateObj < minDate) {
        setError("La carrera debe ser al menos 3 semanas desde hoy");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!raceName.trim()) {
      setError("Ingresa el nombre de la carrera");
      return;
    }

    setLoading(true);
    setError("");

    const result = await registerUser(
      username.trim(),
      password,
      raceDistance,
      raceDate,
      raceName.trim()
    );

    if (result.success) {
      // Clear any existing session to avoid conflicts
      clearSession();
      router.push("/login?registered=true");
    } else {
      setError(result.error || "Error al crear la cuenta");
      setLoading(false);
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
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.249 8.249 0 0112 21a8.249 8.249 0 01-3.362-15.786A8.25 8.25 0 0115.362 5.214z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75a.75.75 0 000 1.5.75.75 0 000-1.5zM12 12.75a.75.75 0 000 1.5.75.75 0 000-1.5zM15.75 12.75a.75.75 0 000 1.5.75.75 0 000-1.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
            CREAR CUENTA
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1 tracking-wide">
            PASO {step} DE 3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-surface"
              }`}
            />
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm">
          {/* Step 1: Account */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
                Tu Cuenta
              </h2>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu.nombre.usuario"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Race */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
                Tu Carrera
              </h2>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Distancia
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DISTANCES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setRaceDistance(d.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        raceDistance === d.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="text-lg font-bold">{d.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{d.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  Fecha de la Carrera
                </label>
                <input
                  type="date"
                  value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                  min={minDateStr}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                />
                <p className="text-[10px] font-mono text-muted-foreground">
                  Mínimo 3 semanas desde hoy
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Event Name */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
                Nombre del Evento
              </h2>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
                  ¿Cómo se llama tu carrera?
                </label>
                <input
                  type="text"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder="Ej: Maratón de Buenos Aires, Carrera de mi barrio..."
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                <h3 className="text-sm font-bold mb-2">Resumen de tu plan:</h3>
                <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                  <li>• Distancia: {DISTANCES.find(d => d.value === raceDistance)?.label}</li>
                  <li>• Fecha: {new Date(raceDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li>• Evento: {raceName || "Por definir"}</li>
                </ul>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-500 font-mono"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
              >
                ATRÁS
              </button>
            )}
            {step < 3 ? (
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
                {loading ? "CREANDO..." : "CREAR CUENTA"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs font-mono text-muted-foreground">
          Al crear tu cuenta, aceptas nuestros{" "}
          <a href="/terminos" className="text-primary hover:underline" target="_blank">
            Términos y Condiciones
          </a>
        </p>

        <p className="mt-4 text-center text-sm font-mono text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-primary hover:underline">
            Iniciar Sesión
          </a>
        </p>
      </motion.div>
    </div>
  );
}