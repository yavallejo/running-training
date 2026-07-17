"use client";

import { useRef } from "react";
import { useLandingAnimations } from "@/hooks/useLandingAnimations";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const ICON_STROKE = {
  bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  search:
    "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  trendDown:
    "M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  badgeCheck:
    "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  heart:
    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  flag: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5",
} as const;

function StrokeIcon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function PainCard({
  icon,
  index,
  title,
  description,
}: {
  icon: string;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div
      data-reveal-item
      className="group relative p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm overflow-hidden hover:border-danger/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_0_30px_-8px_rgba(239,68,68,0.12)] transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-danger/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      <span
        className="absolute top-6 right-6 text-xs font-mono text-muted-foreground/50 tracking-widest"
        aria-hidden="true"
      >
        {index}
      </span>
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-6 group-hover:scale-110 transition-transform duration-500">
          <StrokeIcon path={icon} className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
    </div>
  );
}

function SolutionCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      data-reveal-item
      className="group relative flex items-start gap-6 p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm hover:border-primary/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_20px_-8px_rgba(255,59,48,0.1)] transition-all duration-500"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
        <StrokeIcon path={icon} className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-150 transition-all duration-300" aria-hidden="true" />
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div data-reveal-item className="relative text-center group">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8rem] sm:text-[10rem] font-black text-primary/[0.06] leading-none select-none" style={{ fontFamily: "var(--font-urbanist)" }} aria-hidden="true">
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
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconClass,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
  featured?: boolean;
}) {
  return (
    <div
      data-reveal-item
      className={`group relative p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(255,59,48,0.12)] transition-all duration-500 overflow-hidden ${
        featured ? "sm:col-span-2 bg-gradient-to-br from-primary/[0.07] to-transparent border-primary/25" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      <div className="relative">
        <div className={iconClass}>{icon}</div>
        <h3 className={`font-bold mb-2 tracking-tight ${featured ? "text-xl" : "text-lg"}`} style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm font-mono leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Plan Diario",
    description: "Cada día sabés exactamente qué hacer. Distancia, ritmo, tipo de sesión. Sin tener que adivinar.",
    iconClass: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Cuenta Regresiva",
    description: "¿Cuántos días para la carrera? Siempre a la vista. La motivación que necesitás para salir.",
    iconClass: "w-11 h-11 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Seguimiento de Progreso",
    description: "Marcá cada sesión completada. Registrá tiempo real, ritmo y cómo te sentiste.",
    iconClass: "w-11 h-11 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Logros y Badges",
    description: "Desbloqueá medallas por cada hito: primera carrera, semana perfecta, 50km acumulados.",
    iconClass: "w-11 h-11 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Recursos y Guías",
    description: "Calentamiento, técnica, nutrición, día de carrera. Todo el conocimiento cuando lo necesitás.",
    iconClass: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Desde Cualquier Dispositivo",
    description: "Celular, tablet o compu. Sin instalación. Abrís el navegador y tu plan está ahí.",
    iconClass: "w-11 h-11 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5h3M12 1.5V3" />
      </svg>
    ),
    title: "Tu Tiempo Final",
    description: "Después de la carrera, cargá tu tiempo real. Suma a los rankings y queda en tu historial.",
    iconClass: "w-11 h-11 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108.966 3.99 2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: "Múltiples Carreras",
    description: "Terminaste una y querés otra. Empezá un plan nuevo cuando quieras. Tu historial queda guardado.",
    iconClass: "w-11 h-11 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    title: "Compartí Tu Progreso",
    description: "Compartí tu plan o tus sesiones en redes. Motivalos a correr.",
    iconClass: "w-11 h-11 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform duration-300",
  },
];

export default function SectionsContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <section
        id="problema"
        data-reveal
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span data-reveal-head className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              El Problema
            </span>
            <h2
              data-reveal-head
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              El problema no es
              <span className="block text-primary"> correr</span>
            </h2>
            <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              El problema es que nadie te dice qué hacer cuando estás en el km 2 y te querés morir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PainCard
              icon={ICON_STROKE.bolt}
              index="01"
              title="Empezás con toda la motivación..."
              description="Te comprás zapatillas nuevas, descargás una app, seguís 3 influencers de running. Todo bien hasta el día 4."
            />
            <PainCard
              icon={ICON_STROKE.search}
              index="02"
              title="...y terminás googoleando..."
              description="'¿Cuánto correr el primer día?', '¿Es normal que me duelan las rodillas?', '¿Cuánto descanso entre sesiones?'"
            />
            <PainCard
              icon={ICON_STROKE.trendDown}
              index="03"
              title="...y terminás abandonando"
              description="Sin un plan claro, cada duda te frena. Una semana se convierte en un mes. Y la carrera sigue ahí, esperándote."
            />
          </div>
        </div>
      </section>

      <section
        id="solucion"
        data-reveal
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span data-reveal-head className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              La Solución
            </span>
            <h2
              data-reveal-head
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Lo que <span className="text-primary">perdés</span> cuando
              <span className="block">no tenés plan</span>
            </h2>
            <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              Cada día sin plan estructurado es un día que podrías haber avanzado con seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <SolutionCard
              icon={ICON_STROKE.clock}
              title="Tiempo"
              description="Horas buscando información, armando rutinas, preguntando en foros. Con un plan, ese tiempo lo recuperás."
            />
            <SolutionCard
              icon={ICON_STROKE.badgeCheck}
              title="Confianza"
              description="Saldrás a correr sabiendo exactamente qué hacer. Sin dudas, sin excusas. Solo salir y hacerlo."
            />
            <SolutionCard
              icon={ICON_STROKE.heart}
              title="Tu cuerpo"
              description="Un plan progresivo te prepara sin lesionarte. Las rodillas te lo van a agradecer."
            />
            <SolutionCard
              icon={ICON_STROKE.flag}
              title="Tu orgullo"
              description="Vas a cruzar la meta sabiendo que hiciste todo bien. Eso no tiene precio."
            />
          </div>
        </div>
      </section>

      <section
        id="pasos"
        data-reveal
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span data-reveal-head className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Cómo Funciona
            </span>
            <h2
              data-reveal-head
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              <span className="text-primary">De 4 a 18 semanas.</span>
              <span className="block">Sin excusas.</span>
            </h2>
            <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              Todo el trabajo pesado está hecho. Vos solo tenés que seguir el plan.
            </p>
          </div>

          <div data-steps-grid className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div
              data-steps-line
              className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60"
              aria-hidden="true"
            />
            <StepCard
              number="01"
              title="Entrás"
              description="Recibís tu usuario. Accedés desde el celular, la tablet o la compu. Sin instalar nada."
            />
            <StepCard
              number="02"
              title="Seguí"
              description="Cada día te dice exactamente qué hacer. Marcás completada cuando la terminás. Seguís al siguiente."
            />
            <StepCard
              number="03"
              title="Llegás"
              description="Te plantás en la línea de largada de TU carrera. Hiciste todo lo que tenías que hacer. Ahora solo disfrutá."
            />
          </div>
        </div>
      </section>

      <section data-reveal className="relative py-32 sm:py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span data-reveal-head className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Todo Incluido
            </span>
            <h2
              data-reveal-head
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              Tu entrenador personal,
              <span className="block text-primary">en tu bolsillo</span>
            </h2>
            <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto font-mono">
              Todo lo que necesitás para llegar a la línea de largada. Sin excusas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section
        id="comunidad"
        data-reveal
        className="relative py-32 sm:py-40 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span data-reveal-head className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Comunidad
            </span>
            <h2
              data-reveal-head
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              No corras
              <span className="block text-primary">solo</span>
            </h2>
            <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto font-mono">
              Activá tu perfil público y competí con corredores que comparten tu distancia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <FeatureCard
              icon="🏆"
              iconClass="text-3xl mb-4"
              title="Rankings por trofeos"
              description="Desbloqueá logros y aparecé en el ranking. Cuantos más trofeos, más arriba."
            />
            <FeatureCard
              icon="📏"
              iconClass="text-3xl mb-4"
              title="Por distancia y ritmo"
              description="Filtrá por 5K, 7K, 10K. Compará tu tiempo final con el de tu categoría."
            />
            <FeatureCard
              icon="🔒"
              iconClass="text-3xl mb-4"
              title="Vos decidís qué se ve"
              description="Tu perfil es privado por defecto. Activá el modo público cuando quieras."
            />
          </div>

          <div className="text-center mt-12" data-reveal-item>
            <a
              href="/rankings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            >
              Ver rankings
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section
        id="cta"
        data-reveal
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden="true">
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
          <h2
            data-reveal-head
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-8"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            <span className="text-primary">Cada día</span> que pasa
            <span className="block">es un día menos</span>
          </h2>
          <p data-reveal-head className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-mono leading-relaxed">
            Tu carrera no va a esperar. Preguntarte &ldquo;y si hubiera arrancado&rdquo; no es una opción. Arrancá ahora.
          </p>
          <div data-reveal-item>
            <button
              onClick={() => {
                const event = new CustomEvent("open-login-modal");
                window.dispatchEvent(event);
              }}
              className="group relative px-14 py-6 rounded-2xl font-bold text-xl text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] glow-primary"
              aria-label="Empezá ahora"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true" />
              <span className="relative flex items-center justify-center gap-4">
                <span className="font-mono tracking-tight">EMPEZÁ AHORA</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
            <p className="mt-6 text-sm font-mono text-muted-foreground tracking-wide">
              SIN TARJETA · SIN COMPROMISO · ACCEDÉ HOY
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
