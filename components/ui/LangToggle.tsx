"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/ui/LangProvider";
import {
  LANGS,
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  LANG_LABEL,
  LANG_SHORT,
  localizePath,
  parsePath,
  type Lang,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Language toggle.
 *
 * Two real links, not a button that swaps state: the Russian side of the site
 * lives at its own URLs, so switching is a navigation and should be one — it
 * works with middle-click, it is crawlable, and it survives JS failing.
 *
 * The click also writes a cookie. That cookie is what stops `proxy.ts` from
 * dragging a Russian-browser visitor back to /ru every time they deliberately
 * choose Romanian: once they have chosen, their choice outranks the browser's
 * Accept-Language for a year.
 *
 * It lands in two places, per the client: inside the mobile menu (where the
 * nav bar has no room for it) and in the footer on desktop.
 */

export default function LangToggle({
  size = "md",
  className,
}: {
  /** `sm` for the footer row, `md` for the mobile menu. */
  size?: "sm" | "md";
  className?: string;
}) {
  const { lang: current } = useI18n();
  const pathname = usePathname();

  /* usePathname() reports the VISIBLE path, which is exactly what we need:
     the Romanian rewrite is invisible here, so "/proiecte" parses as Romanian
     and "/ru/proiecte" as Russian, and the bare path is shared by both. */
  const { path } = parsePath(pathname ?? "/");

  const choose = (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${LANG_COOKIE_MAX_AGE};samesite=lax`;
  };

  return (
    <div
      className={cn(
        "glass glass-thin inline-flex items-center rounded-pill p-0.5",
        size === "sm" ? "gap-0.5" : "gap-1",
        className,
      )}
      role="group"
      aria-label={LANG_LABEL[current]}
    >
      {LANGS.map((lang) => {
        const active = lang === current;
        return (
          <Link
            key={lang}
            href={localizePath(path, lang)}
            hrefLang={lang}
            lang={lang}
            aria-current={active ? "true" : undefined}
            aria-label={LANG_LABEL[lang]}
            onClick={() => choose(lang)}
            className={cn(
              "rounded-pill font-medium tracking-tight transition-colors duration-200 ease-out-strong",
              size === "sm" ? "px-2.5 py-1 text-[0.6875rem]" : "px-3.5 py-1.5 text-[0.8125rem]",
              active
                ? "bg-lime-brand text-lime-ink"
                : "text-fg-dim hover-fine:hover:text-fg",
            )}
          >
            {LANG_SHORT[lang]}
          </Link>
        );
      })}
    </div>
  );
}
