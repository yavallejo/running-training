import type { Metadata, Viewport } from "next";
import { Urbanist, Open_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalHeader from "@/components/ConditionalHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "RunPlan Pro — Tu plan de entrenamiento para correr",
    template: "%s | RunPlan Pro",
  },
  description: "Plan de entrenamiento personalizado para tu primera carrera. De 3K a 42K, con progresión adaptada a tu nivel, ritmo y objetivos. Sin excusas, solo seguí el plan.",
  keywords: [
    "plan de entrenamiento running",
    "correr por primera vez",
    "entrenamiento 5K",
    "entrenamiento 10K",
    "medio maratón",
    "maratón",
    "running principiante",
    "plan de carrera personalizado",
    "entrenamiento progresivo",
    "correr sin lesionarse",
    "RunPlan Pro",
    "app running",
    "carrera recreativa",
  ],
  authors: [{ name: "RunPlan Pro" }],
  creator: "RunPlan Pro",
  publisher: "RunPlan Pro",
  openGraph: {
    title: "RunPlan Pro — Tu plan de entrenamiento para correr",
    description: "De 3K a 42K. Plan progresivo adaptado a tu nivel. Cada día te dice exactamente qué hacer. Arrancá hoy.",
    type: "website",
    locale: "es_AR",
    url: "https://runplan-pro.vercel.app",
    siteName: "RunPlan Pro",
    alternateLocale: ["es_ES", "es_MX", "es_CO"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RunPlan Pro — Tu plan de entrenamiento para correr",
    description: "De 3K a 42K. Plan progresivo adaptado a tu nivel. Cada día te dice exactamente qué hacer.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
  },
  category: "sports",
  icons: {
    icon: "/icon.svg",
  },
};

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("h-full", "antialiased", urbanist.variable, openSans.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <ErrorBoundary>
            <ConditionalHeader />
            <main className="flex-1 flex flex-col">{children}</main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}