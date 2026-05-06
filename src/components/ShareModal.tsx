"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareType, setShareType] = useState<'session' | 'plan'>(
    session ? 'session' : 'plan'
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleCopy = async () => {
    const text = shareType === 'session'
      ? `¡Completé ${session?.distance}km en ${session?.actualTime || 'mi entrenamiento'}! 🏃‍♀️\n\n📊 RunPlan Pro - Tu plan de entrenamiento`
      : `¡Vas ${planProgress?.completed}/${planProgress?.total} sesiones! Progreso: ${planProgress?.distance}/${planProgress?.totalDistance}km 📊\n\n🏃‍♀️ RunPlan Pro - Tu plan de entrenamiento`;

    await navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = shareType === 'session'
      ? `¡Completé ${session?.distance}km en ${session?.actualTime || 'mi entrenamiento'}! 🏃‍♀️\n\n📊 RunPlan Pro - Tu plan de entrenamiento`
      : `¡Vas ${planProgress?.completed}/${planProgress?.total} sesiones! Progreso: ${planProgress?.distance}/${planProgress?.totalDistance}km 📊\n\n🏃‍♀️ RunPlan Pro - Tu plan de entrenamiento`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const completionRate = planProgress
    ? Math.round((planProgress.completed / planProgress.total) * 100)
    : 0;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm rounded-2xl bg-surface border border-border overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
              Compartir Progreso
            </h3>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {session && planProgress && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShareType('session')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  shareType === 'session'
                    ? 'bg-primary text-white'
                    : 'bg-surface-elevated text-muted-foreground hover:bg-muted'
                }`}
              >
                🏃‍♀️ Sesión
              </button>
              <button
                onClick={() => setShareType('plan')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  shareType === 'plan'
                    ? 'bg-primary text-white'
                    : 'bg-surface-elevated text-muted-foreground hover:bg-muted'
                }`}
              >
                📊 Plan Completo
              </button>
            </div>
          )}

          <div className="rounded-2xl p-5 border border-zinc-800" style={{ background: "linear-gradient(180deg, #18181B 0%, #27272A 100%)" }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏃‍♀️</div>
              <h4 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-urbanist)" }}>
                RunPlan Pro
              </h4>
              {shareType === 'session' && session ? (
                <p className="text-sm text-white/80">{session.dayLabel}</p>
              ) : (
                <p className="text-sm text-white/80">Plan de Entrenamiento</p>
              )}
            </div>

            {shareType === 'session' && session ? (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="text-center mb-3">
                  <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-urbanist)", color: "#00D4FF" }}>
                    {session.distance}
                  </span>
                  <span className="text-lg text-white/60 ml-1">km</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {session.actualTime && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Tiempo</p>
                      <p className="text-sm font-bold text-white">{session.actualTime}</p>
                    </div>
                  )}
                  {session.actualPace && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Ritmo</p>
                      <p className="text-sm font-bold text-white">{session.actualPace}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : planProgress ? (
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#shareProgressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                    <defs>
                      <linearGradient id="shareProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4D4D" />
                        <stop offset="100%" stopColor="#FF6B6B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-urbanist)" }}>
                      {completionRate}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-white/60">Sesiones</p>
                    <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-urbanist)" }}>
                      {planProgress.completed}/{planProgress.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Distancia</p>
                    <p className="text-base font-bold" style={{ fontFamily: "var(--font-urbanist)", color: "#00D4FF" }}>
                      {planProgress.distance}/{planProgress.totalDistance} km
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-sm text-white/80">
                ¡Entrenando para el 17 de mayo! 🎉
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="h-11 rounded-xl bg-surface-elevated hover:bg-muted text-sm font-medium text-foreground transition-colors flex items-center justify-center gap-2"
            >
              {copySuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-.884 0-1.713-.518-2.025-1.426a2.25 2.25 0 00-1.973-1.14H8.25m4.5 0a2.25 2.25 0 00-2.25-2.25H5.25m0 0v3.75c0 .624.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V5.25m0 0V3.888M15 6.75A2.25 2.25 0 0117.25 9v1.5m0 0V9a2.25 2.25 0 00-2.25-2.25h-1.5m-3 0H8.25m3 0h3M6.75 15h3.75a2.25 2.25 0 002.25-2.25V9m0 0H5.25m0 0v6.75c0 .414.336.75.75.75h3.75" />
                  </svg>
                  Copiar
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="h-11 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998 3.741-.215.42c-.218.086-.467.13-.717.031l-.215-.214c-.15-.08-.345-.12-.57-.12-.314 0-.611.125-.85.337-.238.213-.48.588-.48 1.067 0 .525.212 1.025.595 1.388.383.363.883.545 1.42.545.443 0 .877-.162 1.213-.472.336-.31.535-.733.535-1.229 0-.318-.112-.623-.336-.86-.224-.237-.497-.355-.812-.355-.272 0-.523.072-.725.216-.202.143-.31.336-.356.544-.045.209.015.423.12.578.107.155.24.233.397.233.236 0 .425-.088.625-.262.199-.174.3-.407.386-.637.086-.23.078-.485-.037-.717-.115-.233-.334-.495-.62-.71-.287-.215-.613-.32-.963-.29a1.463 1.463 0 00-1.054.538l-.203.325a2.19 2.19 0 00-.152.542c.042.18.146.345.246.477.1.132.225.198.38.198.238 0 .442-.125.616-.372.174-.247.25-.567.25-.978 0-.525-.2-1.025-.596-1.388z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}