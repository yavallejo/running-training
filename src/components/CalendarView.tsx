"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrainingSession } from "@/lib/training-plan";

interface CalendarViewProps {
  sessions: TrainingSession[];
  onSessionClick: (sessionId: string) => void;
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarView({ sessions, onSessionClick }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: ({ day: number; dateStr: string; session: TrainingSession | undefined } | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const session = sessions.find(s => s.date === dateStr);
    calendarDays.push({ day, dateStr, session });
  }

  const getDayStyles = (session: TrainingSession | undefined) => {
    if (!session) return "bg-surface text-muted-foreground/40";
    if (session.completed) return "bg-primary/15 text-primary border border-primary/30";
    if (session.blocked) return "bg-danger/10 text-danger border border-danger/20";
    if (session.rescheduled) return "bg-secondary/15 text-secondary border border-secondary/30";
    if (session.date === todayStr) return "bg-primary/20 text-primary border-2 border-primary font-bold";
    return "bg-surface text-muted-foreground";
  };

  const getSessionIndicator = (session: TrainingSession | undefined) => {
    if (!session) return null;
    if (session.completed) return <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />;
    if (session.blocked) return <div className="w-1.5 h-1.5 rounded-full bg-danger mt-0.5" />;
    if (session.rescheduled) return <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-0.5" />;
    if (session.date === todayStr) return <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 animate-pulse" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-0.5" />;
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-surface border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="w-10 h-10 rounded-xl bg-surface-elevated hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="w-10 h-10 rounded-xl bg-surface-elevated hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 p-3 gap-1.5">
        {DAYS_SHORT.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-muted-foreground/60 py-2">
            {day}
          </div>
        ))}

        {calendarDays.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            onClick={() => {
              if (item?.session) {
                onSessionClick(item.session.id);
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && item?.session) {
                onSessionClick(item.session.id);
              }
            }}
            role="button"
            tabIndex={item?.session ? 0 : -1}
            aria-label={item ? (item.session ? `Sesión ${item.day}: ${item.session.workout}` : `Día ${item.day}`) : `Día vacío ${index}`}
            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all min-h-[48px] ${
              item?.session
                ? getDayStyles(item.session) + " cursor-pointer hover:scale-105 active:scale-95"
                : "bg-surface-elevated/50"
            }`}
          >
            {item && (
              <>
                <span className="font-medium">{item.day}</span>
                {getSessionIndicator(item.session)}
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 p-4 pt-2 border-t border-border">
        {[
          { label: "Completado", bg: "bg-primary/15 border-primary/30", dot: "bg-primary" },
          { label: "HOY", bg: "bg-primary/20 border-2 border-primary", dot: "bg-primary" },
          { label: "Reprogramada", bg: "bg-secondary/15 border-secondary/30", dot: "bg-secondary" },
          { label: "Bloqueada", bg: "bg-danger/10 border-danger/20", dot: "bg-danger" },
        ].map(legend => (
          <div key={legend.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-md border ${legend.bg}`} />
            <span className="text-[10px] text-muted-foreground">{legend.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}