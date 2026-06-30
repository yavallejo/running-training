"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("[RankingsErrorBoundary]", error);
    }
  }, [error]);

  return (
    <main className="flex-1 min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">🏆</div>
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
            No pudimos cargar los rankings
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Intenta de nuevo en un momento.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
