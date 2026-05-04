"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TerminosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            VOLVER
          </button>

          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
            TÉRMINOS Y CONDICIONES
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            Último actualizado: 02 de mayo de 2026
          </p>
        </div>

        <div className="space-y-8">
          {/* Medical Disclaimer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-500 mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
                  AVISO MÉDICO IMPORTANTE
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">RunPlan Pro NO sustituye la supervisión médica profesional.</strong> Los planes de entrenamiento generados por esta aplicación son <strong className="text-foreground">algorítmicos</strong> y se basan exclusivamente en la información que usted proporciona.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">RECOMENDACIÓN OBLIGATORIA:</strong> Antes de iniciar cualquier programa de entrenamiento, especialmente si usted tiene alguna lesión, no ha hecho ejercicio en los últimos 6 meses, tiene más de 60 años, o padece alguna enfermedad crónica, <strong className="text-foreground">debe consultar a su médico y obtener autorización médica.</strong>
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 1 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-surface/80 border border-border/50"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              1. Aceptación de Riesgos
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Al utilizar esta Aplicación y seguir los planes de entrenamiento generados, usted reconoce que:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">La actividad física conlleva riesgos</strong> inherentes incluyendo, pero no limitados a: lesiones musculares, articulares, cardiovasculares, o la muerte.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Usted asume toda la responsabilidad</strong> por su seguridad y salud durante el entrenamiento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">La Aplicación no se hace responsable</strong> por cualquier lesión, daño o perjuicio que pueda derivarse del uso de los planes generados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Usted es el único responsable</strong> de escuchar a su cuerpo y detener el ejercicio si experimenta dolor, mareo, dificultad para respirar, u otros síntomas anormales.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-surface/80 border border-border/50"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              2. Limitaciones del Algoritmo
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>El sistema de generación de planes funciona de la siguiente manera:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Los planes se generan <strong className="text-foreground">exclusivamente por algoritmo</strong> basándose en los datos del quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">No hay intervención humana</strong> en la creación de cada plan individual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>El algoritmo utiliza estándares deportivos generales que <strong className="text-foreground">pueden no ser apropiados</strong> para todas las situaciones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Los resultados deportivos dependen de múltiples factores individuales que el algoritmo no puede predecir.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-surface/80 border border-border/50"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              3. Uso de Datos Personales
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>La información proporcionada se utiliza <strong className="text-foreground">únicamente</strong> para:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Generar planes de entrenamiento personalizados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Mejorar la precisión del algoritmo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Mostrar estadísticas de progreso personal.</span>
                </li>
              </ul>
              <p className="mt-3">
                <strong className="text-foreground">No compartimos</strong> sus datos con terceros sin su consentimiento explícito, excepto cuando sea requerido por ley.
              </p>
            </div>
          </motion.section>

          {/* Section 4 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-surface/80 border border-border/50"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              4. Para Usuarios con Lesiones
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>Si usted indicó en el quiz que tiene alguna lesión o condición médica:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Recomendamos encarecidamente</strong> que consulte a su médico antes de seguir el plan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">No seguimos</strong> las recomendaciones de su médico - esa es su responsabilidad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Podemos modificar</strong> el plan para reducir la intensidad o sustituir ejercicios de alto impacto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">La Aplicación no diagnostica</strong> ni trata lesiones.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Section 5 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-surface/80 border border-border/50"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              5. Condiciones de Uso
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>Al usar esta Aplicación usted se compromete a:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Proporcionar información <strong className="text-foreground">veraz y actualizada</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Usar la Aplicación de manera <strong className="text-foreground">responsable</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">No compartir</strong> su cuenta con terceros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Notificar</strong> a soporte si encuentra problemas técnicos.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>
              6. Contacto
            </h2>
            <p className="text-sm text-muted-foreground">
              Para preguntas sobre estos Términos y Condiciones, contáctenos en:
            </p>
            <p className="text-sm font-mono text-primary mt-2">
              soporte@runplanpro.com
            </p>
          </motion.section>

          {/* Back button */}
          <div className="flex justify-center pt-4 pb-12">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all"
            >
              ENTIENDO, VOLVER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
