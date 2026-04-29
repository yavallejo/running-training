"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/hooks/useTheme";
import { clearSession } from "@/lib/auth";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem("yadira_session");
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
    clearSession();
    window.location.href = "/login";
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-4">
        <Link href="/plan" className="flex items-center gap-2 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-primary transition-transform group-hover:scale-110"
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
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Yadira
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink href="/plan">Plan</NavLink>
          <NavLink href="/estadisticas">Estadísticas</NavLink>
          <NavLink href="/funcionalidades">Funcionalidades</NavLink>
          
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-lg p-1.5 hover:bg-foreground/5 transition-colors"
            aria-label="Cambiar tema"
          >
            {resolvedTheme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}
