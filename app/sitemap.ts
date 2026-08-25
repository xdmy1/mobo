import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/data";

const BASE = "https://mobo.md";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/proiecte",
    "/servicii",
    "/despre-noi",
    "/contacte",
    "/info-clienti",
    "/termeni-si-conditii",
    "/politica-de-confidentialitate",
    "/gdpr",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const projectRoutes = PROJECTS.map((project) => ({
    url: `${BASE}${project.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
