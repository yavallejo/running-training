import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificando tu enlace",
  description:
    "Estamos verificando tu enlace de autenticación para RunPlan Pro.",
  alternates: { canonical: "/auth/confirm" },
  robots: { index: false, follow: false },
};

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
