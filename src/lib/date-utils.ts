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
  const date = parseLocalDate(dateStr);
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

export function getRaceDeadline(raceDate: string, daysAfter: number = 10): Date {
  const deadline = parseLocalDate(raceDate);
  deadline.setDate(deadline.getDate() + daysAfter);
  return deadline;
}

export function getDaysAgo(raceDate: string): number {
  const race = parseLocalDate(raceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - race.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function parseTimeToSeconds(time: string): number | null {
  const match = time.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3], 10);
  return h * 3600 + m * 60 + s;
}

export function formatTimeFromSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
