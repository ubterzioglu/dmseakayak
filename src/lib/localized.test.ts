import { describe, expect, it } from "vitest";
import {
  TRANSLATION_TARGETS,
  TRANSLATION_TARGETS_LABEL,
  emptyLocalizedList,
  emptyLocalizedText,
  fillLocalizedList,
  fillLocalizedText,
  mapLocalized,
  resolveLocalized,
} from "./localized";
import { LOCALES } from "./site";

const isBlankText = (v: string) => v.trim() === "";
const isBlankList = (v: unknown[]) => v.length === 0;

describe("resolveLocalized", () => {
  it("prefers the requested locale", () => {
    const value = { tr: "Merhaba", en: "Hello", de: "Hallo" };
    expect(resolveLocalized(value, "de", isBlankText)).toBe("Hallo");
  });

  it("falls back to English before Turkish when the locale key is absent", () => {
    // Rows written before German existed carry no "de" key at all — the exact
    // shape every tour currently in the database has.
    const value = { tr: "Merhaba", en: "Hello", fr: "Bonjour", ru: "Привет" };
    expect(resolveLocalized(value, "de", isBlankText)).toBe("Hello");
  });

  it("falls back to Turkish when English is missing too", () => {
    expect(resolveLocalized({ tr: "Merhaba" }, "de", isBlankText)).toBe("Merhaba");
  });

  it("treats a blank string as missing", () => {
    const value = { tr: "Merhaba", en: "Hello", de: "   " };
    expect(resolveLocalized(value, "de", isBlankText)).toBe("Hello");
  });

  it("treats an empty array as missing", () => {
    const value = { tr: ["a"], en: ["b"], de: [] as string[] };
    expect(resolveLocalized(value, "de", isBlankList)).toEqual(["b"]);
  });

  it("returns undefined when every locale is empty", () => {
    expect(resolveLocalized({ tr: "", en: "" }, "de", isBlankText)).toBeUndefined();
    expect(resolveLocalized(null, "de", isBlankText)).toBeUndefined();
    expect(resolveLocalized(undefined, "de", isBlankText)).toBeUndefined();
  });
});

describe("locale-shaped builders", () => {
  it("covers every configured locale", () => {
    expect(Object.keys(emptyLocalizedText()).sort()).toEqual([...LOCALES].sort());
    expect(Object.keys(emptyLocalizedList<string>()).sort()).toEqual([...LOCALES].sort());
  });

  it("gives each locale its own array instance", () => {
    const lists = emptyLocalizedList<string>();
    lists.tr.push("only-tr");
    expect(lists.en).toEqual([]);
  });

  it("maps every locale", () => {
    const upper = mapLocalized(emptyLocalizedText(), (v) => `${v}x`);
    expect(Object.values(upper)).toEqual(LOCALES.map(() => "x"));
  });
});

describe("fillLocalizedText / fillLocalizedList", () => {
  it("fills blank languages through the fallback chain", () => {
    const filled = fillLocalizedText({ tr: "Merhaba", en: "Hello" });
    expect(filled.de).toBe("Hello");
    expect(filled.fr).toBe("Hello");
    expect(filled.tr).toBe("Merhaba");
  });

  it("falls back to Turkish when English is blank", () => {
    const filled = fillLocalizedText({ tr: "Merhaba", en: "  " });
    expect(filled.en).toBe("Merhaba");
    expect(filled.de).toBe("Merhaba");
  });

  it("never leaves a locale undefined, even from an empty input", () => {
    const filled = fillLocalizedText({});
    expect(Object.keys(filled).sort()).toEqual([...LOCALES].sort());
    expect(Object.values(filled).every((v) => v === "")).toBe(true);
  });

  it("fills list values the same way", () => {
    const filled = fillLocalizedList({ tr: ["a"], en: ["b"], de: [] });
    expect(filled.de).toEqual(["b"]);
    expect(filled.ru).toEqual(["b"]);
    expect(filled.tr).toEqual(["a"]);
  });
});

describe("translation targets", () => {
  it("covers every language except the authoring language", () => {
    expect([...TRANSLATION_TARGETS].sort()).toEqual(
      LOCALES.filter((l) => l !== "tr")
        .slice()
        .sort(),
    );
  });

  it("includes German", () => {
    // The admin tour form's translate buttons and its "translates into …" copy
    // both read this list; a hardcoded one silently skipped a new language.
    expect(TRANSLATION_TARGETS).toContain("de");
    expect(TRANSLATION_TARGETS_LABEL).toContain("DE");
  });

  it("never offers to translate Turkish into Turkish", () => {
    expect(TRANSLATION_TARGETS).not.toContain("tr");
  });

  it("spells the label from the same list it translates into", () => {
    expect(TRANSLATION_TARGETS_LABEL.split("/")).toEqual(
      TRANSLATION_TARGETS.map((l) => l.toUpperCase()),
    );
  });
});
