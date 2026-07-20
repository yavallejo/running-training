"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEDICAL_DISCLAIMER_TEXT,
  MEDICAL_DISCLAIMER_VERSION,
  getStoredConsent,
  setStoredConsent
} from "@/lib/medical-disclaimer";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface MedicalConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel?: () => void;
}

// =============================================================================
// MedicalConsentModal
// =============================================================================
// Full-screen modal shown the first time (or after a disclaimer version bump)
// a user views their plan. Requires ticking a checkbox to continue.
//
// On accept:
//   1. Records timestamp + version in user_profiles.medical_consent_* (audit).
//      This is the source of truth for legal compliance and runs FIRST.
//   2. Persists consent in localStorage (instant gate on subsequent loads).
//      Only happens after the audit succeeds — otherwise a failed network
//      would leave the user with localStorage but no audit trail, which
//      would be a compliance gap.
// =============================================================================
export default function MedicalConsentModal({
  open,
  onAccept,
  onCancel
}: MedicalConsentModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAccepted(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleAccept = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Audit FIRST: try to write the consent to the server. If this fails,
      // we abort and ask the user to retry, so we never end up with a
      // localStorage flag and no server-side audit record.
      const session = getSession();
      if (session?.userId) {
        const { error: dbError } = await supabase
          .from("user_profiles")
          .update({
            medical_consent_accepted_at: new Date().toISOString(),
            medical_consent_version: MEDICAL_DISCLAIMER_VERSION
          })
          .eq("id", session.userId);

        if (dbError) {
          setError("No pudimos registrar tu aceptación. Por favor reintentá en unos segundos.");
          setSubmitting(false);
          return;
        }
      }

      // Audit succeeded (or there was no user to audit). Now persist the
      // instant gate for future sessions.
      setStoredConsent();
      onAccept();
    } catch (err) {
      console.error("Failed to record medical consent", err);
      setError("Ocurrió un error inesperado. Por favor reintentá.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="medical-consent-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-border/50 rounded-2xl shadow-2xl"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2
                    id="medical-consent-title"
                    className="text-xl font-black tracking-tight"
                    style={{ fontFamily: "var(--font-urbanist)" }}
                  >
                    ANTES DE COMENZAR
                  </h2>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mt-1">
                    Aviso médico obligatorio
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-background/50 border border-border/30 p-4 mb-6 max-h-[40vh] overflow-y-auto">
                <pre className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
                  {MEDICAL_DISCLAIMER_TEXT.full}
                </pre>
              </div>

              {error && (
                <div role="alert" className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
                  {error}
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <div className="relative shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Acepto el aviso médico"
                  />
                  <div className="w-5 h-5 rounded border-2 border-border/60 group-hover:border-primary/50 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    {accepted && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs leading-relaxed text-foreground">
                  Confirmo que he leído el aviso médico y, si corresponde, he consultado
                  a un deportólogo. Acepto los{" "}
                  <a
                    href="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                  .
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
                    disabled={submitting}
                  >
                    CANCELAR
                  </button>
                )}
                <button
                  onClick={handleAccept}
                  disabled={!accepted || submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "GUARDANDO..." : "ENTENDIDO, CONTINUAR"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook helper: returns true if the user must accept the disclaimer before
// viewing the plan. Safe to call from any client component. Returns
// `null` during the first render (SSR-unsafe) and `true`/`false` after
// hydration so the caller can avoid a flash of content.
export function useRequiresMedicalConsent(): boolean | null {
  const [required, setRequired] = useState<boolean | null>(null);

  useEffect(() => {
    setRequired(getStoredConsent() === null);
  }, []);

  return required;
}
