import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/iniciar-sesion", "/registro", "/onboarding"],
      },
    ],
    sitemap: "https://runplan-pro.vercel.app/sitemap.xml",
    host: "https://runplan-pro.vercel.app",
  };
}
