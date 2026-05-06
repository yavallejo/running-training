import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de RunPlan Pro. Aviso médico importante: consultá a un profesional antes de comenzar cualquier plan de entrenamiento.",
  alternates: { canonical: "/terminos" },
  openGraph: {
    title: "Términos y Condiciones — RunPlan Pro",
    description:
      "Términos y condiciones de uso. Aviso médico importante.",
    type: "website",
  },
};

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
