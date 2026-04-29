"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    id: "zapatillas",
    icon: "👟",
    title: "Elegir las Zapatillas Correctas",
    color: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    content: [
      {
        subtitle: "Tipos de pisada",
        text: "Existen 3 tipos principales: pronadora (pie se inclina hacia adentro), supinadora (hacia afuera) y neutral. La mayoría de las personas tienen pisada neutral."
      },
      {
        subtitle: "Cómo saber tu tipo de pisada",
        text: "Haz la 'prueba del papel': moja la planta de tu pie y písalo en una hoja. Si ves la mayor parte del pie, eres pronadora. Si ves muy poco, eres supinadora. Si ves la mitad, es neutral."
      },
      {
        subtitle: "Recomendaciones por tipo",
        items: [
          "Neutral: Zapatillas con buena amortiguación (Nike Pegasus, Adidas Boost)",
          "Pronadora: Zapatillas con control de estabilidad (Asics Kayano, Brooks Adrenaline)",
          "Supinadora: Zapatillas con mucha amortiguación y flexibilidad (Hoka, New Balance Fresh Foam)"
        ]
      },
      {
        subtitle: "Talla correcta",
        text: "Deja un espacio de un pulgar entre tu dedo más largo y la punta. Las zapatillas para correr deben ser medio número más grandes que tu calzado habitual."
      }
    ]
  },
  {
    id: "ropa",
    icon: "👕",
    title: "Ropa Adecuada para Correr",
    color: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    content: [
      {
        subtitle: "Materiales recomendados",
        text: "Usa siempre ropa técnica que evacúe la sudoración (poliéster, nylon, spandex). EVITA el algodón, ya que se empapa y puede causar rozaduras."
      },
      {
        subtitle: "Según el clima",
        items: [
          "Clima cálido: Ropa ligera, clara, manga corta, calcetines finos",
          "Clima frío: Capas (3 capas): térmica, isolante, cortavientos. Guantes y gorro",
          "Lluvia: Chubasquero ligero, gorra con visera, calcetines de compresión",
          "Todo clima: Never ignore sunscreen (SPF 50+) en cara y brazos"
        ]
      },
      {
        subtitle: "Sujetador deportivo (mujer)",
        text: "Esencial para evitar molestias. Debe tener soporte alto si tu copa es C o mayor. Cambiar cada 6 meses o 100 lavados."
      },
      {
        subtitle: "Calcetines",
        text: "Usa calcetines técnicos (Coolmax, merino) que lleguen al tobillo. Evita costuras que puedan causar ampollas."
      }
    ]
  },
  {
    id: "respiracion",
    icon: "🫁",
    title: "Cómo Respirar Correctamente",
    color: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
    content: [
      {
        subtitle: "Respiración rítmica",
        text: "Usa el patrón 3:3 (inhala 3 pasos, exhala 3 pasos) para ritmos cómodos (~11 min/km). Esto evita hiperventilación."
      },
      {
        subtitle: "Respiración diafragmática",
        text: "Inhala profundamente por la nariz expandiendo el abdomen, no el pecho. Esto oxigena mejor y reduce la fatiga."
      },
      {
        subtitle: "Por la nariz o boca",
        text: "Para ritmos suaves, respira por la nariz. Si necesitas más aire, abre también la boca. En clima frío, siempre por la nariz para calentar el aire."
      },
      {
        subtitle: "Si te falta el aire",
        text: "Desacelera inmediatamente. Haz 3 respiraciones profundas. Si no mejora en 1 minuto, camina. No fuerces."
      }
    ]
  },
  {
    id: "calentamiento-info",
    icon: "🔥",
    title: "Importancia del Calentamiento",
    color: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
    content: [
      {
        subtitle: "¿Por qué calentar?",
        text: "Prepara músculos y articulaciones, aumenta la temperatura corporal, activa el sistema cardiovascular y reduce el riesgo de lesiones en un 50%."
      },
      {
        subtitle: "Duración ideal",
        text: "5-10 minutos es suficiente. No hagas estiramientos estáticos (mantenidos) antes de correr, esto debilita los músculos temporalmente."
      },
      {
        subtitle: "Secuencia recomendada",
        items: [
          "1. Caminata rápida 3-5 minutos",
          "2. Movilidad articular: tobillos, rodillas, caderas, hombros",
          "3. Trote muy suave 2 minutos (60% esfuerzo)",
          "4. 5 saltos suaves en el lugar"
        ]
      },
      {
        subtitle: "Enfriamiento (Cool-down)",
        text: "Al terminar, camina 5-8 minutos para bajar el ritmo cardíaco gradualmente. Luego sí, estiramientos estáticos de 30 segundos."
      }
    ]
  },
  {
    id: "dolor-lesion",
    icon: "🩹",
    title: "Dolor vs Lesión: Cómo Diferenciar",
    color: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
    content: [
      {
        subtitle: "Dolor normal (DOMS)",
        text: "Molestia muscular leve, rigidez al día siguiente del entrenamiento. Es señal de adaptación. Desaparece en 24-48 horas."
      },
      {
        subtitle: "Señales de alarma (lesión)",
        items: [
          "Dolor agudo que te hace cojear",
          "Dolor que empeora durante la carrera",
          "Hinchazón, calor o enrojecimiento localizado",
          "Dolor en un solo punto específico (no generalizado)",
          "Dolor que no mejora tras 3 días de descanso"
        ]
      },
      {
        subtitle: "¿Qué hacer ante dolor?",
        text: "Si es leve: hielo 15 min, masaje suave, estiramientos. Si es agudo: detente inmediatamente, descansa 2-3 días, usa hielo y antiinflamatorios si es necesario."
      },
      {
        subtitle: "Prevención",
        text: "Nunca aumentes más del 10% la distancia semanal. Usa zapatillas adecuadas. Haz estiramientos post-entrenamiento siempre."
      }
    ]
  }
];

export default function GuiaPrincipiantePage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yadira_session');
      router.push('/login');
    }
  };

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
              📚 Guía del Runner Principiante
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-foreground/50">
              Todo lo que necesitas saber para empezar con buen pie
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border ${section.border} bg-gradient-to-br ${section.color} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start gap-3"
              >
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">
                    {section.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-foreground/40">
                    {expandedSection === section.id ? 'Click para contraer' : 'Click para expandir'}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-foreground/40 transition-transform flex-shrink-0 mt-0.5 ${expandedSection === section.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3"
                >
                  {section.content.map((item, i) => (
                    <div
                      key={i}
                      className="bg-background/50 rounded-lg p-3 border border-foreground/5"
                    >
                      <h4 className="text-xs font-medium text-primary mb-1.5">
                        {item.subtitle}
                      </h4>
                      {item.text && (
                        <p className="text-[11px] sm:text-xs text-foreground/70 leading-relaxed">
                          {item.text}
                        </p>
                      )}
                      {item.items && (
                        <ul className="space-y-1">
                          {item.items.map((it, j) => (
                            <li key={j} className="text-[11px] sm:text-xs text-foreground/70 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      )}
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
          className="mt-6 sm:mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 text-center"
        >
          <p className="text-xs sm:text-sm font-medium text-primary mb-1">
            💡 Tip Pro
          </p>
          <p className="text-[11px] sm:text-xs text-foreground/60 leading-relaxed">
            La constancia vence al talento. No importa si vas lento, lo importante es no detenerse.
            ¡Cada kilómetro cuenta! 🏃‍♀️
          </p>
        </motion.div>
      </div>
    </main>
  );
}
