import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checklist del Día de la Carrera",
  description:
    "Todo lo que necesitás para el día de tu carrera: checklist completo, estrategia de ritmo por distancia y consejos para llegar preparado.",
  alternates: { canonical: "/dia-carrera" },
  openGraph: {
    title: "Checklist del Día de la Carrera — RunPlan Pro",
    description:
      "Todo lo que necesitás para el día de tu carrera: checklist, ritmo y consejos.",
    type: "article",
  },
};

export default function DiaCarreraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
