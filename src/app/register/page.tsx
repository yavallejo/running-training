"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { registerUser, clearSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
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

    setLoading(true);
    setError("");

    const result = await registerUser(username.trim(), password);

    if (result.success) {
      clearSession();
      router.push("/login?registered=true");
    } else {
      setError(result.error || "Error al crear la cuenta");
      setLoading(false);
    }
  };

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
            Después personalizarás tu plan de entrenamiento
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
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
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-500 font-mono"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "CREANDO..." : "CREAR CUENTA"}
          </button>
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
