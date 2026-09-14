import type { Metadata } from "next";
import { DEFAULT_LANG, LANGS, localizePath, type Lang } from "./config";

const ORIGIN = "https://mobo.md";

/** Absolute URL of an internal path, in a given language. */
export function canonicalUrl(path: string, lang: Lang): string {
  return `${ORIGIN}${localizePath(path, lang)}`;
}

/**
 * `alternates` for one page.
 *
 * Canonical points at this language's own URL; `languages` declares the pair
 * so Google treats /ru/proiecte as the Russian version of /proiecte rather
 * than as a duplicate competing with it. `x-default` goes to Romanian, which
 * is what a visitor with no preference should land on.
 */
export function alternatesFor(path: string, lang: Lang): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = localizePath(path, l);
  languages["x-default"] = localizePath(path, DEFAULT_LANG);

  return {
    canonical: localizePath(path, lang),
    languages,
  };
}
