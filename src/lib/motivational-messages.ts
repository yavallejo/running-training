export interface MotivationalMessage {
  id: string;
  text: string;
  icon: string;
  condition: (sessionNumber: number, totalSessions: number, completedCount: number) => boolean;
  priority: number; // higher = shown first
}

export const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  // Mensajes por sesión específica
  {
    id: "first-session",
    text: "¡Hoy empieza todo! No te preocupes por la velocidad, solo sal y disfruta.",
    icon: "🎉",
    condition: (n) => n === 1,
    priority: 100
  },
  {
    id: "fifth-session",
    text: "¡Vas por la sesión 5! Tu cuerpo ya está empezando a adaptarse.",
    icon: "💪",
    condition: (n) => n === 5,
    priority: 90
  },
  {
    id: "five-km",
    text: "¡HOY ES EL DÍA DE LOS 5KM! Tómalo con calma, respira y disfruta el momento.",
    icon: "🏆",
    condition: (n) => n === 7,
    priority: 100
  },
  {
    id: "six-km",
    text: "¡6 km! Estás a un paso de los 7 km del evento. ¡Qué orgullo!",
    icon: "🔥",
    condition: (n) => n === 9 || n === 10,
    priority: 95
  },
  {
    id: "taper",
    text: "Hoy es día de activación suave. Confía en tu entrenamiento, estás lista.",
    icon: "✨",
    condition: (n) => n === 11,
    priority: 100
  },
  // Mensajes por progreso general
  {
    id: "25-percent",
    text: "¡25% del plan completado! Vas por muy buen camino.",
    icon: "🎯",
    condition: (_, __, completed) => completed === 3,
    priority: 80
  },
  {
    id: "50-percent",
    text: "¡META 50%! Has completado la mitad del plan. Eres increíble.",
    icon: "🏅",
    condition: (_, total, completed) => completed === Math.floor(total / 2),
    priority: 85
  },
  {
    id: "75-percent",
    text: "¡75% completado! La meta está a la vista. ¡Vamos!",
    icon: "🚀",
    condition: (_, total, completed) => completed === Math.floor(total * 0.75),
    priority: 85
  },
  {
    id: "last-session",
    text: "¡ÚLTIMA SESIÓN! Mañana es el gran día. Confía en ti.",
    icon: "🏁",
    condition: (_, total, completed) => completed === total - 1,
    priority: 100
  },
  // Mensajes emocionales
  {
    id: "need-motivation",
    text: "Recuerda: cada paso cuenta. No importa qué tan lento vayas, lo importante es no detenerte.",
    icon: "💡",
    condition: (_, __, completed) => completed > 0 && completed % 3 === 0,
    priority: 60
  },
  {
    id: "rainy-day",
    text: "Si llueve, no te preocupes. Puedes reagendar esta sesión. Lo importante es no rendirse.",
    icon: "🌧️",
    condition: () => false, // Se activa manualmente según clima
    priority: 50
  },
  {
    id: "tired",
    text: "Si hoy te sientes cansada, está bien ir más lento. Escucha a tu cuerpo.",
    icon: "😴",
    condition: () => false, // Se activa con seguimiento de bienestar
    priority: 55
  },
  // Mensajes genéricos de ánimo
  {
    id: "you-got-this",
    text: "¡Tú puedes! Cada kilómetro te hace más fuerte.",
    icon: "💪",
    condition: () => true,
    priority: 10
  },
  {
    id: "enjoy",
    text: "Disfruta el recorrido. Correr no es solo llegar, es sentirse libre.",
    icon: "🏃‍♀️",
    condition: () => true,
    priority: 10
  },
  {
    id: "believe",
    text: "Cree en ti. Has entrenado para esto.",
    icon: "✨",
    condition: () => true,
    priority: 10
  }
];

export function getTodaysMessage(
  sessionNumber: number,
  totalSessions: number,
  completedCount: number
): { text: string; icon: string } | null {
  const applicable = MOTIVATIONAL_MESSAGES
    .filter(m => m.condition(sessionNumber, totalSessions, completedCount))
    .sort((a, b) => b.priority - a.priority);

  if (applicable.length === 0) return null;

  // Rotar mensajes genéricos según el día
  const genericMessages = applicable.filter(m => m.priority <= 10);
  const specificMessages = applicable.filter(m => m.priority > 10);

  if (specificMessages.length > 0) {
    return { text: specificMessages[0].text, icon: specificMessages[0].icon };
  }

  // Rotar mensajes genéricos basado en el número de sesión
  const message = genericMessages[sessionNumber % genericMessages.length];
  return { text: message.text, icon: message.icon };
}
