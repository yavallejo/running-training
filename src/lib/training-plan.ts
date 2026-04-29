export const PLAN_VERSION = "2.0"; // Incrementar cuando se actualicen las descripciones

export interface TrainingSession {
  id: string;
  date: string; // ISO date string
  originalDate?: string; // Original date if rescheduled
  dayLabel: string; // e.g., "Miércoles 29 Abr"
  workout: string;
  details: string;
  distance: number; // in km
  targetPace: string; // e.g., "~11 min/km"
  completed: boolean;
  rescheduled: boolean; // If it was rescheduled
  rescheduleUsed: boolean; // If chance was used
  blocked: boolean; // If missed after reschedule
}

export function generateTrainingPlan(): TrainingSession[] {
  const baseSessions = [
    {
      id: "session-1",
      date: "2026-04-29",
      dayLabel: "Miércoles 29 Abr",
      workout: "3 km continuo o combinado",
      details: "Comienza con 5 minutos de caminata rápida para calentar. Si te sientes bien, intenta trotar de forma continua a un ritmo donde puedas mantener una conversación (aprox. 11 min/km). Si sientes fatiga, alterna 3 min trotando y 1 min caminando. Mantén la espalda recta, hombros relajados y respiración profunda por la nariz. Al terminar, camina 5 minutos para enfriar y estira suavemente piernas y cadera.",
      distance: 3,
      targetPace: "~11 min/km",
    },
    {
      id: "session-2",
      date: "2026-05-01",
      dayLabel: "Viernes 1 May",
      workout: "3.5 km combinado",
      details: "Calienta 5 min caminando. Realiza bloques de 3 min trotando a ritmo cómodo y 1 min caminando, repite hasta completar 3.5 km. Concéntrate en una zancada corta y rápida, evita pasos muy largos que puedan causar molestias. Hidrátate antes y después. Escucha a tu cuerpo: si el ritmo es muy exigente, camina un poco más. Termina con estiramientos de gemelos y cuádriceps.",
      distance: 3.5,
      targetPace: "~11 min/km",
    },
    {
      id: "session-3",
      date: "2026-05-03",
      dayLabel: "Domingo 3 May",
      workout: "3.5 km continuo",
      details: "Día de reto: intenta correr de forma continua los 3.5 km a ritmo relajado. Si necesitas caminar, hazlo solo 30-60 segundos y retoma el trote. Mantén un ritmo donde puedas respirar cómodamente por la boca. Usa ropa cómoda y zapatillas adecuadas. Visualiza el progreso que has logrado en solo tres sesiones. Al finalizar, celebra tu constancia con 5 minutos de caminata y estiramientos profundos.",
      distance: 3.5,
      targetPace: "~11 min/km",
    },
    {
      id: "session-4",
      date: "2026-05-06",
      dayLabel: "Miércoles 6 May",
      workout: "4 km combinado",
      details: "Calentamiento de 5 min caminando. Alterna 4 min trotando y 1 min caminando hasta completar 4 km. Enfócate en una respiración rítmica: inhala 3 pasos, exhala 3 pasos. Mantén el core (abdomen) ligeramente apretado para ayudar a la postura. Si sientes dolor agudo, detente; molestias leves son normales. Hidrátate durante el recorrido si es necesario. Al terminar, camina 5 min y estira especialmente la fascia plantar y pantorrillas.",
      distance: 4,
      targetPace: "~11 min/km",
    },
    {
      id: "session-5",
      date: "2026-05-08",
      dayLabel: "Viernes 8 May",
      workout: "4 km continuo",
      details: "Intenta correr de forma continua los 4 km a ritmo cómodo (~11 min/km). Si el cuerpo pide un descanso, camina máximo 1 minuto y continúa. Mantén los hombros bajos y relajados, evita tensión en el cuello. Usa esta sesión para encontrar tu ritmo ideal: ni muy lento que sea caminata, ni muy rápido que agotes rápido. Hidrátate bien antes y después. Celebra estar alcanzando distancias cada vez mayores.",
      distance: 4,
      targetPace: "~11 min/km",
    },
    {
      id: "session-6",
      date: "2026-05-10",
      dayLabel: "Domingo 10 May",
      workout: "4.5 km continuo",
      details: "Calienta 5 min caminando. Corre de forma continua 4.5 km a ritmo muy cómodo. Concéntrate en disfrutar el entorno y mantener una respiración constante. Si sientes fatiga en los últimos 1.5 km, acorta la zancada pero mantén la cadencia. Escucha a tu cuerpo: es normal sentir algo de cansancio, pero no debe ser doloroso. Termina con 5 min de caminata muy suave y estiramientos completos de piernas, espalda y cadera.",
      distance: 4.5,
      targetPace: "~11 min/km",
    },
    {
      id: "session-7",
      date: "2026-05-13",
      dayLabel: "Miércoles 13 May",
      workout: "5 km continuo",
      details: "¡GRAN DÍA! Primer intento de 5 km. Calienta bien con 8 min de caminata progresiva. Corre a ritmo muy cómodo (11-12 min/km), concéntrate en mantener un ritmo constante y sostenido. Divide mentalmente en 3 partes: 0-2 km (cómodo), 2-4 km (mantener), 4-5 km (empujar suave). No te preocupes si caminas unos minutos, lo importante es completar la distancia. Al terminar, tómate fotos y celebra este gran logro.",
      distance: 5,
      targetPace: "~11 min/km",
    },
    {
      id: "session-8",
      date: "2026-05-15",
      dayLabel: "Viernes 15 May",
      workout: "5 km continuo",
      details: "Consolida los 5 km corriendo de forma continua a ritmo cómodo. Mantén una postura erguida: mirada al frente, hombros atrás y abajo, brazos balanceando de forma natural. Controla la respiración para evitar hiperventilación. Si el ritmo se siente muy pesado, no dudes en caminar 1-2 minutos y retomar. Hidrátate bien. Esta sesión confirma que tu cuerpo está adaptándose a distancias mayores. Termina con estiramientos largos.",
      distance: 5,
      targetPace: "~11 min/km",
    },
    {
      id: "session-9",
      date: "2026-05-17",
      dayLabel: "Domingo 17 May",
      workout: "6 km progresivo",
      details: "Calienta 5 min caminando. Corre 6 km a ritmo cómodo (11 min/km). Los últimos 2 km puedes aumentar ligeramente el ritmo si te sientes bien, pero sin agotarte. Mantén hidratación durante el recorrido si es posible. Es normal sentir más fatiga en distancias mayores, camina si lo requieres sin culpa. Esta sesión es clave para preparar el cuerpo para el evento de 7 km. Al terminar, enfriamiento de 8 min caminando.",
      distance: 6,
      targetPace: "~11 min/km",
    },
    {
      id: "session-10",
      date: "2026-05-20",
      dayLabel: "Miércoles 20 May",
      workout: "6 km continuo",
      details: "Casi llegas a la meta. Corre 6 km de forma continua a ritmo constante y cómodo. Visualiza el día del evento: tu ritmo, tu respiración, tu determinación. Mantén una zancada eficiente y brazos relajados. Si sientes dolor agudo, detente; si es fatiga normal, camina 1 minuto y continúa. Hidrátate bien. Esta sesión consolida tu resistencia para los 7 km del evento. Celebra estar a solo 4 días del evento.",
      distance: 6,
      targetPace: "~11 min/km",
    },
    {
      id: "session-11",
      date: "2026-05-22",
      dayLabel: "Viernes 22 May",
      workout: "4 km fácil (Taper)",
      details: "Día de activación suave: corre 4 km a ritmo muy cómodo (11-12 min/km) para mantener las piernas activas sin fatigarlas. No intentes mejorar tiempos ni distancias hoy, solo activa músculos. Calienta 8 min caminando y termina con 8 min de enfriamiento. Hidrátate bien y come carbohidratos complejos después. Duerme bien estos dos días previos. ¡Estás lista para el evento del domingo! Confía en tu entrenamiento.",
      distance: 4,
      targetPace: "~11-12 min/km",
    },
  ];

  // Add default values for new fields
  return baseSessions.map(s => ({
    ...s,
    completed: false,
    rescheduled: false,
    rescheduleUsed: false,
    blocked: false,
  }));
}

export const EVENT_DATE = "2026-05-24";
export const EVENT_DISTANCE = 7; // km
export const EVENT_NAME = "Carrera Recreativa 7km";
