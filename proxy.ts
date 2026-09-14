import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, LANG_COOKIE, LANGS, isLang } from "@/lib/i18n/config";

/**
 * Locale routing.
 *
 * Two jobs, and only two:
 *
 * 1. REWRITE — every bare path is served by the `app/[lang]` tree as Romanian
 *    without the URL ever saying so. `/proiecte` renders `/ro/proiecte` while
 *    the address bar keeps `/proiecte`. That is what lets the site gain a
 *    Russian version without moving a single Romanian URL.
 *
 * 2. REDIRECT — a first-time visitor whose browser prefers Russian is sent to
 *    the Russian side once. This only ever fires when the visitor has no
 *    explicit choice on record: the moment they use the language toggle a
 *    cookie is written, and from then on their choice wins over the browser.
 *    Without that rule, a Russian-speaking visitor who deliberately switched
 *    to Romanian would be dragged back to /ru on their next click.
 *
 * Note it never redirects INTO Romanian. Romanian is the default; a visitor
 * already on a bare path is where they should be.
 */

/** Does the Accept-Language header put Russian ahead of everything else? */
function prefersRussian(header: string | null): boolean {
  if (!header) return false;

  /* Parse "ru-RU,ru;q=0.9,en;q=0.8" into tags ordered by descending q. */
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  /* The first tag we recognise decides. A visitor whose top language is
     Romanian (or anything else we do not speak) stays on the default. */
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (base === "ru") return true;
    if (base === "ro" || base === "mo") return false;
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
  const chosen = cookieLang && isLang(cookieLang) ? cookieLang : null;

  /* Already on a prefixed path — nothing to rewrite, the [lang] segment is
     genuinely in the URL and Next resolves it on its own. */
  const prefixed = LANGS.some(
    (lang) => lang !== DEFAULT_LANG && (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)),
  );
  if (prefixed) return NextResponse.next();

  /* Bare path. Send a visitor to Russian only if they have never told us
     otherwise and their browser asks for it. */
  if (!chosen && prefersRussian(request.headers.get("accept-language"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/ru" : `/ru${pathname}`;
    return NextResponse.redirect(url);
  }

  if (chosen && chosen !== DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${chosen}` : `/${chosen}${pathname}`;
    return NextResponse.redirect(url);
  }

  /* Serve the default locale from the [lang] tree, invisibly. */
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  /* Everything except Next internals, the API (locale-agnostic JSON), and any
     path with a file extension — /public assets must not pay for this. */
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
