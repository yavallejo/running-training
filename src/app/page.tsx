"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import PublicHeader from "@/components/PublicHeader";
import LoginModal from "@/components/LoginModal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const heroRef = useRef(null);
  const problemaRef = useRef(null);
  const solucionRef = useRef(null);
  const pasosRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const problemaInView = useInView(problemaRef, { once: true, margin: "-100px" });
  const solucionInView = useInView(solucionRef, { once: true, margin: "-100px" });
  const pasosInView = useInView(pasosRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} showRegisterHint />

      <section
        id="inicio"
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-secondary/10 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Tu primera carrera te espera
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            <span className="text-primary">Querés</span> correr 7km.
            <br />
            <span className="text-muted-foreground">Pero cada vez que arrancás, terminás abandonando.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            No necesitás otro tutorial de YouTube. Necesitás saber exactamente qué hacer mañana,
            pasado, y el día después — sin pensarlo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:to-primary/90 transition-all" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                Arrancá tu plan
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-16 p-6 rounded-2xl bg-surface-elevated/50 border border-border backdrop-blur-sm"
          >
            <p className="text-sm text-muted-foreground mb-4">
              No importa si nunca corriste o si ya tenés experiencia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                  7km
                </div>
                <div className="text-xs text-muted-foreground mt-1">Principiante</div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                  11km
                </div>
                <div className="text-xs text-muted-foreground mt-1">Intermedio</div>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground/70">
              Tu distancia · Tu fecha · Tu carrera
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <section
        id="problema"
        ref={problemaRef}
        className="py-20 sm:py-32 px-4 bg-surface-elevated/30"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={problemaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              El problema no es<span className="text-primary"> correr</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              El problema es que nadie te dice qué hacer cuando estás en el km 2 y te querés morir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PainCard
              emoji="😰"
              title="Empezás con toda la motivación..."
              description="Te comprás zapatillas nuevas, descargás una app, seguís 3 influencers de running. Todo bien hasta el día 4."
              delay={0}
              inView={problemaInView}
            />
            <PainCard
              emoji="🌀"
              title="...y terminás googoleando..."
              description="'¿Cuánto correr el primer día?', '¿Es normal que me duelan las rodillas?', '¿Cuánto descanso entre sesiones?'"
              delay={0.1}
              inView={problemaInView}
            />
            <PainCard
              emoji="😞"
              title="...y terminás abandonando"
              description="Sin un plan claro, cada duda te frena. Una semana se convierte en un mes. Y la carrera sigue ahí, esperándote."
              delay={0.2}
              inView={problemaInView}
            />
          </div>
        </div>
      </section>

      <section
        id="solucion"
        ref={solucionRef}
        className="py-20 sm:py-32 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={solucionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Lo que <span className="text-primary">perdés</span> cuando no tenés plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada día sin plan estructurado es un día que podrías haber avanzado con seguridad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <SolutionCard
              emoji="⏰"
              title="Tiempo"
              description="Horas buscando información, armando rutinas, preguntando en foros. Con un plan, ese tiempo lo recuperás."
              delay={0}
              inView={solucionInView}
            />
            <SolutionCard
              emoji="🏃"
              title="Confianza"
              description="Saldrés a correr sabiendo exactamente qué hacer. Sin dudas, sin excusas. Solo salir y hacerlo."
              delay={0.15}
              inView={solucionInView}
            />
            <SolutionCard
              emoji="❤️"
              title="Tu cuerpo"
              description="Un plan progresivo te prepara sin lesionarte. Las rodillas te lo van a agradecer."
              delay={0.3}
              inView={solucionInView}
            />
            <SolutionCard
              emoji="🏁"
              title="Tu orgullo"
              description="Vas a cruzar la meta sabiendo que hiciste todo bien. Eso no tiene precio."
              delay={0.45}
              inView={solucionInView}
            />
          </div>
        </div>
      </section>

      <section
        id="pasos"
        ref={pasosRef}
        className="py-20 sm:py-32 px-4 bg-surface-elevated/30"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={pasosInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Tres semanas. <span className="text-primary">Sin excusas.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo el trabajo pesado está hecho. Vos solo tenés que seguir el plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Entrás"
              description="Recibís tu usuario. Accedés desde el celular, la tablet o la compu. Sin instalada nada."
              delay={0}
              inView={pasosInView}
            />
            <StepCard
              number="02"
              title="Seguí"
              description="Cada día te dice exactamente qué hacer. Marcás completed cuando lo terminás. Seguís al siguiente."
              delay={0.15}
              inView={pasosInView}
            />
            <StepCard
              number="03"
              title="Llegás"
              description="Te plantás en la línea de largada de TU carrera. Hiciste todo lo que tenías que hacer. Ahora solo disfrutá."
              delay={0.3}
              inView={pasosInView}
            />
          </div>
        </div>
      </section>

      <section
        id="cta"
        ref={ctaRef}
        className="py-20 sm:py-32 px-4 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Cada día que pasa es <span className="text-primary">un día menos</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Tu carrera no va a esperar. Preguntarte &ldquo;y si hubiera arrancado&rdquo; no es una opción.
              Arrancá ahora.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="group relative px-10 py-5 rounded-xl font-semibold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:to-primary/90 transition-all" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-3">
                Empezá Ahora
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
            <p className="mt-4 text-sm text-muted-foreground">
              Sin tarjeta de crédito · Sin compromiso · Accedé hoy
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM12 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM15.75 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Z"
                  />
                </svg>
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                RunPlan<span className="text-primary"> Pro</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#inicio" className="hover:text-foreground transition-colors">Inicio</a>
              <span>·</span>
              <a href="#problema" className="hover:text-foreground transition-colors">El Problema</a>
              <span>·</span>
              <a href="#solucion" className="hover:text-foreground transition-colors">Solución</a>
              <span>·</span>
              <a href="#pasos" className="hover:text-foreground transition-colors">Cómo Funciona</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 RunPlan Pro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PainCard({
  emoji,
  title,
  description,
  delay,
  inView,
}: {
  emoji: string;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="p-6 sm:p-8 rounded-2xl bg-background border border-border"
    >
      <div className="text-4xl mb-4">{emoji}</div>
      <h3
        className="text-xl font-bold mb-3"
        style={{ fontFamily: "var(--font-urbanist)" }}
      >
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SolutionCard({
  emoji,
  title,
  description,
  delay,
  inView,
}: {
  emoji: string;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex items-start gap-4 p-6 rounded-2xl bg-surface-elevated border border-border"
    >
      <div className="text-4xl flex-shrink-0">{emoji}</div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "var(--font-urbanist)" }}
        >
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay,
  inView,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative text-center"
    >
      <div className="text-6xl sm:text-7xl font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2" style={{ fontFamily: "var(--font-urbanist)" }}>
        {number}
      </div>
      <div className="relative pt-12">
        <h3
          className="text-xl sm:text-2xl font-bold mb-4"
          style={{ fontFamily: "var(--font-urbanist)" }}
        >
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
    </motion.div>
  );
}