"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const WARMUP = [
  {
    id: "caminata",
    title: "Caminata Rápida",
    duration: "3-5 min",
    icon: "🚶‍♀️",
    description: "Camina a paso ligero, con brazos balanceando. Siente el ritmo cardíaco subir suavemente.",
    steps: [
      "Postura erguida, mirada al frente",
      "Balanceo natural de brazos",
      "Paso firme pero no brusco",
      "Siente el talón al frente, empuja con el dedo gordo"
    ]
  },
  {
    id: "tobillos",
    title: "Movilidad de Tobillos",
    duration: "1 min",
    icon: "🔄",
    description: "Círculos suaves con los pies para lubricar las articulaciones.",
    steps: [
      "Apóyate en una pared o árbol",
      "Levanta un pie, haz círculos con el tobillo",
      "10 círculos hacia cada lado",
      "Cambia de pie y repite"
    ]
  },
  {
    id: "rodillas",
    title: "Movilidad de Rodillas",
    duration: "1 min",
    icon: "🦵",
    description: "Activa cuádriceps y prepara las rodillas para el impacto.",
    steps: [
      "Pies juntos, manos en rodillas",
      "Haz círculos suaves con las rodillas",
      "10 círculos hacia cada lado",
      "Mantén el core activo"
    ]
  },
  {
    id: "caderas",
    title: "Movilidad de Caderas",
    duration: "1 min",
    icon: "💃",
    description: "Las caderas son clave para una zancada eficiente.",
    steps: [
      "Pies separados al ancho de hombros",
      "Círculos con la pelvis (hula hop)",
      "10 círculos hacia cada lado",
      "Inclina levemente el tronco hacia adelante"
    ]
  },
  {
    id: "hombros",
    title: "Movilidad de Hombros",
    duration: "1 min",
    icon: "🤸‍♀️",
    description: "Evita la tensión en el cuello y mejora el balanceo de brazos.",
    steps: [
      "Brazo extendidos al costado",
      "Círculos hacia adelante 10 veces",
      "Círculos hacia atrás 10 veces",
      "Sube y baja hombros 10 veces"
    ]
  },
  {
    id: "trote",
    title: "Trote Muy Suave",
    duration: "2 min",
    icon: "🏃‍♀️",
    description: "Activa el sistema cardiovascular antes del entrenamiento real.",
    steps: [
      "Ritmo muy lento, 60% de esfuerzo",
      "Respiración libre y relajada",
      "Zancada corta y rápida",
      "Si te cuesta, camina un poco"
    ]
  }
];

const COOLDOWN = [
  {
    id: "caminata-enfriamiento",
    title: "Caminata de Enfriamiento",
    duration: "5-8 min",
    icon: "🚶‍♀️",
    description: "Baja el ritmo cardíaco gradualmente. No te detengas de golpe.",
    steps: [
      "Paso muy lento, casi un paseo",
      "Respiración profunda y controlada",
      "Siente cómo el corazón se calma",
      "Aprovecha para relajar hombros y cuello"
    ]
  },
  {
    id: "estiramiento-pantorrilla",
    title: "Estiramiento de Pantorrilla",
    duration: "30 seg c/u",
    icon: "🦵",
    description: "Fundamental para evitar lesiones en el tendón de Aquiles.",
    steps: [
      "Apóyate en una pared",
      "Una pierna atrás, talón pegado al suelo",
      "Inclina el cuerpo hacia la pared",
      "Siente el estiramiento en la pantorrilla"
    ]
  },
  {
    id: "estiramiento-cuadriceps",
    title: "Estiramiento de Cuádriceps",
    duration: "30 seg c/u",
    icon: "🍗",
    description: "Estira la parte frontal del muslo.",
    steps: [
      "Parada, sujeta un tobillo con la mano",
      "Lleva el talón hacia los glúteos",
      "Mantén rodillas juntas",
      "No te inclines hacia adelante"
    ]
  },
  {
    id: "estiramiento-hamstring",
    title: "Estiramiento de Isquiotibiales",
    duration: "30 seg c/u",
    icon: "🦵",
    description: "Parte posterior del muslo, muy importante para corredores.",
    steps: [
      "Sentada o de pie con una pierna adelantada",
      "Inclina el tronco desde la cadera (no la espalda)",
      "Mantén la rodilla ligeramente doblada",
      "Siente el estiramiento en la parte posterior"
    ]
  },
  {
    id: "estiramiento-cadera",
    title: "Estiramiento de Cadera y Glúteo",
    duration: "30 seg c/u",
    icon: "💺",
    description: "Alivia la tensión acumulada en la zona baja.",
    steps: [
      "Tumbada boca arriba",
      "Lleva una rodilla al pecho",
      "Sujeta con ambas manos",
      "Siente el estiramiento en glúteo y cadera"
    ]
  },
  {
    id: "estiramiento-espalda",
    title: "Estiramiento de Espalda Baja",
    duration: "30 seg",
    icon: "🧘‍♀️",
    description: "Relaja la zona lumbar tras el impacto.",
    steps: [
      "Posición de niño (rodillas al pecho, frente al suelo)",
      "Brazo extendidos hacia adelante",
      "Siente el estiramiento en toda la espalda",
      "Respira profundamente"
    ]
  }
];

export default function CalentamientoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'warmup' | 'cooldown'>('warmup');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yadira_session');
      router.push('/login');
    }
  };

  const data = activeTab === 'warmup' ? WARMUP : COOLDOWN;
  const color = activeTab === 'warmup' ? 'from-orange-500/10 to-red-500/5 border-orange-500/20' : 'from-blue-500/10 to-cyan-500/5 border-blue-500/20';

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors mb-2 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              🧘 Calentamiento y Enfriamiento
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-foreground/50">
              Rutinas visuales para preparar y recuperar tu cuerpo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('warmup')}
            className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
              activeTab === 'warmup'
                ? 'border-orange-500/50 bg-orange-500/10 text-orange-600'
                : 'border-foreground/10 text-foreground/50 hover:border-foreground/20'
            }`}
          >
            🔥 Calentamiento
          </button>
          <button
            onClick={() => setActiveTab('cooldown')}
            className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
              activeTab === 'cooldown'
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-600'
                : 'border-foreground/10 text-foreground/50 hover:border-foreground/20'
            }`}
          >
            ❄️ Enfriamiento
          </button>
        </div>

        {/* Total Duration */}
        <div className={`rounded-xl border ${color} p-4 mb-6 text-center`}>
          <p className="text-xs text-foreground/50 mb-1">Duración total recomendada</p>
          <p className="text-lg font-bold text-foreground">
            {activeTab === 'warmup' ? '8-12 minutos' : '10-15 minutos'}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border ${activeTab === 'warmup' ? 'border-orange-500/20 bg-orange-500/5' : 'border-blue-500/20 bg-blue-500/5'} p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  activeTab === 'warmup' ? 'bg-orange-500/20 text-orange-600' : 'bg-blue-500/20 text-blue-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === 'warmup' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-foreground/60 mb-2">
                    {item.description}
                  </p>
                  <div className="bg-background/50 rounded-lg p-2.5 space-y-1.5">
                    {item.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${
                          activeTab === 'warmup' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-[10px] sm:text-[11px] text-foreground/70 leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`mt-6 sm:mt-8 rounded-xl border p-4 sm:p-5 text-center ${
            activeTab === 'warmup'
              ? 'border-orange-500/20 bg-orange-500/5'
              : 'border-blue-500/20 bg-blue-500/5'
          }`}
        >
          <p className={`text-xs sm:text-sm font-medium mb-1 ${
            activeTab === 'warmup' ? 'text-orange-600' : 'text-blue-600'
          }`}>
            ⚠️ Recordatorio
          </p>
          <p className="text-[11px] sm:text-xs text-foreground/60 leading-relaxed">
            {activeTab === 'warmup'
              ? 'Nunca hagas estiramientos estáticos (mantenidos) antes de correr. Solo hazlos después del entrenamiento.'
              : 'Mantén cada estiramiento al menos 30 segundos. No rebotes, estira suave y sostenido.'}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
