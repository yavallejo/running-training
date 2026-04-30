"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const TECHNIQUE_SECTIONS = [
  {
    id: "postura",
    icon: "🧍‍♀️",
    title: "Postura Correcta",
    color: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/20",
    tips: [
      { text: "Espalda recta pero relajada, no rígida", correct: true },
      { text: "Mirada al frente, no mires al suelo", correct: true },
      { text: "Hombros atrás y abajo, alejados de las orejas", correct: true },
      { text: "Leve inclinación hacia adelante desde los tobillos (no la cintura)", correct: true },
      { text: "Core (abdomen) ligeramente apretado para estabilidad", correct: true },
      { text: "Cabeza alineada con la columna, mentón paralelo al suelo", correct: true }
    ],
    wrong: [
      "Encorvar la espalda",
      "Mirar al suelo (causa tensión en cuello)",
      "Subir los hombros (genera fatiga)",
      "Inclinarse mucho desde la cintura"
    ]
  },
  {
    id: "zancada",
    icon: "👣",
    title: "Zancada Eficiente",
    color: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    tips: [
      { text: "Zancada corta y rápida (mayor cadencia = menos impacto)", correct: true },
      { text: "Pie cae bajo el centro de gravedad, no adelante del cuerpo", correct: true },
      { text: "Golpe de media suela o antepié, NO talón adelante", correct: true },
      { text: "Cadencia ideal: 160-180 pasos por minuto", correct: true },
      { text: "No sobrepasar 90-100 cm de longitud de zancada", correct: true }
    ],
    wrong: [
      "Zancadas muy largas (frena el cuerpo y lesiona rodillas)",
      "Golpear fuerte con el talón adelante",
      "Zancada lenta y pesada"
    ]
  },
  {
    id: "brazos",
    icon: "💪",
    title: "Movimiento de Brazos",
    color: "from-purple-500/10 to-violet-500/5",
    border: "border-purple-500/20",
    tips: [
      { text: "Codos doblados a 90°, cerca del cuerpo", correct: true },
      { text: "Balanceo hacia adelante y atrás (NO cruzar el cuerpo)", correct: true },
      { text: "Manos relajadas, como si sostuvieras un huevo", correct: true },
      { text: "Hombros bajos, sin tensión", correct: true },
      { text: "El movimiento de brazos impulsa la zancada", correct: true }
    ],
    wrong: [
      "Cruzar los brazos de izquierda a derecha",
      "Puños apretados o tensos",
      "Subir los hombros al cansarse"
    ]
  },
  {
    id: "respiracion-tec",
    icon: "🫁",
    title: "Respiración y Ritmo",
    color: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
    tips: [
      { text: "Patrón 3:3 (3 pasos inhalando, 3 exhalando) para ~11 min/km", correct: true },
      { text: "Respiración diafragmática: el abdomen sube, no el pecho", correct: true },
      { text: "Inhala por nariz, exhala por boca (o ambas si es necesario)", correct: true },
      { text: "Si te falta el aire: DESACELERA, no aceleres", correct: true }
    ],
    wrong: [
      "Respirar solo por la boca (seca la garganta)",
      "Hiperventilar (respiraciones cortas y superficiales)",
      "Contener la respiración al cansarse"
    ]
  },
  {
    id: "ritmo",
    icon: "⏱️",
    title: "Ritmo (Pace) para Principiantes",
    color: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-500/20",
    tips: [
      { text: "Tu ritmo debe permitirte mantener una conversación (Test de la丽莎)", correct: true },
      { text: "Meta: ~11 min/km para RunPlan Pro. Si es más rápido, DESACELERA", correct: true },
      { text: "Es mejor correr lento pero constante, que rápido y tener que caminar", correct: true },
      { text: "Si no puedes hablar sin jadear, eres DEMASIADO RÁPIDA", correct: true }
    ],
    wrong: [
      "Empezar muy rápido (error #1 de principiantes)",
      "Intentar seguir el ritmo de otros corredores",
      "Acelerar en la segunda mitad (guarda energía)"
    ]
  }
];

export default function TecnicaPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
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
              🏃 Técnica de Carrera
            </h1>
            <p className="text-base text-muted-foreground">
              Correr bien para evitar lesiones y disfrutar más
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
          {TECHNIQUE_SECTIONS.map((section, index) => (
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
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {expanded === section.id ? 'Toca para ocultar' : 'Toca para ver técnica'}
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
                  className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4"
                >
                  <div className="bg-background/60 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-green-500 flex items-center gap-2">
                      <span className="text-lg">✅</span> Hacer
                    </h4>
                    {section.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                        <span className="text-base text-muted-foreground leading-relaxed">
                          {tip.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 space-y-3">
                    <h4 className="text-sm font-semibold text-red-500 flex items-center gap-2">
                      <span className="text-lg">❌</span> Evitar
                    </h4>
                    {section.wrong.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                        <span className="text-base text-muted-foreground leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
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
            💡 Clave del éxito
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Más vale una zancada corta y rápida que una larga y pesada.
            La técnica correcta desde el día 1 evita lesiones futuras. ¡Paciencia!
          </p>
        </motion.div>
      </div>
    </main>
  );
}