"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { validateCredentials, createSession, initializeCredentials } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // Initialize credentials if not present
      if (!localStorage.getItem("yadira_credentials")) {
        initializeCredentials();
      }

      // Check existing session
      const stored = localStorage.getItem("yadira_session");
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (session?.authenticated && session?.expiresAt > Date.now()) {
            router.replace("/plan");
            return;
          }
          localStorage.removeItem("yadira_session");
        } catch {
          localStorage.removeItem("yadira_session");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password) {
      setError("Por favor ingresa usuario y contraseña");
      return;
    }

    setIsAuthenticating(true);
    try {
      const isValid = await validateCredentials(username.trim(), password);
      if (isValid) {
        createSession(username.trim());
        router.replace("/plan");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch {
      setError("Error al validar credenciales");
    } finally {
      setIsAuthenticating(false);
    }
  }, [username, password, router]);

  const handleClearAndRetry = () => {
    // Only clear auth data, not the training plan
    localStorage.removeItem("yadira_credentials");
    localStorage.removeItem("yadira_session");
    setError("");
    setUsername("");
    setPassword("");
    initializeCredentials();
  };

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

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 sm:h-14 sm:w-14"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z"
              />
            </svg>
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Yadira Running</h1>
          <p className="mt-1 text-xs sm:text-sm text-foreground/50">
            Plan personalizado de entrenamiento
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          <div>
            <label htmlFor="username" className="sr-only">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Usuario"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5 sm:py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Contraseña"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5 sm:py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm text-red-500 text-center"
            >
              {error}
              {error.includes("incorrectos") && (
                <button
                  type="button"
                  onClick={handleClearAndRetry}
                  className="ml-2 underline hover:text-red-600"
                >
                  Limpiar y reintentar
                </button>
              )}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isAuthenticating ? "Entrando..." : "Entrar al plan"}
          </button>
        </motion.form>

        <p className="mt-4 sm:mt-6 text-center text-[11px] sm:text-xs text-foreground/40">
          Evento: 17 de mayo de 2026
        </p>
      </motion.div>
    </main>
  );
}
