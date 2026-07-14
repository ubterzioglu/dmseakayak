/**
 * Central business / brand configuration. Single source of truth for contact
 * details, social links and the supported languages. Real values come from
 * docs/ICERIK (Dragoman Turkey, Kaş/Antalya).
 */
export const SITE = {
  name: "Dragoman SeaKayak",
  domain: "https://dragomanseakayak.com",
  ogImage: "https://dragomanseakayak.com/ensonlogo.png",
  // Contact (from the hotel-presentation PDF / business records)
  phone: "+90 242 836 3614",
  // WhatsApp number in international digits, no "+" or spaces.
  // Mobile WhatsApp line: 0533 290 1463.
  whatsapp: "905332901463",
  email: "info@dragoman-turkey.com",
  address: "Uzunçarşı Cad. No:15, Kaş 07580, Antalya, Türkiye",
  instagram: "https://www.instagram.com/dragomandivingandoutdoors/",
  facebook: "https://facebook.com/dragomanseakayak",
  parentBrand: "Dragoman Turkey",
} as const;

export const LOCALES = ["tr", "en", "fr", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

/**
 * Path prefix the whole localized site is mounted under. Live at the domain
 * root; the router and every localePath() link follow this value.
 */
export const BASE_PATH = "";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
