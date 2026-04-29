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
    default: "Yadira Running Plan",
    template: "%s | Yadira Running",
  },
  description: "Plan de entrenamiento personalizado para correr 7km - Yadira",
  keywords: ["running", "entrenamiento", "7km", "principiante", "Yadira", "carrera"],
  authors: [{ name: "Yadira Running" }],
  creator: "Yadira Running",
  publisher: "Yadira Running",
  openGraph: {
    title: "Yadira Running Plan",
    description: "Plan de entrenamiento personalizado para 7km",
    type: "website",
    locale: "es_ES",
    url: "https://yadira-running.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yadira Running Plan",
    description: "Plan de entrenamiento para 7km",
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
