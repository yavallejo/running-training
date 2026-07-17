"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verificando tu email…");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as
      | "email"
      | "recovery"
      | "invite"
      | "email_change"
      | "signup"
      | null;
    const next = searchParams.get("next") || "/iniciar-sesion";

    async function verify() {
      if (!tokenHash || !type) {
        router.replace("/auth/error");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        console.error("verifyOtp error:", error);
        router.replace("/auth/error");
        return;
      }

      // Email confirmed. For recovery we send the user to the reset form;
      // otherwise to the post-login destination.
      const destination =
        type === "recovery" ? "/cuenta/nueva-password" : next;
      router.replace(destination);
    }

    verify();
  }, [router, searchParams]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-white animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </div>
        <h1
          className="text-2xl font-black tracking-tight mb-2"
          style={{ fontFamily: "var(--font-urbanist)" }}
        >
          Confirmando tu cuenta
        </h1>
        <p className="text-sm text-muted-foreground">{status}</p>
      </motion.div>
    </main>
  );
}
