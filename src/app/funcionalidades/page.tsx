"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TrainingSession, EVENT_NAME, EVENT_DATE } from "@/lib/training-plan";
import { getSession, clearSession } from "@/lib/auth";

const FEATURES = [
  {
    icon: "🎯",
    title: "Plan de Entrenamiento Personalizado",
    description: "11 sesiones progresivas del 29 de abril al 17 de mayo 2026, diseñadas para corredores principiantes. Desde 3 km hasta los 7 km del evento.",
    details: ["11 sesiones únicas", "Progresión 3→7 km", "Descripciones detalladas", "Ritmo objetivo ~11 min/km"],
    color: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
  },
  {
    icon: "✅",
    title: "7 Estados Visuales de Tarjetas",
    description: "Cada sesión muestra su estado con colores y badges: Normal, HOY (animado), Completado, PERDIDO, REPROGRAMADA, BLOQUEADA, y REPROGRAMADA+COMPLETADA.",
    details: ["Animaciones Framer Motion", "Badges de estado", "Información visual clara", "Solo una reprogramación por sesión"],
    color: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
  },
  {
    icon: "📝",
    title: "Notas Post-Entrenamiento",
    description: "Al completar una sesión, se abre un modal para registrar: tiempo real, ritmo logrado (calculado automáticamente), sensación física (1-5 estrellas) y notas libres.",
    details: ["Tiempo en formato MM:SS", "Ritmo calculado automático", "Sistema de estrellas 1-5", "Notas de texto libre"],
    color: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
  },
  {
    icon: "⏱️",
    title: "Cuenta Regresiva Visual",
    description: `Timer animado en tiempo real que muestra días, horas, minutos y segundos hasta ${EVENT_NAME} (${EVENT_DATE}). Al llegar a cero: "¡ES HOY! 🎉"`,
    details: ["Animación Framer Motion", "Actualización cada segundo", "Diseño gradiente primary/secondary", "Mensaje especial el día del evento"],
    color: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-500/20",
  },
  {
    icon: "🏆",
    title: "Sistema de Logros/Badges",
    description: "Gana badges desbloqueables al alcanzar hitos: Primera Carrera, Racha de 3, Meta 5K, Reprogramadora, Mitad del Camino, y Casi Lista.",
    details: ["7 badges únicos", "Popup animado al desbloquear", "Visualización en Estadísticas", "Almacenado en localStorage"],
    color: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
  },
  {
    icon: "📅",
    title: "Vista Calendario Mensual",
    description: "Alterna entre vista de lista y calendario mensual. Visualiza todas las sesiones en un grid con dots de colores según estado. Navegación entre meses.",
    details: ["Grid 7 columnas (dom-sáb)", "Dots de colores por estado", "Toggle lista/calendario", "Click en día hace scroll a sesión"],
    color: "from-indigo-500/10 to-indigo-600/5",
    border: "border-indigo-500/20",
  },
  {
    icon: "📤",
    title: "Compartir Logros",
    description: "Comparte tus sesiones completadas en redes sociales. Genera una imagen personalizada con distancia, tiempo, ritmo y el logo de RunPlan Pro.",
    details: ["Generación de imagen PNG", "Usa html2canvas", "Web Share API o descarga", "Diseño gradiente atractivo"],
    color: "from-teal-500/10 to-teal-600/5",
    border: "border-teal-500/20",
  },
  {
    icon: "🔔",
    title: "Notificaciones Push Reales",
    description: "Recibe recordatorios push en tu dispositivo cuando tengas una sesión programada para hoy. Configurado con VAPID y Vercel Cron.",
    details: ["Web Push API", "Suscripción VAPID", "Cron job 7:00 AM diario", "Requiere permiso del navegador"],
    color: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
  },
  {
    icon: "🎉",
    title: "Confetti al Completar",
    description: "Celebración visual con confetti (react-confetti) que cae durante 4 segundos cada vez que completas una sesión de entrenamiento.",
    details: ["300 piezas de confetti", "Caída física realista", "Duración 4 segundos", "Solo se activa al completar"],
    color: "from-pink-500/10 to-pink-600/5",
    border: "border-pink-500/20",
  },
  {
    icon: "📊",
    title: "Estadísticas Avanzadas",
    description: "Página dedicada con métricas de progreso: días restantes, sesiones completadas, distancia total, porcentaje de cumplimiento y barras de progreso animadas.",
    details: ["AnimatedNumber component", "Barras de progreso", "Próxima sesión destacada", "Grid de logros/badges"],
    color: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
  },
  {
    icon: "🔐",
    title: "Autenticación Segura",
    description: "Sistema de login con hash SHA-256 para la contraseña. Sesiones con expiración de 24 horas.",
    details: ["Hash SHA-256 con Web Crypto API", "Sesiones de 24 horas", "localStorage seguro", "Redirección automática"],
    color: "from-red-500/10 to-red-500/5",
    border: "border-red-500/20",
  },
];

export default function FuncionalidadesPage() {
  const router = useRouter();
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Funcionalidades
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-foreground/50">
              Todo lo que RunPlan Pro puede hacer
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-6 sm:p-8 text-primary-foreground text-center"
        >
          <div className="text-4xl mb-3">🏃‍♀️</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">RunPlan Pro</h2>
          <p className="text-sm opacity-80">
            Tu entrenamiento personalizado para {EVENT_NAME}
          </p>
          <p className="text-xs mt-2 opacity-60">
            12 funcionalidades diseñadas para maximizar tu rendimiento
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border ${feature.border} bg-gradient-to-br ${feature.color} p-4 sm:p-5 cursor-pointer transition-transform hover:scale-[1.02]`}
              onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {expandedFeature === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-foreground/10"
                    >
                      <ul className="space-y-1">
                        {feature.details.map((detail, i) => (
                          <li key={i} className="text-[10px] sm:text-[11px] text-foreground/50 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  
                  <p className="text-[10px] text-foreground/30 mt-2">
                    {expandedFeature === index ? "Click para contraer" : "Click para ver detalles"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 sm:mt-10 rounded-xl border border-foreground/5 bg-foreground/[0.02] p-4 sm:p-6 text-center"
        >
          <h3 className="text-sm font-medium text-foreground mb-2">
            🔒 Seguridad y Privacidad
          </h3>
          <p className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed">
            Todos los datos se almacenan localmente en tu navegador (localStorage). 
            No hay base de datos externa. Tu información personal y entrenamientos 
            permanecen solo en tu dispositivo.
          </p>
        </motion.div>

        {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 rounded-xl border border-foreground/5 p-4 text-center"
          >
            <p className="text-[10px] sm:text-xs text-foreground/30">
              Built with Next.js 16 · TypeScript · Tailwind 4.x · Framer Motion · Vercel
            </p>
          </motion.div>
      </div>
    </main>
  );
}
