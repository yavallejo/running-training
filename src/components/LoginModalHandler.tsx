"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/components/LoginModal"), {
  ssr: false,
  loading: () => null,
});

export default function LoginModalHandler() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener("open-login-modal", handleOpenLogin);
    return () => window.removeEventListener("open-login-modal", handleOpenLogin);
  }, []);

  return <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} showRegisterHint />;
}