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
    title: "Movilidad de Tobillas",
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
      localStorage.removeItem('runplan-pro_session');
      router.push('/login');
    }
  };

  const data = activeTab === 'warmup' ? WARMUP : COOLDOWN;
  const warmupColor = 'from-orange-500/10 to-orange-500/5 border-orange-500/20';
  const cooldownColor = 'from-blue-500/10 to-blue-500/5 border-blue-500/20';

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
              🧘 Calentamiento y Enfriamiento
            </h1>
            <p className="text-base text-muted-foreground">
              Rutinas para preparar y recuperar tu cuerpo
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('warmup')}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all text-base font-semibold ${
              activeTab === 'warmup'
                ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                : 'border-border bg-surface text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            🔥 Calentamiento
          </button>
          <button
            onClick={() => setActiveTab('cooldown')}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all text-base font-semibold ${
              activeTab === 'cooldown'
                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                : 'border-border bg-surface text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            ❄️ Enfriamiento
          </button>
        </div>

        <div className={`rounded-2xl border ${activeTab === 'warmup' ? warmupColor : cooldownColor} p-5 mb-6 text-center`}>
          <p className="text-sm text-muted-foreground mb-1">Duración total recomendada</p>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne)" }}>
            {activeTab === 'warmup' ? '8-12 minutos' : '10-15 minutos'}
          </p>
        </div>

        <div className="space-y-4">
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border ${activeTab === 'warmup' ? 'border-orange-500/20 bg-orange-500/5' : 'border-blue-500/20 bg-blue-500/5'} p-5`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                  activeTab === 'warmup' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      activeTab === 'warmup' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-base text-muted-foreground mb-3">
                    {item.description}
                  </p>
                  <div className="bg-background/60 rounded-xl p-4 space-y-2">
                    {item.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activeTab === 'warmup' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-base text-muted-foreground leading-relaxed">
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
          className={`mt-8 rounded-2xl border p-5 text-center ${
            activeTab === 'warmup'
              ? 'border-orange-500/20 bg-orange-500/5'
              : 'border-blue-500/20 bg-blue-500/5'
          }`}
        >
          <p className={`text-base font-semibold mb-2 ${
            activeTab === 'warmup' ? 'text-orange-500' : 'text-blue-500'
          }`}>
            ⚠️ Recordatorio
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {activeTab === 'warmup'
              ? 'Nunca hagas estiramientos estáticos (mantenidos) antes de correr. Solo hazlos después del entrenamiento.'
              : 'Mantén cada estiramiento al menos 30 segundos. No rebotes, estira suave y sostenido.'}
          </p>
        </motion.div>
      </div>
    </main>
  );
}