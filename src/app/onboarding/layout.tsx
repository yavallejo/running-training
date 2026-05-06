import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalizar Plan",
  description:
    "Completá el cuestionario para personalizar tu plan de entrenamiento según tu nivel, objetivos y disponibilidad.",
  alternates: { canonical: "/onboarding" },
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
