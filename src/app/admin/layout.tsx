import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description:
    "Panel de administración de RunPlan Pro. Gestión de usuarios y planes de entrenamiento.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
