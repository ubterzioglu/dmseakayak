import { describe, expect, it } from "vitest";
import {
  DEEPL_SOURCE,
  DEEPL_TARGET,
  DO_NOT_TRANSLATE,
  groupByLangPair,
  isLang,
  LANGS,
  protectTerms,
  restoreTerms,
  validateItem,
  type TranslateItem,
} from "./translate-terms";

describe("language set", () => {
  it("includes German", () => {
    expect(LANGS).toContain("de");
    expect(isLang("de")).toBe(true);
  });

  it("rejects languages the site does not serve", () => {
    expect(isLang("es")).toBe(false);
    expect(isLang("")).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it("maps every language to a DeepL code", () => {
    for (const lang of LANGS) {
      expect(DEEPL_SOURCE[lang]).toBeTruthy();
      expect(DEEPL_TARGET[lang]).toBeTruthy();
    }
    // DeepL rejects a bare "EN" as a target but accepts it as a source.
    expect(DEEPL_TARGET.en).toBe("EN-GB");
    expect(DEEPL_SOURCE.en).toBe("EN");
  });
});

describe("brand term protection", () => {
  it("round-trips every protected term", () => {
    for (const term of DO_NOT_TRANSLATE) {
      const text = `Book your ${term} experience`;
      expect(protectTerms(text)).not.toContain(term);
      expect(restoreTerms(protectTerms(text))).toBe(text);
    }
  });

  it("claims the longest term first so compound names survive intact", () => {
    // "Dragoman" alone must not split "Dragoman SeaKayak" into two sentinels.
    const text = "The Dragoman SeaKayak story, part of Dragoman Turkey.";
    expect(restoreTerms(protectTerms(text))).toBe(text);
    expect(protectTerms(text)).toBe("The XKEEP0X story, part of XKEEP1X.");
  });

  it("survives a translated sentence rebuilt around the sentinel", () => {
    // What DeepL actually returns: it forms a German compound on the sentinel.
    const translated = "Das XKEEP0X-Erlebnis aus der Sicht unserer Gäste.";
    expect(restoreTerms(translated)).toBe(
      "Das Dragoman SeaKayak-Erlebnis aus der Sicht unserer Gäste.",
    );
  });

  it("leaves text without protected terms untouched", () => {
    const text = "Paddle over the sunken city at Kekova.";
    expect(protectTerms(text)).toBe(text);
  });
});

describe("validateItem", () => {
  it("accepts a well-formed item", () => {
    expect(validateItem({ text: "Merhaba", from: "tr", to: "de" })).toEqual({
      text: "Merhaba",
      from: "tr",
      to: "de",
    });
  });

  it("rejects blank text, unknown languages and same-language pairs", () => {
    expect(validateItem({ text: "   ", from: "tr", to: "de" })).toBeNull();
    expect(validateItem({ text: "Merhaba", from: "tr", to: "es" })).toBeNull();
    expect(validateItem({ text: "Merhaba", from: "tr", to: "tr" })).toBeNull();
    expect(validateItem({})).toBeNull();
  });

  it("survives non-object entries in the items array", () => {
    // A JSON body can carry nulls or primitives; these must not throw.
    expect(validateItem(null)).toBeNull();
    expect(validateItem(undefined)).toBeNull();
    expect(validateItem("Merhaba")).toBeNull();
    expect(validateItem(42)).toBeNull();
  });
});

describe("groupByLangPair", () => {
  const item = (text: string, from: string, to: string) =>
    ({ text, from, to }) as TranslateItem;

  it("collapses one source into one group per target language", () => {
    const items = [
      item("a", "tr", "en"),
      item("a", "tr", "fr"),
      item("a", "tr", "de"),
      item("b", "tr", "en"),
    ];
    const groups = groupByLangPair(items);
    expect(groups).toHaveLength(3);
    expect(groups.find((g) => g.to === "en")?.indices).toEqual([0, 3]);
    expect(groups.find((g) => g.to === "de")?.indices).toEqual([2]);
  });

  it("skips nulls without shifting the indices of later items", () => {
    // This is the alignment guarantee translate-text's positional response
    // depends on: index 2 must still report as 2, not 1.
    const items = [item("a", "tr", "de"), null, item("c", "tr", "de")];
    expect(groupByLangPair(items)[0].indices).toEqual([0, 2]);
  });

  it("returns nothing when every item is invalid", () => {
    expect(groupByLangPair([null, null])).toEqual([]);
  });

  it("preserves request order within a group", () => {
    const items = [item("a", "tr", "de"), item("b", "tr", "de"), item("c", "tr", "de")];
    expect(groupByLangPair(items)[0].indices).toEqual([0, 1, 2]);
  });
});
