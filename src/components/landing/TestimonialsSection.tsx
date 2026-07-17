"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export interface Testimonial {
  name: string;
  initials: string;
  location: string;
  distance: string;
  result: string;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Martín Gutiérrez",
    initials: "MG",
    location: "Buenos Aires",
    distance: "10K",
    result: "52:30",
    quote:
      "Nunca había corrido más de cinco cuadras. El plan me llevó de la mano: cada día sabía exactamente qué hacer. Cuando crucé la meta de mi primer 10K no lo podía creer.",
  },
  {
    name: "Lucía Fernández",
    initials: "LF",
    location: "Córdoba",
    distance: "5K",
    result: "31:12",
    quote:
      "Me compré las zapatillas tres veces antes de animarme. Lo que me cambió todo fue no tener que pensar: abrís el plan, dice qué toca, y salís. Así de simple.",
  },
  {
    name: "Diego Ramírez",
    initials: "DR",
    location: "Rosario",
    distance: "21K",
    result: "1:58:40",
    quote:
      "Bajé 12 kilos siguiendo el plan intermedio. Las semanas de descarga me salvaron las rodillas. Ahora estoy entrenando para mi primera maratón.",
  },
  {
    name: "Carolina Méndez",
    initials: "CM",
    location: "Mendoza",
    distance: "42K",
    result: "4:21:05",
    quote:
      "Corrí mi primera maratón a los 45. El plan de 18 semanas es exigente pero realista: nunca sentí que me pedía de más. Lloré cruzando la meta.",
  },
  {
    name: "Sebastián Torres",
    initials: "ST",
    location: "Montevideo",
    distance: "5K",
    result: "24:48",
    quote:
      "Volvía de una lesión de gemelo con bastante miedo. La progresión suave de las primeras semanas me devolvió la confianza sin apurarme. Hoy corro mejor que antes.",
  },
  {
    name: "Valentina Paz",
    initials: "VP",
    location: "La Plata",
    distance: "10K",
    result: "49:57",
    quote:
      "Entreno tres veces por semana entre el laburo y los chicos. El plan se adaptó a mi vida y no al revés. Constancia pura: en ocho semanas bajé mi tiempo 6 minutos.",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-warning" aria-label="Calificación: 5 de 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      data-testimonial-card
      className="group relative flex w-[82vw] max-w-[420px] shrink-0 flex-col justify-between rounded-3xl bg-surface border border-border/50 p-8 backdrop-blur-sm shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] hover:border-primary/40 hover:shadow-[0_0_30px_-8px_rgba(255,59,48,0.14)] transition-all duration-500 max-md:snap-center motion-reduce:w-full motion-reduce:max-w-2xl"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <Stars />
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold tracking-wide">
            {testimonial.distance} · {testimonial.result}
          </span>
        </div>
        <blockquote>
          <p className="text-foreground/90 leading-relaxed font-mono text-sm">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>
      </div>
      <footer className="relative mt-8 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-black text-sm tracking-tight shrink-0 shadow-[0_0_12px_-3px_rgba(255,59,48,0.15)]"
          style={{ fontFamily: "var(--font-urbanist)" }}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>
        <div>
          <div
            className="font-bold tracking-tight"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            {testimonial.name}
          </div>
          <div className="text-xs font-mono text-muted-foreground tracking-wide uppercase">
            {testimonial.location} · {testimonial.distance}
          </div>
        </div>
      </footer>
    </article>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Header reveal (all screens, motion allowed)
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        "[data-testimonials-head]",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.9,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    // Pinned horizontal scroll — desktop only (pattern from GSAP ScrollTrigger docs)
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getDistance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth);

        gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                gsap.set(progressRef.current, { scaleX: self.progress });
              }
            },
          },
        });
      },
      sectionRef
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="testimonios"
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-label="Testimonios de corredores"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" aria-hidden="true" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />
      <div
        className="absolute top-1/3 left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[auto] md:min-h-screen flex-col justify-center py-24 md:py-0">
        <div className="max-w-6xl mx-auto px-4 w-full text-center">
          <span
            data-testimonials-head
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6"
          >
            Testimonios
          </span>
          <h2
            data-testimonials-head
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            Ellos ya cruzaron
            <span className="block text-primary">la meta</span>
          </h2>
          <p
            data-testimonials-head
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono"
          >
            Corredores que empezaron exactamente donde estás vos hoy.
          </p>

          <div
            data-testimonials-head
            className="hidden md:flex items-center justify-center gap-4 mt-8"
          >
            <div className="w-40 h-0.5 rounded-full bg-border overflow-hidden">
              <div
                ref={progressRef}
                className="h-full w-full bg-primary origin-left scale-x-0"
                aria-hidden="true"
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
              Seguí scrolleando
            </span>
          </div>
        </div>

        <div className="mt-12 md:mt-16 max-md:overflow-x-auto max-md:px-4 max-md:snap-x max-md:snap-mandatory max-md:pb-4">
          <div
            ref={trackRef}
            className="flex w-max gap-6 md:px-[max(1rem,calc(50vw-36rem))] motion-reduce:w-full motion-reduce:flex-col motion-reduce:items-center motion-reduce:gap-8 motion-reduce:px-4"
          >
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
