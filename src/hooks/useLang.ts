import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLayoutEffect, useRef, useState } from "react";
import { BASE_PATH, DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/site";
import { resolveLocalized } from "@/lib/localized";

/**
 * Derives the active locale from the :lang route param, keeps i18next and
 * <html lang> in sync, and exposes helpers for picking localized content and
 * building locale-prefixed paths.
 */
export function useLang() {
  const { lang } = useParams();
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const { i18n, t } = useTranslation();

  // i18n.changeLanguage() below is async, and components that render
  // synchronously (no other async state to piggyback a re-render on) can get
  // stuck showing the pre-change language: useTranslation() only re-renders
  // when its own bound events fire, which race against changeLanguage's own
  // internal "languageChanged" emit on first mount. Tracking the resolved
  // language in state guarantees every useLang() consumer re-renders once the
  // change actually lands.
  const [, forceRerender] = useState(0);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useLayoutEffect(() => {
    const handleLanguageChanged = () => forceRerender((n) => n + 1);
    i18n.on("languageChanged", handleLanguageChanged);

    if (i18n.language !== localeRef.current) {
      void i18n.changeLanguage(localeRef.current);
    } else {
      // i18n was already on the right language before this component mounted
      // (another useLang() consumer changed it first), so no "languageChanged"
      // event will fire to trigger our re-render — force one now so this
      // component's first paint reflects the correct language too.
      forceRerender((n) => n + 1);
    }
    document.documentElement.lang = localeRef.current;

    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [locale, i18n]);

  /**
   * Pick the right string/array from a Localized<T> content object, falling
   * back through FALLBACK_CHAIN when the active locale has nothing.
   *
   * This must tolerate a *missing key*, not just an empty one: rows written to
   * public.tours before a language existed carry no key for it at all, so a
   * plain `value[locale]` would return undefined and crash every `.map()` on
   * the detail pages. Empty strings and empty arrays count as missing too —
   * an admin who leaves a field blank should get the fallback, not a gap.
   */
  const pick = <T,>(value: Partial<Record<Locale, T>> | null | undefined): T => {
    const isEmpty = (v: T) =>
      (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);
    const found = resolveLocalized(value, locale, isEmpty);
    if (found !== undefined) return found;

    // Every language is empty (or the whole object is missing). Return a value
    // of the shape callers expect so list rendering degrades to "nothing to
    // show" instead of throwing.
    const anyValue = value ? Object.values(value).find((v) => v != null) : undefined;
    return (Array.isArray(anyValue) ? [] : "") as T;
  };

  /** Build a path under the current locale, e.g. localePath("turlar") -> /mvp/tr/turlar */
  const localePath = (path = "") => `${BASE_PATH}/${locale}${path ? `/${path}` : ""}`;

  return { locale, t, pick, localePath };
}
