"use client";

import { useState } from "react";
import { TrainingSession } from "@/lib/training-plan";
import { parseLocalDate, formatDayLabel } from "@/lib/date-utils";

interface CalendarViewProps {
  sessions: TrainingSession[];
  onSessionClick: (sessionId: string) => void;
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarView({ sessions, onSessionClick }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // Mes actual (0-indexed: 0=Enero, 3=Abril)
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Today string in local time (not UTC)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const session = sessions.find(s => s.date === dateStr);
    calendarDays.push({ day, dateStr, session });
  }

  const getDayColor = (session: TrainingSession | undefined) => {
    if (!session) return "bg-foreground/[0.02] text-foreground/30";
    if (session.completed) return "bg-primary/10 text-primary border border-primary/20";
    if (session.blocked) return "bg-red-500/10 text-red-500 border border-red-500/20";
    if (session.rescheduled) return "bg-secondary/10 text-secondary border border-secondary/20";
    
    if (session.date === todayStr) return "bg-primary/20 text-primary border-2 border-primary font-bold";
    
    return "bg-foreground/[0.04] text-foreground/60";
  };

  const getSessionDot = (session: TrainingSession | undefined) => {
    if (!session) return null;
    if (session.completed) return <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />;
    if (session.blocked) return <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />;
    if (session.rescheduled) return <div className="w-1 h-1 rounded-full bg-secondary mt-0.5" />;
    return <div className="w-1 h-1 rounded-full bg-foreground/30 mt-0.5" />;
  };

  return (
    <div className="rounded-xl border border-foreground/5 p-3 sm:p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          className="p-1 rounded hover:bg-foreground/5 transition-colors"
        >
          ←
        </button>
        <h3 className="text-sm font-medium text-foreground">
          {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth]} {currentYear}
        </h3>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          className="p-1 rounded hover:bg-foreground/5 transition-colors"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map(day => (
          <div key={day} className="text-center text-[10px] text-foreground/40">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, index) => (
          <div
             key={index}
             onClick={() => {
               if (item?.session) {
                 onSessionClick(item.session.id);
               }
             }}
             onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                 if (item?.session) {
                   onSessionClick(item.session.id);
                 }
               }
             }}
             role="button"
             tabIndex={item?.session ? 0 : -1}
             aria-label={item ? (item.session ? `Sesión ${item.day}: ${item.session.workout}` : `Día ${item.day}`) : `Día vacío ${index}`}
             className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${
               item?.session ? getDayColor(item.session) + " cursor-pointer hover:opacity-80" : "bg-foreground/[0.02]"
             }`}
           >
            {item && (
              <>
                <span className="text-[10px] sm:text-xs">{item.day}</span>
                {getSessionDot(item.session)}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-foreground/5">
        {[
          { label: "Completado", color: "bg-primary/10 border-primary/20", dot: "bg-primary" },
          { label: "HOY", color: "bg-primary/20 border-2 border-primary", dot: "bg-primary" },
          { label: "Reprogramada", color: "bg-secondary/10 border-secondary/20", dot: "bg-secondary" },
          { label: "Bloqueada", color: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
        ].map(legend => (
          <div key={legend.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded border ${legend.color}`} />
            <span className="text-[9px] sm:text-[10px] text-foreground/40">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
