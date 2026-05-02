"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "./LoginModal";

const NAV_LINKS = [
  { href: "#problema", label: "El Problema" },
  { href: "#solucion", label: "Solución" },
  { href: "#pasos", label: "Cómo Funciona" },
];

export default function PublicHeader() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM12 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM15.75 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Z"
                  />
                </svg>
              </div>
              <span
                className="text-lg font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                RunPlan<span className="text-primary"> Pro</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/register"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Registrarse
              </Link>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                Iniciar Sesión
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-foreground hover:bg-surface-elevated transition-colors"
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.362 5.214A8.249 8.249 0 0 1 12 21 8.249 8.249 0 0 1 5.75 5.214 8.25 8.25 0 0 1 15.362 5.214Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM12 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5ZM15.75 12.75a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "var(--font-urbanist)" }}
                  >
                    RunPlan Pro
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-foreground hover:bg-surface-elevated transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-surface hover:bg-surface-elevated transition-colors text-foreground"
                    >
                      <span className="text-sm font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-border space-y-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all font-semibold"
                >
                  Registrarse
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogin(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold"
                >
                  Iniciar Sesión
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} showRegisterHint />
    </>
  );
}