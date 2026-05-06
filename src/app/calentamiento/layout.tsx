import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Calentamiento y Enfriamiento",
  description:
    "Rutinas de calentamiento y enfriamiento para antes y después de correr. Activación muscular, movilidad articular y estiramientos según temperatura.",
  alternates: { canonical: "/calentamiento" },
  openGraph: {
    title: "Guía de Calentamiento y Enfriamiento — RunPlan Pro",
    description:
      "Rutinas de calentamiento y enfriamiento para antes y después de correr.",
    type: "article",
  },
};

export default function CalentamientoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
