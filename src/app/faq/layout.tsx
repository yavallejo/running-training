import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Respuestas a las dudas más comunes de runners principiantes: ¿cuánto correr?, ¿qué zapatillas usar?, ¿cómo evitar lesiones?",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Preguntas Frecuentes — RunPlan Pro",
    description:
      "Respuestas a las dudas más comunes de runners principiantes.",
    type: "website",
  },
};

export default function FAQPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
