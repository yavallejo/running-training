import type { Metadata, Viewport } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RunPlan Pro",
    template: "%s | RunPlan Pro",
  },
  description: "Plan de entrenamiento personalizado para correr 7km o 11km - RunPlan Pro",
  keywords: ["running", "entrenamiento", "7km", "11km", "principiante", "intermediate", "pro", "runplan", "carrera", "profesional"],
  authors: [{ name: "RunPlan Pro" }],
  creator: "RunPlan Pro",
  publisher: "RunPlan Pro",
  openGraph: {
    title: "RunPlan Pro",
    description: "Plan de entrenamiento personalizado para 7km o 11km",
    type: "website",
    locale: "es_ES",
    url: "https://runplan-pro.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunPlan Pro",
    description: "Plan de entrenamiento para 7km o 11km",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <ErrorBoundary>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}