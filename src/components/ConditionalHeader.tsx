"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const PUBLIC_PATHS = ["/", "/login", "/register", "/onboarding", "/terminos", "/admin"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) return null;
  return <Header />;
}
