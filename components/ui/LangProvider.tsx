"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/config";
import { makeTranslate, type Dict, type Translate } from "@/lib/i18n/dictionary";

/**
 * The locale, as client components see it.
 *
 * The dictionary is resolved on the server and handed down as a prop, so only
 * the active language crosses the wire — importing both here would ship the
 * Russian copy to every Romanian visitor and vice versa.
 *
 * `href()` is the other half of the job: every internal link has to keep the
 * reader on their side of the site. Writing `/proiecte` in a component is
 * correct for Romanian and wrong for Russian, so components write the bare
 * path and this turns it into `/ru/proiecte` when it needs to be.
 */

type LangContextValue = {
  lang: Lang;
  t: Translate;
  /** Prefix an internal path for the current locale. */
  href: (path: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export default function LangProvider({
  lang,
  dict,
  children,
}: {
  lang: Lang;
  dict: Dict;
  children: ReactNode;
}) {
  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      t: makeTranslate(dict),
      href: (path: string) => localizePath(path, lang),
    }),
    [lang, dict],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useI18n() used outside LangProvider — wrap the tree in app/[lang]/layout.tsx");
  }
  return ctx;
}
