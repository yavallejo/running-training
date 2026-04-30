"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const FAQ_ITEMS = [
  {
    q: "¿Es normal que me duelan las piernas al día siguiente?",
    a: "SÍ, es totalmente normal. Se llama DOMS (dolor muscular de aparición tardía). Aparece 24-48h después del ejercicio. Es señal de que tus músculos se están adaptando. Si el dolor es muy fuerte, descansa un día extra.",
    icon: "🦵"
  },
  {
    q: "¿Qué hago si no puedo terminar los 3km de la primera sesión?",
    a: "No te preocupes. Alterna 2 min trotando y 2 min caminando. Lo importante es completar la distancia total, no cómo lo haces. En unas semanas estarás corriendo sin parar.",
    icon: "😰"
  },
  {
    q: "¿Puedo caminar durante la carrera de 7km?",
    a: "¡CLARO QUE SÍ! La mayoría de los principiantes caminan. Usa la técnica: corre 10 min, camina 1 min. Nadie te juzga, tú vas a tu ritmo. Cruzar la meta es lo que cuenta.",
    icon: "🚶‍♀️"
  },
  {
    q: "¿Cómo evito los calambres?",
    a: "Hidrátate bien antes, durante y después. Come alimentos ricos en potasio (plátanos, naranjas). Si sientes un calambre: detente, estira suavemente el músculo afectado y masajea.",
    icon: "⚡"
  },
  {
    q: "¿Es mejor correr en la mañana o en la tarde?",
    a: "Lo mejor es cuando te sientas con más energía y cuando haya menos calor. En días calurosos, corre temprano (6-8 AM) o al atardecer. Lo importante es la constancia, no la hora.",
    icon: "🌅"
  },
  {
    q: "¿Cada cuánto debo reemplazar mis zapatillas?",
    a: "Cada 500-800 km o cada 6-8 meses si corres regularmente. Señales: la suela está muy gastada, ya no amortigua bien, o te duelen las rodillas después de correr.",
    icon: "👟"
  },
  {
    q: "¿Debo estirar antes de correr?",
    a: "NO hagas estiramientos estáticos (mantenidos) antes. Solo haz movilidad articular suave y caminata rápida. Los estiramientos mantenidos deben ser DESPUÉS de correr, durante el enfriamiento.",
    icon: "🧘‍♀️"
  },
  {
    q: "¿Qué hago si llueve el día de mi entrenamiento?",
    a: "Si llueve poco: usa chubasquero ligero y gorra con visera. Si llueve fuerte: reagenda la sesión para otro día (tienes 1 reprogramación por sesión). La seguridad primero.",
    icon: "🌧️"
  },
  {
    q: "¿Cómo controlo la respiración cuando me falta el aire?",
    a: "DESACELERA inmediatamente. Usa el patrón 3:3 (3 pasos inhalando, 3 exhalando). Si no mejora en 1 minuto, camina hasta recuperarte. Nunca fuerces la respiración.",
    icon: "🫁"
  },
  {
    q: "¿Puedo correr si estoy resfriada?",
    a: "Regla del cuello: si los síntomas están arriba del cuello (nariz tapada, estornudos), puedes correr suave. Si están abajo (fiebre, tos con flema, dolor muscular), descansa hasta recuperarte.",
    icon: "🤒"
  },
  {
    q: "¿Cuánto tiempo antes de la carrera debo dejar de comer?",
    a: "Deja 2-3 horas entre una comida completa y el inicio de la carrera. Si tienes hambre 1 hora antes, come medio plátano o un poco de gel de carbohidratos.",
    icon: "🍌"
  },
  {
    q: "¿Cómo evito rozaduras (chafing)?",
    a: "Usa ropa sin costuras que rocen. Aplica vaselina en pezones, entrepierna y axilas antes de correr. También ayuda usar ropa técnica (no algodón) que evacue la sudoración.",
    icon: "🩹"
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

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
              ❓ Preguntas Frecuentes
            </h1>
            <p className="text-base text-muted-foreground">
              Respuestas para las dudas más comunes de principiantes
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                expanded === index
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-surface hover:bg-surface-elevated'
              }`}
            >
              <button
                onClick={() => setExpanded(expanded === index ? null : index)}
                className="w-full text-left p-4 flex items-start gap-4"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-foreground text-left">
                    {item.q}
                  </h3>
                  {expanded === index && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-base text-muted-foreground leading-relaxed text-left"
                    >
                      {item.a}
                    </motion.p>
                  )}
                </div>
                <motion.svg
                  animate={{ rotate: expanded === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center"
        >
          <p className="text-base font-semibold text-green-500 mb-2">
            💪 ¿Tienes otra duda?
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Recuerda: todas las corredoras principiantes tienen las mismas dudas.
            No estás sola. ¡Pregunta y sigue adelante!
          </p>
        </motion.div>
      </div>
    </main>
  );
}