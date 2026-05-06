import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Clima para Corredores",
  description:
    "Consejos para correr según el clima: sol, lluvia, viento, frío y calor. Vestimenta, hidratación y precauciones para cada condición.",
  alternates: { canonical: "/clima" },
  openGraph: {
    title: "Guía de Clima para Corredores — RunPlan Pro",
    description:
      "Consejos para correr según el clima: sol, lluvia, viento, frío y calor.",
    type: "article",
  },
};

export default function ClimaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
