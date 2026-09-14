import type { Lang } from "./config";
import type { TranslationKey } from "./dictionary";

/**
 * Counted nouns.
 *
 * Romanian and Russian disagree about this in ways a ternary cannot express.
 * Romanian inserts "de" above 19 — 12 cadre, but 30 DE cadre. Russian picks
 * between three endings on the last digit — 1 кадр, 3 кадра, 5 кадров, and
 * then 21 кадр again. The old code hard-coded the Romanian rule inline; that
 * is exactly the sort of thing that silently produces nonsense in the second
 * language.
 *
 * `Intl.PluralRules` already knows both, so the dictionary just carries one
 * key per CLDR category and this picks the right one. Romanian's "other"
 * category is precisely the "de" case, which is a pleasant coincidence rather
 * than something we had to encode.
 */

const LOCALE: Record<Lang, string> = { ro: "ro-RO", ru: "ru-RU" };

/* Intl.PluralRules objects are not free to build; there are only two. */
const cache = new Map<Lang, Intl.PluralRules>();

function rules(lang: Lang): Intl.PluralRules {
  let pr = cache.get(lang);
  if (!pr) {
    pr = new Intl.PluralRules(LOCALE[lang]);
    cache.set(lang, pr);
  }
  return pr;
}

/**
 * Build the dictionary key for `count` in `lang`, given a key prefix whose
 * dictionary entries are `<prefix>.one`, `.few`, `.many`, `.other`.
 *
 * Every prefix must define all four categories even where a language never
 * selects one — the type system enforces that, and it keeps the table honest
 * if a third language ever arrives.
 */
export function pluralKey(prefix: string, count: number, lang: Lang): TranslationKey {
  return `${prefix}.${rules(lang).select(count)}` as TranslationKey;
}
