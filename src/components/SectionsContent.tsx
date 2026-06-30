"use client";

function PainCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm overflow-hidden hover:border-primary/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_0_30px_-8px_rgba(255,59,48,0.14)] transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="text-5xl mb-6" role="img" aria-label={title}>{emoji}</div>
        <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
    </div>
  );
}

function SolutionCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex items-start gap-6 p-8 rounded-3xl bg-surface border border-border backdrop-blur-sm hover:border-primary/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_20px_-8px_rgba(255,59,48,0.1)] transition-all duration-500">
      <div className="flex-shrink-0 text-4xl" role="img" aria-label={title}>{emoji}</div>
      <div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed font-mono text-sm">{description}</p>
      </div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-150 transition-all duration-300" />
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
    <div className="relative text-center group">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8rem] sm:text-[10rem] font-black text-primary/[0.06] leading-none select-none" style={{ fontFamily: "var(--font-urbanist)" }}>
        {number}
      </div>
      <div className="relative pt-16 pb-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px:-4px_rgba(255,59,48,0.2)] transition-all duration-500">
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
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(255,59,48,0.12)] transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className={iconClass}>{icon}</div>
        <h3 className="text-lg font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
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
    description: "Cada día sabés exactamente qué hacer. Distancia, ritmo, tipo de sesión. Sin adivinar.",
    iconClass: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Cuenta Regresiva",
    description: "¿Cuántos días para la carrera? Siempre a la vista. La urgencia que necesitás para salir.",
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
];

export default function SectionsContent() {
  return (
    <>
      <section
        id="problema"
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PainCard
              emoji="😰"
              title="Empezás con toda la motivación..."
              description="Te comprás zapatillas nuevas, descargás una app, seguís 3 influencers de running. Todo bien hasta el día 4."
            />
            <PainCard
              emoji="🌀"
              title="...y terminás googoleando..."
              description="'¿Cuánto correr el primer día?', '¿Es normal que me duelan las rodillas?', '¿Cuánto descanso entre sesiones?'"
            />
            <PainCard
              emoji="😞"
              title="...y terminás abandonando"
              description="Sin un plan claro, cada duda te frena. Una semana se convierte en un mes. Y la carrera sigue ahí, esperándote."
            />
          </div>
        </div>
      </section>

      <section
        id="solucion"
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <SolutionCard
              emoji="⏰"
              title="Tiempo"
              description="Horas buscando información, armando rutinas, preguntando en foros. Con un plan, ese tiempo lo recuperás."
            />
            <SolutionCard
              emoji="🏃"
              title="Confianza"
              description="Saldrás a correr sabiendo exactamente qué hacer. Sin dudas, sin excusas. Solo salir y hacerlo."
            />
            <SolutionCard
              emoji="❤️"
              title="Tu cuerpo"
              description="Un plan progresivo te prepara sin lesionarte. Las rodillas te lo van a agradecer."
            />
            <SolutionCard
              emoji="🏁"
              title="Tu orgullo"
              description="Vas a cruzar la meta sabiendo que hiciste todo bien. Eso no tiene precio."
            />
          </div>
        </div>
      </section>

      <section
        id="pasos"
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number="01"
              title="Entrás"
              description="Recibís tu usuario. Accedés desde el celular, la tablet o la compu. Sin instalado nada."
            />
            <StepCard
              number="02"
              title="Seguí"
              description="Cada día te dice exactamente qué hacer. Marcás completed cuando lo terminás. Seguís al siguiente."
            />
            <StepCard
              number="03"
              title="Llegás"
              description="Te plantás en la línea de largada de TU carrera. Hiciste todo lo que tenías que hacer. Ahora solo disfrutá."
            />
          </div>
        </div>
      </section>

      <section className="relative py-32 sm:py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="comunidad"
        className="relative py-32 sm:py-40 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              Comunidad
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
              style={{ fontFamily: "var(--font-urbanist)" }}
            >
              No corras
              <span className="block text-primary">solo</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto font-mono">
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

          <div className="text-center mt-12">
            <a
              href="/rankings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            >
              Ver rankings
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section
        id="cta"
        className="relative py-32 sm:py-48 px-4 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-primary/30 via-primary/12 to-transparent rounded-full blur-3xl" aria-hidden="true" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
            onClick={() => {
              const event = new CustomEvent("open-login-modal");
              window.dispatchEvent(event);
            }}
            className="group relative px-14 py-6 rounded-2xl font-bold text-xl text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] glow-primary"
            aria-label="Empezá ahora"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
      </section>
    </>
  );
}