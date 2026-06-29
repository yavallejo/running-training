"use client";

export default function HeroContent() {
  return (
    <div className="relative z-10 max-w-5xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface/80 backdrop-blur-sm border border-border/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-sm font-mono tracking-tight text-muted-foreground">
            TU PRIMERA CARRERA TE ESPERA
          </span>
        </div>
      </div>

      <h1
        className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-[-0.03em] leading-[0.95] mb-8"
        style={{ fontFamily: "var(--font-urbanist)" }}
      >
        <span className="block text-primary">QUERÉS CORRER.</span>
        <span className="block text-[0.5em] text-muted-foreground mt-2 font-medium">
          PERO NO SABÉS CÓMO ARRANCAR.
        </span>
      </h1>

      <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 font-mono leading-relaxed">
        <span className="text-foreground">No necesitás otro tutorial.</span> Necesitás saber exactamente qué hacer mañana, pasado, y el día después — sin pensarlo.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <button
          onClick={() => {
            const event = new CustomEvent("open-login-modal");
            window.dispatchEvent(event);
          }}
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
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-surface border border-primary/30 backdrop-blur-sm shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07),0_0_40px_-12px_rgba(255,59,48,0.2)]">
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
      </div>
    </div>
  );
}