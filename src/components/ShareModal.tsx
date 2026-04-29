"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

interface ShareModalProps {
  session?: {
    id: string;
    dayLabel: string;
    workout: string;
    distance: number;
    actualTime?: string;
    actualPace?: string;
  };
  planProgress?: {
    completed: number;
    total: number;
    distance: number;
    totalDistance: number;
  };
  onClose: () => void;
}

export default function ShareModal({ session, planProgress, onClose }: ShareModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareType, setShareType] = useState<'session' | 'plan'>(
    session ? 'session' : 'plan'
  );

  useEffect(() => {
    if (cardRef.current) {
      html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      }).then(canvas => {
        setImageUrl(canvas.toDataURL("image/png"));
      });
    }
  }, [shareType]);

  const handleShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "yadira-running.png", { type: "image/png" });

        await navigator.share({
          title: "Yadira Running",
          text: shareType === 'session'
            ? `¡Completé mi entrenamiento de ${session?.distance}km!`
            : `¡Vas por ${planProgress?.completed}/${planProgress?.total} sesiones completadas!`,
          files: [file],
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      // Fallback: download
      const link = document.createElement("a");
      link.download = `yadira-running-${shareType}.png`;
      link.href = imageUrl;
      link.click();
    }
  };

  const completionRate = planProgress
    ? Math.round((planProgress.completed / planProgress.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm rounded-2xl bg-background border border-foreground/10 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground mb-3 text-center">
          Compartir Progreso
        </h3>

        {/* Tab selector */}
        {session && planProgress && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShareType('session')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                shareType === 'session'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/5 text-foreground/50'
              }`}
            >
              Sesión
            </button>
            <button
              onClick={() => setShareType('plan')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                shareType === 'plan'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/5 text-foreground/50'
              }`}
            >
              Plan Completo
            </button>
          </div>
        )}

        {/* Shareable Card Preview */}
        <div
          ref={cardRef}
          className="rounded-xl bg-gradient-to-br from-primary via-primary/80 to-secondary p-6 text-primary-foreground"
        >
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🏃‍♀️</div>
            <h4 className="text-lg font-bold">Yadira Running</h4>
            {shareType === 'session' && session ? (
              <p className="text-xs opacity-70">{session.dayLabel}</p>
            ) : (
              <p className="text-xs opacity-70">Plan de Entrenamiento</p>
            )}
          </div>

          {shareType === 'session' && session ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-xs opacity-70">Distancia</span>
                <span className="text-sm font-bold">{session.distance} km</span>
              </div>
              {session.actualTime && (
                <div className="flex justify-between">
                  <span className="text-xs opacity-70">Tiempo</span>
                  <span className="text-sm font-bold">{session.actualTime}</span>
                </div>
              )}
              {session.actualPace && (
                <div className="flex justify-between">
                  <span className="text-xs opacity-70">Ritmo</span>
                  <span className="text-sm font-bold">{session.actualPace}</span>
                </div>
              )}
            </div>
          ) : planProgress ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-xs opacity-70">Sesiones</span>
                <span className="text-sm font-bold">{planProgress.completed}/{planProgress.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs opacity-70">Progreso</span>
                <span className="text-sm font-bold">{completionRate}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs opacity-70">Distancia</span>
                <span className="text-sm font-bold">{planProgress.distance}/{planProgress.totalDistance} km</span>
              </div>
            </div>
          ) : null}

          <div className="text-center pt-3 border-t border-white/20">
            <p className="text-[10px] opacity-60">
               ¡Entrenando para el 17 de mayo! 🎉
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-foreground/10 px-4 py-2 text-sm font-medium text-foreground/60 hover:bg-foreground/5 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            📤 Compartir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
