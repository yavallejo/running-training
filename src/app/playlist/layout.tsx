import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist para Correr por BPM",
  description:
    "Listas de reproducción organizadas por BPM para acompañar tu ritmo de carrera. Música para calentamiento, fondo y series rápidas.",
  alternates: { canonical: "/playlist" },
  openGraph: {
    title: "Playlist para Correr por BPM — RunPlan Pro",
    description:
      "Listas de reproducción organizadas por BPM para acompañar tu ritmo de carrera.",
    type: "website",
  },
};

export default function PlaylistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
