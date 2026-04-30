"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { EVENT_NAME, EVENT_DATE } from "@/lib/training-plan";
import { clearSession } from "@/lib/auth";

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
    clearSession();
    router.push('/login');
  };

  const toggleCheck = (id: string) => {
    setChecked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categories = [...new Set(CHECKLIST.map(i => i.category))];

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              🏁 Guía del Día de la Carrera
            </h1>
            <p className="text-base text-muted-foreground">
              {EVENT_NAME} · {EVENT_DATE}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-6 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-5 text-primary-foreground text-center"
        >
          <p className="text-base opacity-80 mb-1">Faltan para la carrera</p>
          <p className="text-2xl sm:text-3xl font-bold">{EVENT_DATE}</p>
          <p className="text-base mt-2 opacity-70">7 km · Domingo</p>
        </motion.div>

        <div className="flex gap-3 mb-6">
          {(['checklist', 'strategy', 'tips'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 rounded-2xl border-2 text-base font-semibold transition-all ${
                activeTab === tab
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-muted-foreground hover:bg-surface-elevated'
              }`}
            >
              {tab === 'checklist' ? '📋 Checklist' : tab === 'strategy' ? '🎯 Estrategia' : '💡 Tips'}
            </button>
          ))}
        </div>

        {activeTab === 'checklist' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">
                {checked.length}/{CHECKLIST.length}
              </span>
              <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full transition-all"
                  initial={{ width: 0 }}
                  animate={{ width: `${(checked.length / CHECKLIST.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-primary font-medium">{Math.round((checked.length / CHECKLIST.length) * 100)}%</span>
            </div>

            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {CHECKLIST.filter(i => i.category === cat).map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        checked.includes(item.id)
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-surface hover:bg-surface-elevated'
                      }`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked.includes(item.id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}>
                        {checked.includes(item.id) && (
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <span className={`text-base flex-1 ${
                        checked.includes(item.id) ? 'line-through text-muted-foreground' : 'text-foreground'
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

        {activeTab === 'strategy' && (
          <div className="space-y-4">
            {STRATEGY.map((item, i) => (
              <motion.div
                key={item.km}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-surface"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-bold text-primary">KM {item.km}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                      {item.pace}
                    </span>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {item.note}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="mt-6 p-5 rounded-2xl border border-green-500/20 bg-green-500/5 text-center">
              <p className="text-base font-semibold text-green-500 mb-2">🏆 Meta Final</p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Cruza la meta sonriendo. No importa tu tiempo, el logro es haber entrenado y llegado.
                ¡Eres increíble! 🎉
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
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
                className="p-4 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-1">{tip.title}</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">{tip.text}</p>
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