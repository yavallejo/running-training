import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Nutrición para Corredores",
  description:
    "Qué comer antes, durante y después de correr. Nutrición para runners: hidratación, geles, recuperación y alimentación diaria.",
  alternates: { canonical: "/nutricion" },
  openGraph: {
    title: "Guía de Nutrición para Corredores — RunPlan Pro",
    description:
      "Qué comer antes, durante y después de correr. Nutrición para runners.",
    type: "article",
  },
};

export default function NutricionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
