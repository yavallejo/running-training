import { Metadata } from "next";
import PublicHeader from "@/components/PublicHeader";
import HeroContent from "@/components/HeroContent";
import LoginModalHandler from "@/components/LoginModalHandler";
import SectionsContent from "@/components/SectionsContent";
import HeroSceneWrapper from "@/components/landing/HeroSceneWrapper";
import Marquee from "@/components/landing/Marquee";
import ScrollProgress from "@/components/landing/ScrollProgress";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FOOTER_SECTIONS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#problema", label: "El Problema" },
  { href: "#solucion", label: "Solución" },
  { href: "#pasos", label: "Cómo Funciona" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#comunidad", label: "Comunidad" },
];

const FOOTER_RESOURCES = [
  { href: "/guia-principiante", label: "Guía Principiante" },
  { href: "/calentamiento", label: "Calentamiento" },
  { href: "/tecnica", label: "Técnica de Carrera" },
  { href: "/nutricion", label: "Nutrición" },
  { href: "/dia-carrera", label: "Día de Carrera" },
  { href: "/playlist", label: "Playlists" },
];

const FOOTER_ACCOUNT = [
  { href: "/registro", label: "Registrarse" },
  { href: "/iniciar-sesion", label: "Iniciar Sesión" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "Preguntas Frecuentes" },
  { href: "/terminos", label: "Términos" },
];

export const metadata: Metadata = {
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "RunPlan Pro",
      url: "https://runplan-pro.vercel.app",
      logo: "https://runplan-pro.vercel.app/icon.svg",
      description:
        "Plan de entrenamiento personalizado para correr. De 3K a 42K, con progresión adaptada a tu nivel.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
      },
      sameAs: [],
    }),
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgress />
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.022]"
        style={{ backgroundImage: GRAIN_SVG }}
        aria-hidden="true"
      />
      <PublicHeader />
      <LoginModalHandler />

      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-gradient-to-br from-primary/25 via-primary/8 to-transparent rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true" />
          </div>
          <HeroSceneWrapper />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
        </div>

        <HeroContent />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </section>

      <Marquee />

      <SectionsContent />

      <footer className="relative pt-20 pb-10 px-4 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-surface/30 to-transparent" aria-hidden="true" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
            <div className="col-span-2 md:col-span-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM12 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM15.75 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Z" />
                  </svg>
                </div>
                <span className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                  RUNPLAN<span className="text-primary">PRO</span>
                </span>
              </div>
              <p className="mt-5 text-sm font-mono text-muted-foreground leading-relaxed max-w-xs">
                Tu entrenador personal en tu bolsillo. De 3K a 42K, con progresión adaptada a tu nivel.
              </p>
              <p className="mt-4 text-[11px] font-mono tracking-[0.3em] uppercase text-primary">
                Sin excusas
              </p>
            </div>

            <nav className="md:col-span-2" aria-label="Secciones del landing">
              <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-foreground mb-5">Secciones</h3>
              <ul className="space-y-3">
                {FOOTER_SECTIONS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="md:col-span-2" aria-label="Recursos para corredores">
              <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-foreground mb-5">Recursos</h3>
              <ul className="space-y-3">
                {FOOTER_RESOURCES.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="md:col-span-3" aria-label="Tu cuenta">
              <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-foreground mb-5">Cuenta</h3>
              <ul className="space-y-3">
                {FOOTER_ACCOUNT.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-muted-foreground tracking-wide">
              © 2026 RUNPLAN PRO
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/70 tracking-[0.25em] uppercase">
              Tu distancia · Tu fecha · Tu carrera
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}