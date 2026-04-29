"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DatePickerModal from "@/components/DatePickerModal";
import { TrainingSession } from "@/lib/training-plan";

interface SessionCardProps {
  session: TrainingSession;
  index: number;
  state: string;
  onToggleComplete: (id: string) => void;
  onShowDatePicker: (id: string | null) => void;
  onReschedule: (id: string, newDate: Date) => void;
  onShowPostWorkout: (id: string) => void;
  onShowShare: (id: string) => void;
  showDatePickerId: string | null;
}

const MAX_LINES = 2;

export default function SessionCard({
  session,
  index,
  state,
  onToggleComplete,
  onShowDatePicker,
  onReschedule,
  onShowPostWorkout,
  onShowShare,
  showDatePickerId,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const getStateBadge = () => {
    if (state === 'today') {
      return (
        <motion.span
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"
        >
          HOY
        </motion.span>
      );
    }
    if (state === 'missed') {
      return (
        <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-medium">
          PERDIDO
        </span>
      );
    }
    if (state === 'rescheduled') {
      return (
        <motion.span
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-medium"
        >
          ⚡ REPROGRAMADA - ¡DEBE HACERSE!
        </motion.span>
      );
    }
    if (state === 'blocked') {
      return (
        <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-medium">
          🔴 BLOQUEADA
        </span>
      );
    }
    if (state === 'rescheduled-completed') {
      return (
        <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-medium">
          ✓ REPROGRAMADA Y COMPLETADA
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`rounded-xl border p-3 sm:p-4 transition-colors relative overflow-hidden ${
        state === 'today'
          ? 'border-primary/50 shadow-lg shadow-primary/20 bg-primary/[0.05]'
          : state === 'completed'
          ? 'border-primary/30 bg-primary/5'
          : state === 'rescheduled-completed'
          ? 'border-green-500/30 bg-green-500/5'
          : state === 'rescheduled'
          ? 'border-secondary/50 bg-secondary/5 shadow-md shadow-secondary/10'
          : state === 'missed'
          ? 'border-dashed border-foreground/10 bg-foreground/[0.02] opacity-60'
          : state === 'blocked'
          ? 'border-red-500/30 bg-red-500/[0.03] opacity-50 cursor-not-allowed'
          : 'border-foreground/5 hover:border-foreground/10'
      }`}
    >
      {/* State badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {getStateBadge()}
        <span className={`text-xs sm:text-sm font-medium text-foreground ${
          state === 'missed' ? 'line-through text-foreground/40' : ''
        }`}>
          {session.dayLabel}
          {session.originalDate && (
            <span className="ml-2 text-[10px] sm:text-xs text-foreground/40">
              (Original: {session.originalDate})
            </span>
          )}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => onToggleComplete(session.id)}
          disabled={state === 'blocked'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            session.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-foreground/20 hover:border-primary"
          } ${state === 'blocked' ? 'opacity-30 cursor-not-allowed' : ''}`}
          aria-label={session.completed ? "Marcar incompleto" : "Marcar completado"}
        >
          {session.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </motion.svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5">
                {session.workout}
              </p>
            </div>
             <div className="flex shrink-0 gap-1 sm:gap-1.5">
                <span className="rounded-full bg-secondary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-secondary">
                  {session.distance} km
                </span>
                {session.completed && (
                  <button
                    onClick={() => onShowShare(session.id)}
                    className="text-[10px] sm:text-[11px] hover:scale-110 transition-transform"
                    title="Compartir logro"
                    aria-label="Compartir logro"
                  >
                    📤
                  </button>
                )}
              </div>
          </div>
          <p className={`mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-foreground/40 leading-relaxed ${
            expanded ? '' : 'line-clamp-2 sm:line-clamp-3'
          }`}>
            {session.details}
          </p>
          {session.details.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[10px] text-primary hover:text-primary/80 underline"
            >
              {expanded ? 'Ver menos' : 'Ver más...'}
            </button>
          )}

          {/* Post-workout notes */}
          {session.completed && (session.actualTime || session.feeling || session.notes) && (
            <div className="mt-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] sm:text-xs font-medium text-primary/70 mb-0.5">
                ✅ Notas del entrenamiento
              </p>
              {session.actualTime && (
                <p className="text-[10px] sm:text-xs text-foreground/60">
                  ⏱️ Tiempo: {session.actualTime} ({session.actualPace})
                </p>
              )}
              {session.feeling && (
                <p className="text-[10px] sm:text-xs text-foreground/60">
                  {'⭐'.repeat(session.feeling)} ({session.feeling}/5)
                </p>
              )}
              {session.notes && (
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 italic">
                  "{session.notes}"
                </p>
              )}
            </div>
          )}

          {/* Missed state message */}
          {state === 'missed' && (
            <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-orange-500/70">
              😢 No completado - ¡Ánimo, sigue adelante!
            </p>
          )}

          {/* Blocked state message */}
          {state === 'blocked' && (
            <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-red-500/70">
              No completada después de reprogramar
            </p>
          )}

          {/* Reschedule button for missed sessions */}
          {state === 'missed' && !session.rescheduleUsed && (
            <button
              onClick={() => onShowDatePicker(session.id)}
              className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-secondary hover:text-secondary/80 underline"
            >
              ⚡ Reprogramar (1 vez)
            </button>
          )}
        </div>
      </div>

      {/* DatePicker modal */}
      {showDatePickerId === session.id && (
        <DatePickerModal
          sessionId={session.id}
          sessions={[]} // Will be passed from parent
          onConfirm={(id: string, date: Date) => {
            onReschedule(id, date);
            onShowDatePicker(null);
          }}
          onCancel={() => onShowDatePicker(null)}
        />
      )}

      {/* Rescheduled+completed decoration */}
      {state === 'rescheduled-completed' && (
        <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-green-500/5 rounded-bl-full" />
      )}
    </motion.div>
  );
}
