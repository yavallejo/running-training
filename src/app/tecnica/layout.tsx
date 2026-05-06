import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Técnica de Carrera",
  description:
    "Mejorá tu técnica de carrera: postura correcta, zancada, cadencia, respiración y errores comunes. Corré más eficiente y sin lesiones.",
  alternates: { canonical: "/tecnica" },
  openGraph: {
    title: "Guía de Técnica de Carrera — RunPlan Pro",
    description:
      "Mejorá tu técnica: postura, zancada, cadencia, respiración y errores comunes.",
    type: "article",
  },
};

export default function TecnicaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
