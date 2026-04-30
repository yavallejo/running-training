import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
