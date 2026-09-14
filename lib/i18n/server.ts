import { lang as langParam } from "next/root-params";
import { DEFAULT_LANG, isLang, localizePath, type Lang } from "./config";
import { getDictionary, makeTranslate, type Translate } from "./dictionary";

/**
 * The locale, as Server Components see it.
 *
 * Client components read the same thing out of LangProvider's context;
 * server components cannot, so they read the `[lang]` root param directly.
 * Every route lives under `app/[lang]`, which is what makes `langParam()`
 * available this deep without threading a prop through every layer.
 *
 * Falls back to Romanian rather than throwing: a missing param means the
 * proxy rewrite did not run, and serving the default language is a better
 * failure than a 500.
 */
export async function getI18n(): Promise<{
  lang: Lang;
  t: Translate;
  href: (path: string) => string;
}> {
  const raw = await langParam();
  const lang = raw && isLang(raw) ? raw : DEFAULT_LANG;
  return {
    lang,
    t: makeTranslate(getDictionary(lang)),
    href: (path: string) => localizePath(path, lang),
  };
}
