import { Metadata } from "next";
import PublicHeader from "@/components/PublicHeader";
import HeroContent from "@/components/HeroContent";
import LoginModalHandler from "@/components/LoginModalHandler";
import SectionsContent from "@/components/SectionsContent";

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
      <PublicHeader />
      <LoginModalHandler />

      <section
        id="inicio"
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

        <HeroContent />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </section>

      <SectionsContent />

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