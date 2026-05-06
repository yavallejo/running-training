import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://runplan-pro.vercel.app";

  const routes = [
    { path: "", priority: 1.0, changefreq: "daily" as const },
    { path: "/funcionalidades", priority: 0.9, changefreq: "monthly" as const },
    { path: "/plan", priority: 0.8, changefreq: "daily" as const },
    { path: "/estadisticas", priority: 0.7, changefreq: "daily" as const },
    { path: "/guia-principiante", priority: 0.8, changefreq: "monthly" as const },
    { path: "/calentamiento", priority: 0.8, changefreq: "monthly" as const },
    { path: "/tecnica", priority: 0.8, changefreq: "monthly" as const },
    { path: "/nutricion", priority: 0.8, changefreq: "monthly" as const },
    { path: "/dia-carrera", priority: 0.8, changefreq: "monthly" as const },
    { path: "/faq", priority: 0.8, changefreq: "monthly" as const },
    { path: "/playlist", priority: 0.7, changefreq: "monthly" as const },
    { path: "/clima", priority: 0.7, changefreq: "monthly" as const },
    { path: "/terminos", priority: 0.3, changefreq: "yearly" as const },
    { path: "/profile", priority: 0.6, changefreq: "weekly" as const },
    { path: "/login", priority: 0.3, changefreq: "monthly" as const },
    { path: "/register", priority: 0.3, changefreq: "monthly" as const },
    { path: "/onboarding", priority: 0.4, changefreq: "monthly" as const },
    { path: "/admin", priority: 0.2, changefreq: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
