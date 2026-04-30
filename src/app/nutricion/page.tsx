"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const NUTRITION_SECTIONS = [
  {
    id: "antes",
    icon: "🥑",
    title: "Antes de Correr",
    color: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/20",
    time: "1-3 horas antes",
    items: [
      { text: "Carbohidratos complejos: avena, pan integral, arroz, pasta", type: "good" },
      { text: "Una porción pequeña de proteína: huevo, yogurt, pollo", type: "good" },
      { text: "Grasas saludables moderadas: aguacate, nueces (pocas)", type: "good" },
      { text: "EVITA: comida grasa, frita, mucha fibra o muy picante", type: "bad" },
      { text: "Ejemplo: Tostada integral con aguacate + 1 plátano", type: "example" }
    ]
  },
  {
    id: "durante",
    icon: "💧",
    title: "Durante la Carrera",
    color: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    time: "Cada 15-20 min",
    items: [
      { text: "Para 3-6 km: solo agua es suficiente si dura < 45 min", type: "good" },
      { text: "Hidrátate ANTES de tener sed (250ml cada 20 min)", type: "good" },
      { text: "Si hace mucho calor: bebidas con electrolitos (Gatorade sport)", type: "good" },
      { text: "EVITA: bebidas azucaradas normales (causan molestias)", type: "bad" },
      { text: "Lleva una botella pequeña en mano o usa fuentes del parque", type: "example" }
    ]
  },
  {
    id: "despues",
    icon: "🍗",
    title: "Después de Correr",
    color: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
    time: "30-60 min después",
    items: [
      { text: "Proteína + carbohidratos: batido de proteína + plátano", type: "good" },
      { text: "Comida real: pollo/atún + arroz/quinoa + vegetales", type: "good" },
      { text: "Chocolate con leche (proporción 1:3 ideal para recuperación)", type: "good" },
      { text: "EVITA: ayunar después de correr (músculos no se recuperan)", type: "bad" },
      { text: "Ejemplo: Bowl de yogurt griego + frutos rojos + granola", type: "example" }
    ]
  },
  {
    id: "hidratacion",
    icon: "🚰",
    title: "Hidratación General",
    color: "from-cyan-500/10 to-blue-500/5",
    border: "border-cyan-500/20",
    time: "Todo el día",
    items: [
      { text: "Mínimo 2-2.5 litros de agua al día (8-10 vasos)", type: "good" },
      { text: "Orina clara = bien hidratado. Orina oscura = bebe más", type: "good" },
      { text: "Agrega electrolitos si sudas mucho (sales, potasio, magnesio)", type: "good" },
      { text: "EVITA: alcohol 24h antes de una sesión larga", type: "bad" },
      { text: "Tip: lleva botella reutilizable siempre contigo", type: "example" }
    ]
  },
  {
    id: "suplementos",
    icon: "💊",
    title: "Suplementos (Opcional)",
    color: "from-purple-500/10 to-violet-500/5",
    border: "border-purple-500/20",
    time: "Consulta médico",
    items: [
      { text: "Proteína en polvo: ayuda en recuperación muscular", type: "good" },
      { text: "Magnesio: previene calambres, tomar antes de dormir", type: "good" },
      { text: "Geles de carbohidratos: solo para carreras > 1 hora", type: "good" },
      { text: "NO necesitas suplementos si tienes una dieta equilibrada", type: "info" },
      { text: "Siempre consulta con médico antes de tomar suplementos", type: "info" }
    ]
  },
  {
    id: "dia-carrera-nut",
    icon: "🎉",
    title: "Día de la Carrera (17 mayo)",
    color: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-500/20",
    time: "Estrategia especial",
    items: [
      { text: "2 días antes: come más carbohidratos (pasta, arroz, pan)", type: "good" },
      { text: "Noche anterior: cena rica en carbohidratos, poca fibra", type: "good" },
      { text: "2-3 horas antes: desayuno conocido (no pruebes nada nuevo)", type: "good" },
      { text: "Ejemplo: Tostadas con mermelada + plátano + jugo", type: "example" },
      { text: "30 min antes: medio plátano o gel de carbohidratos", type: "good" },
      { text: "EVITA: lácteos si te sientan mal, comida nueva, exceso de fibra", type: "bad" }
    ]
  }
];

export default function NutricionPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('runplan-pro_session');
      router.push('/login');
    }
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
              🥗 Nutrición para Runners
            </h1>
            <p className="text-base text-muted-foreground">
              Qué comer para rendir mejor y recuperarte rápido
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <div className="space-y-4">
          {NUTRITION_SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border ${section.border} bg-gradient-to-br ${section.color} overflow-hidden`}
            >
              <button
                onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center gap-4"
              >
                <span className="text-3xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {section.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                      {section.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {expanded === section.id ? 'Toca para ocultar' : 'Toca para ver más'}
                  </p>
                </div>
                <motion.svg
                  animate={{ rotate: expanded === section.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-muted-foreground flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {expanded === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2"
                >
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                        item.type === 'good'
                          ? 'bg-green-500/10 text-muted-foreground'
                          : item.type === 'bad'
                          ? 'bg-red-500/10 text-muted-foreground'
                          : item.type === 'example'
                          ? 'bg-blue-500/10 text-muted-foreground border border-blue-500/20'
                          : 'bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      <span className="flex-shrink-0 text-base">
                        {item.type === 'good' ? '✅' : item.type === 'bad' ? '❌' : item.type === 'example' ? '💡' : 'ℹ️'}
                      </span>
                      <span className="leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}
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
            🥇 Regla de Oro
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Nunca pruebes comida nueva el día de la carrera. Solo come lo que ya
            sabes que te sienta bien. ¡El estómago es el primer crítico!
          </p>
        </motion.div>
      </div>
    </main>
  );
}