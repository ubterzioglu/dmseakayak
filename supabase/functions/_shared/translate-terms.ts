// Pure, provider-agnostic pieces of the translation pipeline: the language set,
// the brand-term protection, the DeepL code mapping, and the batching maths.
//
// Kept free of Deno APIs so the vitest suite can exercise it directly — the
// same split send-reservation-alert uses (pure email.ts, Deno-only index.ts).
// Index alignment is the thing worth testing here: translate-text answers with
// a positional array, so a slip silently files the German text under French.

export type Lang = "tr" | "en" | "fr" | "ru" | "de";

export const LANGS: Lang[] = ["tr", "en", "fr", "ru", "de"];

export const isLang = (v: unknown): v is Lang =>
  typeof v === "string" && (LANGS as string[]).includes(v);

/** DeepL rejects a bare "EN" as a *target*; source codes are the plain ones. */
export const DEEPL_TARGET: Record<Lang, string> = {
  tr: "TR",
  en: "EN-GB",
  fr: "FR",
  ru: "RU",
  de: "DE",
};

export const DEEPL_SOURCE: Record<Lang, string> = {
  tr: "TR",
  en: "EN",
  fr: "FR",
  ru: "RU",
  de: "DE",
};

/**
 * Brand and product names DeepL would otherwise translate ("SeaKayak" comes
 * back as "Seekajak"). Swapped for opaque sentinels rather than DeepL's own
 * ignore_tags, which treats the span as a foreign body and wraps the result in
 * German quotation marks — „Dragoman SeaKayak“ instead of the plain name.
 *
 * Order matters: longer terms first, so "Dragoman SeaKayak" is claimed before
 * the bare "Dragoman" can split it in half.
 */
export const DO_NOT_TRANSLATE = [
  "Dragoman SeaKayak",
  "Dragoman Turkey",
  "Dragoman",
  "TRAK",
  "SeaKayak",
  "TÜRSAB",
];

const sentinel = (i: number) => `XKEEP${i}X`;

export const protectTerms = (text: string): string =>
  DO_NOT_TRANSLATE.reduce((s, term, i) => s.split(term).join(sentinel(i)), text);

export const restoreTerms = (text: string): string =>
  DO_NOT_TRANSLATE.reduce((s, term, i) => s.split(sentinel(i)).join(term), text);

export interface TranslateItem {
  text: string;
  from: Lang;
  to: Lang;
}

/**
 * Validate a raw request item. Returns null for anything unusable so the caller
 * can keep its slot in the positional response instead of shifting later items.
 */
export function validateItem(raw: unknown): TranslateItem | null {
  // A JSON body may legitimately contain `null` or a primitive in the items
  // array; reading .text off it would throw and take the whole request down.
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Partial<TranslateItem>;
  const ok =
    typeof item.text === "string" &&
    item.text.trim() !== "" &&
    isLang(item.from) &&
    isLang(item.to) &&
    item.from !== item.to;
  return ok ? { text: item.text as string, from: item.from!, to: item.to! } : null;
}

export interface LangPairGroup {
  from: Lang;
  to: Lang;
  /** Positions in the original request array, in order. */
  indices: number[];
}

/**
 * Group items by language pair so each pair becomes one batched provider call.
 * Without this, a tour field going to four target languages costs one request
 * per string instead of one per language.
 */
export function groupByLangPair(items: (TranslateItem | null)[]): LangPairGroup[] {
  const groups = new Map<string, LangPairGroup>();
  items.forEach((item, index) => {
    if (!item) return;
    const key = `${item.from}|${item.to}`;
    const existing = groups.get(key);
    if (existing) existing.indices.push(index);
    else groups.set(key, { from: item.from, to: item.to, indices: [index] });
  });
  return [...groups.values()];
}
