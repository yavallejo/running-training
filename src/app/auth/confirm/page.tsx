"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const next = searchParams.get("next") ?? "/iniciar-sesion";

      if (!token_hash || !type) {
        router.replace("/auth/error");
        return;
      }

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });

        if (verifyError) {
          setError(verifyError.message);
          window.setTimeout(() => router.replace("/auth/error"), 1500);
          return;
        }

        router.replace(next);
      } catch (e: any) {
        setError(e?.message ?? "Error de verificación");
        window.setTimeout(() => router.replace("/auth/error"), 1500);
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background">
      {error ? (
        <p className="text-sm text-danger max-w-sm text-center px-4">{error}</p>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      )}
    </main>
  );
}
