"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { EVENT_NAME, EVENT_DATE } from "@/lib/training-plan";

const CHECKLIST = [
  { id: "docs", text: "DNI / Documento de identidad", icon: "🆔", category: "esencial" },
  { id: "number", text: "Número de corredor (retirar días previos)", icon: "🔢", category: "esencial" },
  { id: "chip", text: "Chip de tiempo (si aplica)", icon: "📡", category: "esencial" },
  { id: "shoes", text: "Zapatillas de correr (ya usadas, NO nuevas)", icon: "👟", category: "equipo" },
  { id: "socks", text: "Calcetines técnicos (sin costuras)", icon: "🧦", category: "equipo" },
  { id: "shorts", text: "Shorts/leggings cómodos (sin etiquetas que raspen)", icon: "🩳", category: "equipo" },
  { id: "shirt", text: "Camiseta técnica (evita algodón)", icon: "👕", category: "equipo" },
  { id: "sport-bra", text: "Sujetador deportivo de alta sujeción", icon: "👙", category: "equipo" },
  { id: "cap", text: "Gorra/Visera (si hay sol)", icon: "🧢", category: "equipo" },
  { id: "vaseline", text: "Vaselina en pezones y zonas de roce", icon: "🧴", category: "prevención" },
  { id: "water", text: "Botella de agua pequeña", icon: "💧", category: "hidratación" },
  { id: "banana", text: "Medio plátano o gel 30 min antes", icon: "🍌", category: "nutrición" },
  { id: "spf", text: "Protector solar SPF 50+", icon: "☀️", category: "protección" },
  { id: "arrival", text: "Llegar 60-90 min antes de la salida", icon: "⏰", category: "timing" },
  { id: "warmup-dia", text: "Calentamiento ligero 15 min antes (caminata + trote)", icon: "🔥", category: "carrera" },
  { id: "pace", text: "Estrategia: salir lento (12 min/km), nunca aceleres antes del km 4", icon: "🐢", category: "carrera" },
  { id: "smile", text: "¡Sonríe en la meta para la foto!", icon: "📸", category: "mental" }
];

const STRATEGY = [
  { km: "0-1", pace: "12:00 min/km", note: "KM 1: Sale lento, no te dejes llevar por la adrenalina", icon: "🐢" },
  { km: "1-3", pace: "11:30 min/km", note: "KM 1-3: Ritmo cómodo, respiración controlada", icon: "🏃‍♀️" },
  { km: "3-5", pace: "11:00 min/km", note: "KM 3-5: Si te sientes bien, mantén o acelera un poco", icon: "💪" },
  { km: "5-6", pace: "11:30 min/km", note: "KM 5-6: Últimos km, usa la técnica de 'rees' (caminar 1 min cada 10 min)", icon: "🎯" },
  { km: "6-7", pace: "¡Como puedas!", note: "KM 6-7: ¡Falta poco! Si tienes fuerza, acelera. Si no, camina con orgullo", icon: "🏁" }
];

export default function DiaCarreraPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'checklist' | 'strategy' | 'tips'>('checklist');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yadira_session');
      router.push('/login');
    }
  };

  const toggleCheck = (id: string) => {
    setChecked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categories = [...new Set(CHECKLIST.map(i => i.category))];

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors mb-2 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              🏁 Guía del Día de la Carrera
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-foreground/50">
              {EVENT_NAME} · {EVENT_DATE}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/40 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Countdown special */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-6 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-5 sm:p-6 text-primary-foreground text-center"
        >
          <p className="text-sm opacity-80 mb-1">Faltan para la carrera</p>
          <p className="text-2xl sm:text-3xl font-bold">{EVENT_DATE}</p>
          <p className="text-xs mt-2 opacity-70">7 km · Domingo</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['checklist', 'strategy', 'tips'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-foreground/10 text-foreground/50 hover:border-foreground/20'
              }`}
            >
              {tab === 'checklist' ? '📋 Checklist' : tab === 'strategy' ? '🎯 Estrategia' : '💡 Tips'}
            </button>
          ))}
        </div>

        {/* Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground/50">
                {checked.length}/{CHECKLIST.length} completados
              </span>
              <div className="h-1.5 flex-1 mx-3 rounded-full bg-foreground/5 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(checked.length / CHECKLIST.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-primary">{Math.round((checked.length / CHECKLIST.length) * 100)}%</span>
            </div>

            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-[10px] sm:text-xs font-medium text-foreground/40 uppercase tracking-wider mb-2">
                  {cat}
                </h3>
                <div className="space-y-1.5">
                  {CHECKLIST.filter(i => i.category === cat).map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        checked.includes(item.id)
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-foreground/5 hover:border-foreground/10 bg-background'
                      }`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked.includes(item.id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-foreground/20'
                      }`}>
                        {checked.includes(item.id) && (
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <span className={`text-xs sm:text-sm flex-1 ${
                        checked.includes(item.id) ? 'line-through text-foreground/40' : 'text-foreground/70'
                      }`}>
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strategy */}
        {activeTab === 'strategy' && (
          <div className="space-y-3">
            {STRATEGY.map((item, i) => (
              <motion.div
                key={item.km}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-foreground/10 bg-background"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary">KM {item.km}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary">
                      {item.pace}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-foreground/60 leading-relaxed">
                    {item.note}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
              <p className="text-xs font-medium text-green-600 mb-1">🏆 Meta Final</p>
              <p className="text-[11px] sm:text-xs text-foreground/60">
                Cruza la meta sonriendo. No importa tu tiempo, el logro es haber entrenado y llegado.
                ¡Eres increíble! 🎉
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        {activeTab === 'tips' && (
          <div className="space-y-3">
            {[
              { icon: "🎽", title: "NO uses ropa nueva", text: "Usa lo que has usado en entrenamientos. Las ampollas del día de la carrera duelen el doble." },
              { icon: "🚽", title: "Ve al baño antes de la salida", text: "Haz fila 30 min antes. Las filas son largas y el estrés no ayuda." },
              { icon: "🎵", title: "Música opcional", text: "Si usas auriculares, déjalos solo en un oído para escuchar indicaciones y estar alerta." },
              { icon: "📸", title: "Disfruta el momento", text: "Haz fotos, saluda a la gente, disfruta el ambiente. Es tu primera carrera, ¡celébralo!" },
              { icon: "🏃‍♀️", title: "No corras detrás de otros", text: "Mantén TU ritmo. Muchos salen rápido y se cansan al km 3. Tú tienes tu plan." },
              { icon: "🎉", title: "Cruza la meta con orgullo", text: "Al cruzar, pon las manos arriba. Has completado 7 km. ¡Ese es un logro enorme!" }
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-foreground/5 bg-foreground/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-0.5">{tip.title}</h4>
                    <p className="text-[11px] sm:text-xs text-foreground/60 leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
