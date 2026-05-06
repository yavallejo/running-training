import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada | RunPlan Pro",
  description:
    "La página que buscás no existe. Volvé al inicio para continuar con tu plan de entrenamiento.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1
        className="text-6xl font-black text-primary mb-4"
        style={{ fontFamily: "var(--font-urbanist)" }}
      >
        404
      </h1>
      <p className="text-xl text-muted-foreground mb-8 font-mono">
        Esta página no existe
      </p>
      <Link
        href="/"
        className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
