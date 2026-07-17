"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-danger to-danger/60 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
          Link inválido o expirado
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          El enlace de confirmación o recuperación no es válido, ya expiró, o
          fue utilizado. Pedí uno nuevo desde la pantalla de inicio de sesión.
        </p>
        <Link
          href="/iniciar-sesion"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
        >
          Volver a iniciar sesión
        </Link>
      </motion.div>
    </main>
  );
}
