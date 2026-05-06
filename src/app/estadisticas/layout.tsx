import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estadísticas",
  description:
    "Seguí tu progreso: kilómetros acumulados, bienestar promedio, peso, logros desbloqueados. Visualizá tu evolución como runner.",
  alternates: { canonical: "/estadisticas" },
  openGraph: {
    title: "Estadísticas — RunPlan Pro",
    description:
      "Seguí tu progreso: kilómetros acumulados, bienestar promedio, logros y más.",
    type: "website",
  },
};

export default function EstadisticasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
