"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { getSession, clearSession } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const RESOURCES_LINKS = [
  { href: "/guia-principiante", label: "Guía del Principiante", icon: "📚" },
  { href: "/calentamiento", label: "Calentamiento", icon: "🧘" },
  { href: "/tecnica", label: "Técnica de Corrida", icon: "🏃" },
  { href: "/nutricion", label: "Nutrición", icon: "🥗" },
  { href: "/dia-carrera", label: "Día de la Carrera", icon: "🏁" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/playlist", label: "Playlist", icon: "🎵" },
  { href: "/clima", label: "Clima", icon: "🌤️" },
  { href: "/funcionalidades", label: "Funcionalidades", icon: "⚙️" },
];

const MAIN_LINKS = [
  { href: "/plan", label: "Mi Plan", icon: "🏋️" },
  { href: "/estadisticas", label: "Estadísticas", icon: "📊" },
];

export default function Header() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem("running_session");
    if (session) {
      try {
        const { name } = JSON.parse(session);
        setUserName(name || "");
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    setMobileMenuOpen(false);
    clearSession();
    router.push("/");
  }, [router]);

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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between h-14 px-4">
            <Link href="/plan" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
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
                className="text-base font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                RunPlan<span className="text-primary"> Pro</span>
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1">
              {MAIN_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>
                  {link.label}
                </NavLink>
              ))}

              <div className="relative">
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-1 h-10 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                >
                  Recursos
                  <motion.svg
                    animate={{ rotate: resourcesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {resourcesOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setResourcesOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-elevated border border-border shadow-xl z-50 overflow-hidden"
                      >
                        <div className="py-2">
                          {RESOURCES_LINKS.map((link) => (
                            <DropdownLink key={link.href} href={link.href} onClick={() => setResourcesOpen(false)} icon={link.icon}>
                              {link.label}
                            </DropdownLink>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                aria-label="Cambiar tema"
              >
                {resolvedTheme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              <Link
                href="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                aria-label="Mi Perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                aria-label="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </nav>

            {/* Mobile Menu Button - Only visible on mobile */}
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

      {/* Mobile Drawer */}
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
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>
                      RunPlan Pro
                    </p>
                    {userName && (
                      <p className="text-xs text-muted-foreground">Hola, {userName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {MAIN_LINKS.map((link) => (
                    <MobileNavLink
                      key={link.href}
                      href={link.href}
                      icon={link.icon}
                      label={link.label}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setResourcesOpen(!resourcesOpen)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-elevated transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📖</span>
                      <span className="text-sm font-semibold text-foreground">Recursos</span>
                    </div>
                    <motion.svg
                      animate={{ rotate: resourcesOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {resourcesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 pl-4 space-y-1">
                          {RESOURCES_LINKS.map((link) => (
                            <MobileNavLink
                              key={link.href}
                              href={link.href}
                              icon={link.icon}
                              label={link.label}
                              onClick={() => setMobileMenuOpen(false)}
                              nested
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              <div className="p-4 border-t border-border space-y-2">
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface hover:bg-surface-elevated transition-colors"
                >
                  <span className="text-xl">
                    {resolvedTheme === "dark" ? "☀️" : "🌙"}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
                  </span>
                </button>

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface hover:bg-surface-elevated transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium text-foreground">Mi Perfil</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-danger/10 hover:bg-danger/20 transition-colors"
                >
                  <span className="text-xl">🚪</span>
                  <span className="text-sm font-medium text-danger">Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function DropdownLink({ href, children, onClick, icon }: { href: string; children: React.ReactNode; onClick: () => void; icon: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
  nested = false,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
        nested
          ? "hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          : "bg-surface hover:bg-surface-elevated"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className={`font-medium ${nested ? "text-sm" : "text-sm font-semibold text-foreground"}`}>
        {label}
      </span>
    </Link>
  );
}