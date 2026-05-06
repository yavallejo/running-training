import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse",
  description:
    "Creá tu cuenta gratuita en RunPlan Pro y empezá tu plan de entrenamiento para correr.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
