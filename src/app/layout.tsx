import type { Metadata, Viewport } from "next";
import { Urbanist, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    <html lang="es" className={`${urbanist.variable} ${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <ErrorBoundary>
            <main className="flex-1 flex flex-col">{children}</main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}