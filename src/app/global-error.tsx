"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">💥</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
              Algo salió muy mal
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              La app encontró un error inesperado. Tu plan y progreso están a salvo.
            </p>
          </div>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/50">
              ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            >
              Reintentar
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="px-4 py-3 rounded-xl border border-border/50 bg-background text-sm font-mono hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
