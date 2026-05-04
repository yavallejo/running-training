"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const DETAILS_MOBILE_THRESHOLD = 60;
const DETAILS_DESKTOP_THRESHOLD = 100;

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const shouldShowMore = session.details.length > (isDesktop ? DETAILS_DESKTOP_THRESHOLD : DETAILS_MOBILE_THRESHOLD);

  const getCompletionState = (): 'completed' | 'completed-under' | 'completed-over' | null => {
    if (!session.completed) return null;
    if (!session.actualDistance) return 'completed';
    if (session.actualDistance >= session.distance) return 'completed-over';
    return 'completed-under';
  };

  const getMotivationalMessage = (): { text: string; icon: string } | null => {
    const completionState = getCompletionState();
    if (completionState === 'completed-under') {
      const missing = session.distance - (session.actualDistance || 0);
      return {
        text: `¡Te faltaron ${missing.toFixed(1)} km, pero cada paso cuenta! ¡Sigue guerreando!`,
        icon: '💪'
      };
    }
    if (completionState === 'completed-over') {
      const extra = (session.actualDistance || 0) - session.distance;
      return {
        text: `¡Superaste el plan por ${extra.toFixed(1)} km! ¡Eres una máquina! ¡SIGUE ASÍ, GUERRERO/A!`,
        icon: '🔥'
      };
    }
    return null;
  };

  const completionState = getCompletionState();
  const motivationalMsg = getMotivationalMessage();

  const getStateStyles = () => {
    switch (state) {
      case 'today':
        return {
          container: 'border-primary/60 bg-gradient-to-br from-primary/12 to-primary/6 shadow-lg shadow-primary/15',
          badgeText: 'bg-primary/25 text-primary',
        };
      case 'completed':
        return {
          container: 'border-success/40 bg-success/5',
          badgeText: 'bg-success/10 text-success',
        };
      case 'completed-under':
        return {
          container: 'border-warning/40 bg-warning/5',
          badgeText: 'bg-warning/10 text-warning',
        };
      case 'completed-over':
        return {
          container: 'border-success/50 bg-gradient-to-br from-success/12 to-warning/8 shadow-lg shadow-success/20',
          badgeText: 'bg-success/20 text-success',
        };
      case 'rescheduled':
        return {
          container: 'border-info/40 bg-info/5',
          badgeText: 'bg-info/20 text-info',
        };
      case 'rescheduled-completed':
        return {
          container: 'border-success/30 bg-success/5',
          badgeText: 'bg-success/20 text-success',
        };
      case 'missed':
        return {
          container: 'border-dashed border-warning/40 bg-warning/5',
          badgeText: 'bg-warning/10 text-warning',
        };
      case 'blocked':
        return {
          container: 'border-danger/30 bg-danger/5 opacity-60',
          badgeText: 'bg-danger/20 text-danger',
        };
      default:
        return {
          container: 'border-border bg-surface',
          badgeText: 'bg-surface text-muted-foreground',
        };
    }
  };

  const getStateBadge = () => {
    const badge = getStateStyles().badgeText;
    if (state === 'today') {
      return (
        <motion.span
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge}`}
        >
          HOY
        </motion.span>
      );
    }
    if (state === 'missed') {
      return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
          PERDIDO
        </span>
      );
    }
    if (state === 'rescheduled') {
      return (
        <motion.span
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}
        >
          ⚡ REPROGRAMADA
        </motion.span>
      );
    }
    if (state === 'blocked') {
      return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
          🔴 BLOQUEADA
        </span>
      );
    }
    if (state === 'rescheduled-completed') {
      return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
          ✓ COMPLETADA
        </span>
      );
    }
    if (state === 'completed-under') {
      return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
          ⚠️ PARCIAL
        </span>
      );
    }
    if (state === 'completed-over') {
      return (
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gradient-to-r from-warning to-success text-white"
        >
          💪 SUPER PODER
        </motion.span>
      );
    }
    return null;
  };

  const styles = getStateStyles();

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border p-4 transition-all ${styles.container}`}
    >
      <div className="flex items-start gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleComplete(session.id)}
          disabled={state === 'blocked'}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            session.completed
              ? "border-success bg-success"
              : state === 'blocked'
              ? "border-muted opacity-30 cursor-not-allowed"
              : "border-muted hover:border-primary"
          }`}
          aria-label={session.completed ? "Marcar incompleto" : "Marcar completado"}
        >
          {session.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </motion.svg>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {getStateBadge()}
              <span className="text-base sm:text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
                {session.dayLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full bg-surface-elevated px-3 py-1 text-sm font-semibold ${
                completionState === 'completed-over' ? 'text-success' :
                completionState === 'completed-under' ? 'text-warning' : 'text-foreground'
              }`}>
                {session.actualDistance ? (
                  <span>
                    {session.actualDistance} km
                    {completionState === 'completed-over' && <span className="ml-1">💪</span>}
                    {completionState === 'completed-under' && <span className="ml-1">⚠️</span>}
                  </span>
                ) : (
                  <span>{session.distance} km</span>
                )}
              </span>
              {session.actualDistance && session.actualDistance !== session.distance && (
                <span className="text-xs text-muted-foreground">
                  (plan: {session.distance} km)
                </span>
              )}
            </div>
          </div>

          <p className="text-base font-medium text-muted-foreground mb-2">
            {session.workout}
          </p>

          <p className={`text-sm sm:text-base text-muted-foreground/80 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {session.details}
          </p>

          {session.originalDate && state === 'rescheduled' && (
            <p className="text-sm sm:text-base text-secondary/80 mt-2 font-medium">
              📅 Reprogramada desde: {session.originalDate}
            </p>
          )}

          {shouldShowMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 w-full sm:w-auto sm:min-w-[140px] h-12 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-sm font-medium text-foreground transition-all flex items-center justify-center gap-2"
            >
              {expanded ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  Ver menos
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                  Ver más
                </>
              )}
            </button>
          )}

          <AnimatePresence>
            {session.completed && (session.actualTime || session.feeling || session.notes || completionState) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-surface/80 border border-border"
              >
                {motivationalMsg && (
                  <div className={`mb-4 p-3 rounded-xl border ${
                    completionState === 'completed-over' 
                      ? 'bg-gradient-to-r from-success/10 to-warning/10 border-success/30' 
                      : 'bg-warning/10 border-warning/30'
                  }`}>
                    <p className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${
                      completionState === 'completed-over' ? 'text-success' : 'text-warning'
                    }`}>
                      <span className="text-lg">{motivationalMsg.icon}</span>
                      {motivationalMsg.text}
                    </p>
                  </div>
                )}

                <p className="text-sm sm:text-base font-semibold text-success mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25.15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resumen del entrenamiento
                </p>
                <div className="space-y-2">
                  {session.actualTime && (
                    <div className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground">
                      <span className="text-muted-foreground/60">⏱️</span>
                      <span>{session.actualTime}</span>
                      <span className="text-muted-foreground/50">({session.actualPace})</span>
                    </div>
                  )}
                  {session.feeling && (
                    <div className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground">
                      <span className="text-muted-foreground/60">Sensación:</span>
                      <span className="text-warning">{'\u2605'.repeat(session.feeling)}</span>
                      <span className="text-muted-foreground/50">({session.feeling}/5)</span>
                    </div>
                  )}
                  {session.notes && (
                    <p className="text-sm sm:text-base text-muted-foreground/70 italic pl-5">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {state === 'missed' && (
            <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-sm sm:text-base font-medium text-warning flex items-center gap-2">
                <span className="text-lg">😢</span>
                No completado - ¡Sigue adelante, tú puedes!
              </p>
              {!session.rescheduleUsed && (
                <button
                  onClick={() => onShowDatePicker(session.id)}
                  className="mt-3 w-full h-12 rounded-xl bg-info/20 hover:bg-info/30 border border-info/30 text-sm font-semibold text-info transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reprogramar (1 vez)
                </button>
              )}
            </div>
          )}

          {state === 'blocked' && (
            <p className="mt-3 text-sm sm:text-base font-medium text-danger/70">
              No completada después de reprogramar
            </p>
          )}

          {state === 'rescheduled' && (
            <div className="mt-3 p-3 rounded-xl bg-info/10 border border-info/20">
              <p className="text-sm sm:text-base font-semibold text-info flex items-center gap-2">
                <span className="text-lg">⚡</span>
                ¡DEBE HACERSE! Sesión reprogramada
              </p>
            </div>
          )}

          {session.completed && (
            <button
              onClick={() => onShowShare(session.id)}
              className="mt-3 flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Compartir logro
            </button>
          )}
        </div>
      </div>

      {showDatePickerId === session.id && (
        <DatePickerModal
          sessionId={session.id}
          sessions={[]}
          onConfirm={(id: string, date: Date) => {
            onReschedule(id, date);
            onShowDatePicker(null);
          }}
          onCancel={() => onShowDatePicker(null)}
        />
      )}

      {state === 'rescheduled-completed' && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full" />
      )}
    </motion.div>
  );
}