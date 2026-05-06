import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía del Runner Principiante",
  description:
    "Guía completa para empezar a correr desde cero: cómo elegir zapatillas, primeros pasos, ropa, hidratación y errores comunes a evitar.",
  alternates: { canonical: "/guia-principiante" },
  openGraph: {
    title: "Guía del Runner Principiante — RunPlan Pro",
    description:
      "Guía completa para empezar a correr desde cero: zapatillas, primeros pasos y más.",
    type: "article",
  },
};

export default function GuiaPrincipianteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
