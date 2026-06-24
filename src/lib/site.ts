/**
 * Central business / brand configuration. Single source of truth for contact
 * details, social links and the supported languages. Real values come from
 * docs/ICERIK (Dragoman Turkey, Kaş/Antalya).
 */
export const SITE = {
  name: "Dragoman SeaKayak",
  domain: "https://dragomanseakayak.com",
  ogImage: "https://dragomanseakayak.com/seakayakog.jpg",
  // Contact (from the hotel-presentation PDF / business records)
  phone: "+90 242 836 3614",
  // WhatsApp number in international digits, no "+" or spaces.
  // Mobile WhatsApp line: 0533 290 1463.
  whatsapp: "905332901463",
  email: "info@dragomanseakayak.com",
  address: "Uzunçarşı Cad. No:15, Kaş 07580, Antalya, Türkiye",
  instagram: "https://instagram.com/dragomanseakayak",
  facebook: "https://facebook.com/dragomanseakayak",
  parentBrand: "Dragoman Turkey",
} as const;

export const LOCALES = ["tr", "en", "fr", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

/**
 * Path prefix the whole localized site is mounted under. The site is staged at
 * `/mvp` until launch while the root shows a Coming Soon placeholder. To go
 * live, set this to "" and the router + every localePath() link follow.
 */
export const BASE_PATH = "/mvp";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
