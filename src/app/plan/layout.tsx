import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Plan",
  description:
    "Tu plan de entrenamiento diario. Sesiones adaptadas a tu nivel, ritmo y distancia objetivo. Marcá cada sesión completada y seguí avanzando.",
  alternates: { canonical: "/plan" },
  openGraph: {
    title: "Mi Plan — RunPlan Pro",
    description:
      "Tu plan de entrenamiento diario. Sesiones adaptadas a tu nivel, ritmo y distancia objetivo.",
    type: "website",
  },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
