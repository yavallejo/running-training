// Helper functions moved outside component for performance

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

import { TrainingSession } from "./training-plan";

export function checkBlockedSessions(sessionsData: TrainingSession[], todayStr: string): TrainingSession[] {
  const todayDate = parseLocalDate(todayStr);
  
  return sessionsData.map(s => {
    if (s.rescheduled && !s.completed) {
      const rescheduledDate = parseLocalDate(s.date);
      if (rescheduledDate < todayDate) {
        return { ...s, blocked: true };
      }
    }
    return s;
  });
}
