import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, FALLBACK_CHAIN, LOCALES } from "@/lib/site";
import tr from "./locales/tr/common.json";
import en from "./locales/en/common.json";
import fr from "./locales/fr/common.json";
import ru from "./locales/ru/common.json";
import de from "./locales/de/common.json";

void i18n.use(initReactI18next).init({
  resources: {
    tr: { common: tr },
    en: { common: en },
    fr: { common: fr },
    ru: { common: ru },
    de: { common: de },
  },
  lng: DEFAULT_LOCALE,
  // Missing UI keys resolve through the same chain as content: en, then tr.
  fallbackLng: FALLBACK_CHAIN as unknown as string[],
  supportedLngs: LOCALES as unknown as string[],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
