import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/data";
import { LANGS, localizePath } from "@/lib/i18n/config";

const BASE = "https://mobo.md";

/**
 * Both languages, with `alternates.languages` on every entry.
 *
 * The Russian side lives at real URLs (/ru/*), so it belongs in the sitemap;
 * declaring the pair here as well as in each page's `alternates` is what tells
 * Google the two are translations of one page rather than two pages competing
 * for the same query.
 *
 * The legal pages are deliberately absent — they carry `robots: { index: false }`,
 * and listing a noindex URL in a sitemap is a contradiction Search Console
 * reports as an error.
 */
const ROUTES = [
  "/",
  "/bucatarii",
  "/proiecte",
  "/servicii",
  "/calculator",
  "/despre-noi",
  "/contacte",
  "/info-clienti",
] as const;

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) languages[lang] = `${BASE}${localizePath(path, lang)}`;

  return {
    url: `${BASE}${localizePath(path, "ro")}`,
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((path) => entry(path, path === "/" ? 1 : 0.7)),
    ...PROJECTS.map((project) => entry(project.href, 0.6)),
  ];
}
