import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil",
  description:
    "Gestioná tu perfil de corredor: datos personales, distancia objetivo, nivel de experiencia y preferencias de entrenamiento.",
  alternates: { canonical: "/profile" },
  openGraph: {
    title: "Mi Perfil — RunPlan Pro",
    description:
      "Gestioná tu perfil de corredor: datos, distancia, nivel y preferencias.",
    type: "website",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
