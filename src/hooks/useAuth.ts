"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "yadira_user";

interface User {
  name: string;
  loggedInAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (name: string) => {
    const userData: User = { name, loggedInAt: new Date().toISOString() };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    router.push("/plan");
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push("/login");
  };

  return { user, loading, mounted, login, logout };
}
