import type { Lang } from "./config";
import { contentRo, type ContentDict } from "./dictionaries/content.ro";
import { contentRu } from "./dictionaries/content.ru";
import { uiRo, type UiDict } from "./dictionaries/ui.ro";
import { uiRu } from "./dictionaries/ui.ru";
import { sectRo, type SectDict } from "./dictionaries/sections.ro";
import { sectRu } from "./dictionaries/sections.ru";
import { chromeRo, type ChromeDict } from "./dictionaries/chrome.ro";
import { chromeRu } from "./dictionaries/chrome.ru";
import { calcRo, type CalcDict } from "./dictionaries/calculator.ro";
import { calcRu } from "./dictionaries/calculator.ru";

/**
 * The dictionary.
 *
 * Split across five pairs of files purely so they stay editable — and so the
 * pairs can be worked on independently: `content` is the editorial copy that
 * used to live in lib/data.ts, `ui` is page headers and metadata, `sections`
 * is the homepage sections, `chrome` is nav/forms/cookies/gallery, and
 * `calculator` is the configurator. They merge into one flat map of dotted
 * keys.
 *
 * Flat keys, not a nested object, for one reason: `TranslationKey` is then a
 * plain union of string literals, so `t("hero.titel")` is a compile error and
 * a key missing from Russian is a compile error too. With 470-odd strings and
 * two languages that guarantee is worth more than prettier call sites.
 */

const DICTS = {
  ro: { ...contentRo, ...uiRo, ...sectRo, ...chromeRo, ...calcRo },
  ru: { ...contentRu, ...uiRu, ...sectRu, ...chromeRu, ...calcRu },
} as const;

export type Dict = ContentDict & UiDict & SectDict & ChromeDict & CalcDict;

export type TranslationKey = keyof Dict;

export function getDictionary(lang: Lang): Dict {
  return DICTS[lang];
}

/**
 * Interpolate `{name}` placeholders.
 *
 * Deliberately tiny: the site needs "{count} foto" and "Sună la {phone}", not
 * a template language. A placeholder with no matching value is left visible
 * rather than silently blanked — a stray `{count}` on screen gets reported and
 * fixed, an empty gap does not.
 */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** The translator handed to components. */
export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function makeTranslate(dict: Dict): Translate {
  return (key, vars) => interpolate(dict[key], vars);
}
