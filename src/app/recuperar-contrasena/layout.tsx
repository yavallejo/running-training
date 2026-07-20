import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description:
    "Restablecé la contraseña de tu cuenta de RunPlan Pro para volver a entrenar.",
  alternates: { canonical: "/recuperar-contrasena" },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
