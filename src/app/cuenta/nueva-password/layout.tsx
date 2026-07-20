import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description:
    "Elegí una nueva contraseña para tu cuenta de RunPlan Pro y seguí entrenando.",
  alternates: { canonical: "/cuenta/nueva-password" },
  robots: { index: false, follow: false },
};

export default function NewPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
