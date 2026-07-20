"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Diagnostic {
  step: string;
  detail: string;
  data?: unknown;
  ts: string;
}

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
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Iniciando verificación...");
  const [logs, setLogs] = useState<Diagnostic[]>([]);
  const [autoRedirect, setAutoRedirect] = useState(true);

  const addLog = (step: string, detail: string, data?: unknown) => {
    const entry: Diagnostic = {
      step,
      detail,
      data,
      ts: new Date().toISOString().split("T")[1].slice(0, 12),
    };
    setLogs((prev) => [...prev, entry]);
    console.log(`[Confirm:${entry.step}]`, entry.detail, data ?? "");
  };

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const next = searchParams.get("next") ?? "/iniciar-sesion";

      addLog("PARAMS", "Parámetros leídos de la URL", {
        token_hash: token_hash ? `${token_hash.slice(0, 12)}...(${token_hash.length} chars)` : null,
        type,
        next,
        allSearchParams: Object.fromEntries(searchParams.entries()),
        currentUrl: window.location.href,
      });

      if (!token_hash || !type) {
        addLog("MISSING_PARAMS", "Faltan token_hash o type en la URL");
        setError("Faltan parámetros en el enlace (token_hash o type).");
        setErrorCode("missing_params");
        setStatus("Error: parámetros faltantes");
        return;
      }

      addLog("CALLING_VERIFY", `Llamando supabase.auth.verifyOtp({ type: "${type}", token_hash: "${token_hash.slice(0, 12)}..." })`);

      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });

        addLog("VERIFY_RESPONSE", verifyError ? "verifyOtp retornó error" : "verifyOtp retornó éxito", {
          hasSession: !!data?.session,
          hasUser: !!data?.user,
          userId: data?.user?.id,
          userEmail: data?.user?.email,
          emailConfirmedAt: data?.user?.email_confirmed_at,
          error: verifyError
            ? {
                name: verifyError.name,
                message: verifyError.message,
                status: verifyError.status,
                code: (verifyError as any).code,
              }
            : null,
        });

        if (verifyError) {
          setError(verifyError.message);
          setErrorCode((verifyError as any).code ?? verifyError.name ?? "verify_error");
          setStatus(`Error en verifyOtp: ${verifyError.message}`);
          return;
        }

        addLog("SUCCESS", `Verificación exitosa. Redirigiendo a: ${next}`, {
          sessionAccessToken: data?.session?.access_token
            ? `${data.session.access_token.slice(0, 20)}...`
            : null,
        });
        setStatus(`Verificación exitosa. Redirigiendo a ${next}...`);
        router.replace(next);
      } catch (e: any) {
        addLog("EXCEPTION", "Excepción capturada en el try/catch", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack?.split("\n").slice(0, 3).join("\n"),
        });
        setError(e?.message ?? "Error de verificación");
        setErrorCode(e?.name ?? "exception");
        setStatus(`Excepción: ${e?.message ?? "desconocida"}`);
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          {error ? (
            <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{status}</p>
            {errorCode && (
              <p className="text-xs font-mono text-danger mt-0.5">code: {errorCode}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 space-y-2">
            <p className="text-sm font-semibold text-danger">Error completo:</p>
            <p className="text-sm text-danger font-mono break-words">{error}</p>
          </div>
        )}

        <details className="rounded-xl bg-surface border border-border overflow-hidden" open>
          <summary className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none">
            Diagnóstico ({logs.length} evento{logs.length === 1 ? "" : "s"}) — abrí la consola del browser para más detalle
          </summary>
          <div className="border-t border-border divide-y divide-border">
            {logs.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground font-mono">
                Esperando eventos...
              </p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="px-4 py-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {log.ts}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                      {log.step}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90">{log.detail}</p>
                  {log.data !== undefined && (
                    <pre className="text-[10px] font-mono text-muted-foreground bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </details>

        {error && autoRedirect && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.replace("/auth/error")}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Ir a la pantalla de error
            </button>
            <button
              onClick={() => setAutoRedirect(false)}
              className="w-full h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all"
            >
              Quedarme acá para inspeccionar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
