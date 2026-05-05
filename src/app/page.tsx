"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import PublicHeader from "@/components/PublicHeader";
import LoginModal from "@/components/LoginModal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const heroRef = useRef(null);
  const problemaRef = useRef(null);
  const solucionRef = useRef(null);
  const pasosRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

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
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-gradient-to-br from-primary/25 via-primary/8 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-background to-transparent" />
        </div>

        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface/80 backdrop-blur-sm border border-border/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm font-mono tracking-tight text-muted-foreground">
                TU PRIMERA CARRERA TE ESPERA
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-[-0.03em] leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            <span className="block text-primary">QUERÉS CORRER.</span>
            <span className="block text-[0.5em] text-muted-foreground mt-2 font-medium">
              PERO NO SABÉS CÓMO ARRANCAR.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 font-mono leading-relaxed"
          >
            <span className="text-foreground">No necesitás otro tutorial.</span> Necesitás saber exactamente qué hacer mañana, pasado, y el día después — sin pensarlo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-3">
                <span className="font-mono tracking-tight">ARRANCÁ TU PLAN</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 p-8 rounded-3xl bg-surface border border-primary/30 backdrop-blur-sm shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07),0_0_40px_-12px_rgba(255,59,48,0.2)]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                  3K–7K
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">Principiante</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                  10K–15K
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">Intermedio</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                  21K–42K
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">Avanzado</div>
              </div>
            </div>
            <p className="mt-6 text-sm font-mono text-muted-foreground text-center tracking-wide">
              TU DISTANCIA · TU FECHA · TU CARRERA
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <section
        id="problema"
        ref={problemaRef}
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={problemaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              El Problema
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              El problema no es
              <span className="block text-primary"> correr</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
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
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={solucionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              La Solución
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Lo que <span className="text-primary">perdés</span> cuando
              <span className="block">no tenés plan</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              Cada día sin plan estructurado es un día que podrías haber avanzado con seguridad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
              description="Saldrás a correr sabiendo exactamente qué hacer. Sin dudas, sin excusas. Solo salir y hacerlo."
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
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={pasosInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Cómo Funciona
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              <span className="text-primary">De 4 a 18 semanas.</span>
              <span className="block">Sin excusas.</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              Todo el trabajo pesado está hecho. Vos solo tenés que seguir el plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number="01"
              title="Entrás"
              description="Recibís tu usuario. Accedés desde el celular, la tablet o la compu. Sin instalado nada."
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

      <section className="relative py-32 sm:py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Todo Incluido
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Tu entrenador personal,
              <span className="block text-primary">en tu bolsillo</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto font-mono">
              Todo lo que necesitás para llegar a la línea de largada. Sin excusas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
                title: "Plan Diario",
                description: "Cada día sabés exactamente qué hacer. Distancia, ritmo, tipo de sesión. Sin adivinar.",
                iconClass: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Cuenta Regresiva",
                description: "¿Cuántos días para la carrera? Siempre a la vista. La urgencia que necesitás para salir.",
                iconClass: "w-11 h-11 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning mb-4 group-hover:scale-110 transition-transform duration-300",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: "Seguimiento de Progreso",
                description: "Marcá cada sesión completada. Registrá tiempo real, ritmo y cómo te sentiste.",
                iconClass: "w-11 h-11 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform duration-300",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ),
                title: "Logros y Badges",
                description: "Desbloqueá medallas por cada hito: primera carrera, semana perfecta, 50km acumulados.",
                iconClass: "w-11 h-11 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform duration-300",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
                title: "Recursos y Guías",
                description: "Calentamiento, técnica, nutrición, día de carrera. Todo el conocimiento cuando lo necesitás.",
                iconClass: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                ),
                title: "Desde Cualquier Dispositivo",
                description: "Celular, tablet o compu. Sin instalación. Abrís el navegador y tu plan está ahí.",
                iconClass: "w-11 h-11 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground mb-4 group-hover:scale-110 transition-transform duration-300",
              },
            ].map(({ icon, title, description, iconClass }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(255,59,48,0.12)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className={iconClass}>{icon}</div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-mono leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cta"
        ref={ctaRef}
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-primary/30 via-primary/12 to-transparent rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonal" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 40 L 40 0" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-8"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              <span className="text-primary">Cada día</span> que pasa
              <span className="block">es un día menos</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-mono leading-relaxed">
              Tu carrera no va a esperar. Preguntarte &ldquo;y si hubiera arrancado&rdquo; no es una opción. Arrancá ahora.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="group relative px-14 py-6 rounded-2xl font-bold text-xl text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] glow-primary"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-4">
                <span className="font-mono tracking-tight">EMPEZÁ AHORA</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
            <p className="mt-6 text-sm font-mono text-muted-foreground tracking-wide">
              SIN TARJETA · SIN COMPROMISO · ACCEDÉ HOY
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="relative py-16 px-4 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-surface/30 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM12 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM15.75 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                RUNPLAN<span className="text-primary">PRO</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
              <a href="#inicio" className="hover:text-foreground transition-colors tracking-wide">INICIO</a>
              <span className="text-border">·</span>
              <a href="#problema" className="hover:text-foreground transition-colors tracking-wide">PROBLEMA</a>
              <span className="text-border">·</span>
              <a href="#solucion" className="hover:text-foreground transition-colors tracking-wide">SOLUCIÓN</a>
              <span className="text-border">·</span>
              <a href="#pasos" className="hover:text-foreground transition-colors tracking-wide">CÓMO</a>
            </div>

            <p className="text-sm font-mono text-muted-foreground">
              © 2026 RUNPLAN PRO
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
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm overflow-hidden hover:border-primary/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_0_30px_-8px_rgba(255,59,48,0.14)] transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="text-5xl mb-6">{emoji}</div>
        <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
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
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex items-start gap-6 p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm hover:border-primary/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_20px_-8px_rgba(255,59,48,0.1)] transition-all duration-500"
    >
      <div className="flex-shrink-0 text-4xl">{emoji}</div>
      <div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-150 transition-all duration-300" />
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
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative text-center group"
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8rem] sm:text-[10rem] font-black text-primary/[0.06] leading-none select-none" style={{ fontFamily: "var(--font-urbanist)" }}>
        {number}
      </div>
      <div className="relative pt-16 pb-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_-4px_rgba(255,59,48,0.2)] transition-all duration-500">
          <span className="text-2xl font-black text-primary tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
            {number}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto font-mono text-sm">{description}</p>
      </div>
      {number !== "03" && (
        <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-gradient-to-r from-border to-transparent" />
      )}
    </motion.div>
  );
}