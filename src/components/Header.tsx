"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("yadira_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name || "");
      } catch {
        // ignore
      }
    }
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("yadira_user");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/plan" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-primary"
          >
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            <path d="M12 2c-4.42 0-8 3.58-8 8 0 2.76 1.5 5.21 3.75 6.5L12 22l4.25-5.5C18.5 15.21 20 12.76 20 10c0-4.42-3.58-8-8-8zm0 2c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z" fill="currentColor" className="text-secondary"/>
          </svg>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Yadira
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/plan"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Plan
          </Link>
          <Link
            href="/estadisticas"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Estadísticas
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 hover:bg-foreground/10 transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          {userName && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Salir
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
