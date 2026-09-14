/**
 * Locales.
 *
 * Romanian is the default and lives at the BARE paths (/proiecte, /servicii…)
 * because the site launched on them and they are what search engines and the
 * client's printed material already point at. Russian lives under /ru/*.
 * `proxy.ts` rewrites bare paths onto the [lang] tree so this split costs the
 * Romanian URLs nothing.
 */

export const LANGS = ["ro", "ru"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ro";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Cookie holding an explicit choice; set by the toggle, read by the proxy. */
export const LANG_COOKIE = "mobo-lang";

/** One year — the choice is a preference, not a session detail. */
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** What `<html lang>` and og:locale should say. */
export const HTML_LANG: Record<Lang, string> = {
  ro: "ro",
  ru: "ru",
};

export const OG_LOCALE: Record<Lang, string> = {
  ro: "ro_MD",
  ru: "ru_MD",
};

/** Label for the language toggle — each written in its own language. */
export const LANG_LABEL: Record<Lang, string> = {
  ro: "Română",
  ru: "Русский",
};

/** Short form for the compact toggle. */
export const LANG_SHORT: Record<Lang, string> = {
  ro: "RO",
  ru: "RU",
};

/**
 * Turn an internal (unprefixed) path into the public path for a locale.
 * `/proiecte` → `/proiecte` (ro) or `/ru/proiecte` (ru); `/` → `/` or `/ru`.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? "/ru" : `/ru${clean}`;
}

/**
 * The inverse: strip a locale prefix off a public path, returning the locale
 * and the unprefixed path. `/ru/proiecte` → { lang: "ru", path: "/proiecte" }.
 */
export function parsePath(pathname: string): { lang: Lang; path: string } {
  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    if (pathname === `/${lang}`) return { lang, path: "/" };
    if (pathname.startsWith(`/${lang}/`)) {
      return { lang, path: pathname.slice(lang.length + 1) };
    }
  }
  return { lang: DEFAULT_LANG, path: pathname };
}
