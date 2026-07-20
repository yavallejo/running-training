"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MEDICAL_DISCLAIMER_TEXT } from "@/lib/medical-disclaimer";

type Variant = "footer" | "banner" | "compact";

interface PlanDisclaimerProps {
  variant?: Variant;
  className?: string;
}

// =============================================================================
// PlanDisclaimer
// =============================================================================
// Persistent, visible medical disclaimer. Shown on the plan page, on each
// session card, and in the admin preview.
//
//   footer   - tiny text at the bottom of the plan ("letra pequeña")
//   banner   - amber banner above the plan for risk profiles (age > 60, etc.)
//   compact  - 1-line inline notice for card headers
// =============================================================================
export default function PlanDisclaimer({
  variant = "footer",
  className = ""
}: PlanDisclaimerProps) {
  if (variant === "footer") {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`text-[10px] leading-relaxed text-muted-foreground font-mono ${className}`}
      >
        <ShieldIcon className="w-3 h-3 inline-block mr-1 -translate-y-px opacity-70" />
        {MEDICAL_DISCLAIMER_TEXT.short}{" "}
        <Link
          href="/terminos"
          className="underline hover:text-foreground transition-colors"
        >
          Términos completos
        </Link>
      </motion.p>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground ${className}`}
        title={MEDICAL_DISCLAIMER_TEXT.short}
      >
        <ShieldIcon className="w-3 h-3 opacity-70" />
        Plan algorítmico. No reemplaza consulta médica.
      </span>
    );
  }

  // banner
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
          <ShieldIcon className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-500 mb-1" style={{ fontFamily: "var(--font-urbanist)" }}>
            Tu perfil indica que deberías consultar a un deportólogo antes de seguir este plan
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {MEDICAL_DISCLAIMER_TEXT.short}{" "}
            <Link
              href="/terminos"
              className="text-amber-500 underline hover:text-amber-400 transition-colors"
            >
              Términos completos
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ShieldIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}
