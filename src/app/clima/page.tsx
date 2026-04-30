"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const WEATHER_TIPS = {
  sunny: {
    icon: "☀️",
    label: "Soleado",
    color: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-500/20",
    tips: [
      "Usa protector solar SPF 50+ 30 min antes de salir",
      "Gorra con visera y lentes de sol",
      "Hidrátate el doble: 500ml cada 20 min",
      "Ropa clara, manga corta, calcetines finos",
      "Evita correr entre 12pm-4pm (horas de más calor)"
    ]
  },
  cloudy: {
    icon: "☁️",
    label: "Nublado",
    color: "from-gray-500/10 to-slate-500/5",
    border: "border-gray-500/20",
    tips: [
      "Condición IDEAL para correr (no hace calor extremo)",
      "Ropa técnica manga corta + chaleco ligero por si cambia",
      "Hidratación normal: 250ml cada 20 min",
      "Aprovecha para hacer la sesión más larga (6km)"
    ]
  },
  rainy: {
    icon: "🌧️",
    label: "Lluvioso",
    color: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/20",
    tips: [
      "Chubasquero ligero (no impermeable pesado)",
      "Gorra con visera (evita que te llueva en los ojos)",
      "Calzado con buen agarre (no correr en charcos profundos)",
      "Cambia ropa inmediatamente al llegar a casa (evita resfriado)",
      "Si hay tormenta eléctrica: NO CORRAS, reagenda"
    ]
  },
  cold: {
    icon: "❄️",
    label: "Frío",
    color: "from-cyan-500/10 to-blue-500/5",
    border: "border-cyan-500/20",
    tips: [
      "Sistema de 3 capas: térmica, aislante, cortavientos",
      "Guantes y gorro (pierdes mucho calor por manos y cabeza)",
      "Calentamiento extra: 5 min más de caminata antes",
      "La sensación térmica puede ser 5°C menos al correr",
      "No te quites la ropa al sudar (puedes enfriarte rápido)"
    ]
  },
  windy: {
    icon: "💨",
    label: "Ventoso",
    color: "from-teal-500/10 to-cyan-500/5",
    border: "border-teal-500/20",
    tips: [
      "Usa ropa ajustada (no suelta que el viento infle)",
      "Si es viento en contra: acorta la zancada, no luches contra el viento",
      "Si es viento a favor: aprovéchalo, pero no aceleres demasiado",
      "Gafas de sol si hay polvo o arena en el aire"
    ]
  }
};

export default function ClimaPage() {
  const router = useRouter();
  const [weather, setWeather] = useState<string | null>(null);
  const [customTemp, setCustomTemp] = useState<string>("");

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const getTempRecommendation = (temp: number) => {
    if (temp >= 28) return { level: "Muy caluroso", color: "text-red-500", icon: "🔥" };
    if (temp >= 22) return { level: "Caluroso", color: "text-orange-500", icon: "☀️" };
    if (temp >= 16) return { level: "Ideal para correr", color: "text-green-500", icon: "✅" };
    if (temp >= 10) return { level: "Fresco", color: "text-blue-500", icon: "🍃" };
    return { level: "Frío", color: "text-cyan-500", icon: "❄️" };
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              🌤️ Clima y Recomendaciones
            </h1>
            <p className="text-base text-muted-foreground">
              Cómo adaptar tu entrenamiento según el clima
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">🌡️ Calculadora de clima</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">Temperatura actual (°C)</label>
              <input
                type="number"
                value={customTemp}
                onChange={(e) => setCustomTemp(e.target.value)}
                placeholder="Ej: 22"
                className="w-full h-12 rounded-xl border border-border bg-surface-elevated px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
          {customTemp && !isNaN(Number(customTemp)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
            >
              <p className="text-lg font-semibold text-foreground">
                {getTempRecommendation(Number(customTemp)).icon}{' '}
                {customTemp}°C - {getTempRecommendation(Number(customTemp)).level}
              </p>
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                {Number(customTemp) >= 28
                  ? 'Hidrátate extra, usa ropa muy ligera, evita horas centrales.'
                  : Number(customTemp) >= 22
                  ? 'Buen clima para correr. Usa ropa cómoda y clara.'
                  : Number(customTemp) >= 16
                  ? '¡Clima perfecto! Aprovecha para hacer tu mejor sesión.'
                  : Number(customTemp) >= 10
                  ? 'Usa chaqueta ligera, las extremidades pueden enfriarse.'
                  : 'Vístete en capas, guantes y gorro. Calienta bien.'}
              </p>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(WEATHER_TIPS).map(([key, condition], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border ${condition.border} bg-gradient-to-br ${condition.color} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{condition.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {condition.label}
                  </h3>
                </div>
                <div className="space-y-3 ml-11">
                  {condition.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      <span className="text-base text-muted-foreground leading-relaxed">
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center"
        >
          <p className="text-base font-semibold text-primary mb-2">
            💡 Tip para el día de la carrera
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Revisa el clima 2 días antes y el día anterior. Si hace mucho calor (29°C+),
            ajusta tu estrategia a un ritmo más lento y hidrátate el doble. ¡No luches contra el clima!
          </p>
        </motion.div>
      </div>
    </main>
  );
}