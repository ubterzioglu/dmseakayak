/**
 * Helpers for building and filling `Localized<T>` (= Record<Locale, T>) values.
 *
 * These exist so adding a language means editing LOCALES in site.ts and nothing
 * else. Before this module the `{ tr, en, fr, ru }` shape was spelled out by
 * hand in a dozen places, and each one silently kept working — while quietly
 * dropping the new language — when a fifth locale was added.
 */
import { DEFAULT_LOCALE, FALLBACK_CHAIN, LOCALES, type Locale } from "@/lib/site";
import type { Localized } from "@/content/tours";

/** A Localized<T> with the same value under every locale. */
export function fillEvery<T>(make: () => T): Localized<T> {
  return Object.fromEntries(LOCALES.map((l) => [l, make()])) as Localized<T>;
}

/** Every locale mapped to "". */
export const emptyLocalizedText = (): Localized<string> => fillEvery(() => "");

/** Every locale mapped to a fresh empty array. */
export const emptyLocalizedList = <T>(): Localized<T[]> => fillEvery<T[]>(() => []);

/** Apply `fn` to each locale's value. */
export function mapLocalized<A, B>(value: Localized<A>, fn: (item: A) => B): Localized<B> {
  return Object.fromEntries(LOCALES.map((l) => [l, fn(value[l])])) as Localized<B>;
}

/**
 * Resolve one locale's value, walking FALLBACK_CHAIN when it is missing.
 * `isEmpty` decides what "missing" means for the value type — an empty string
 * and an empty array both count, so a blank admin field falls back rather than
 * rendering a gap.
 */
export function resolveLocalized<T>(
  value: Partial<Record<Locale, T>> | null | undefined,
  locale: Locale,
  isEmpty: (v: T) => boolean,
): T | undefined {
  for (const candidate of [locale, ...FALLBACK_CHAIN]) {
    const found = value?.[candidate];
    if (found == null || isEmpty(found)) continue;
    return found;
  }
  return undefined;
}

const isBlankText = (v: string) => v.trim() === "";
const isBlankList = (v: readonly unknown[]) => v.length === 0;

/**
 * Fill blank locales from the fallback chain so persisted rows always carry a
 * value for every language. Used on save in the admin tour form: the public
 * site also falls back at render time, but writing the resolved value keeps
 * old rows readable by anything that reads the JSONB directly (sitemap
 * scripts, exports, SQL).
 */
export function fillLocalizedText(value: Partial<Localized<string>>): Localized<string> {
  return Object.fromEntries(
    LOCALES.map((l) => [
      l,
      (resolveLocalized(value, l, isBlankText) ?? "").trim(),
    ]),
  ) as Localized<string>;
}

/** Array counterpart of fillLocalizedText. */
export function fillLocalizedList<T>(value: Partial<Localized<T[]>>): Localized<T[]> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, resolveLocalized(value, l, isBlankList) ?? []]),
  ) as Localized<T[]>;
}

/**
 * Every language the admin panel's "translate from Turkish" buttons fill in —
 * all site languages except the authoring language. Derived from LOCALES, so
 * adding a site language extends the translate buttons automatically instead
 * of leaving a hardcoded list to go stale.
 */
export const TRANSLATION_TARGETS: readonly Locale[] = LOCALES.filter(
  (l) => l !== DEFAULT_LOCALE,
);

/** "EN/FR/RU/DE" — for admin copy that spells the targets out. */
export const TRANSLATION_TARGETS_LABEL = TRANSLATION_TARGETS.map((l) =>
  l.toUpperCase(),
).join("/");
