import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Conocé todas las funcionalidades de RunPlan Pro: plan diario, cuenta regresiva, seguimiento de progreso, logros y más.",
  alternates: { canonical: "/funcionalidades" },
  openGraph: {
    title: "Funcionalidades — RunPlan Pro",
    description:
      "Conocé todas las funcionalidades: plan diario, cuenta regresiva, seguimiento y más.",
    type: "website",
  },
};

export default function FuncionalidadesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
