import { z } from "zod";
import { LOCALES } from "@/lib/site";
import type {
  DayPlan,
  ItineraryStep,
  Localized,
  MultiDayMeta,
  Tour,
  TourStatus,
} from "@/content/tours";
import type { TourInput, TourRow } from "@/hooks/useTours";

// ---------------------------------------------------------------------------
// Form state for the admin tour editor. List-like content is edited as plain
// text (one item per line) per language and converted to the jsonb shapes of
// public.tours on submit. Itinerary lines: "ikon | başlık | açıklama";
// day-by-day lines: "gün | başlık | açıklama | mesafe".
// ---------------------------------------------------------------------------

export interface TourFormState {
  slug: string;
  published: boolean;
  sortOrder: string;
  isMultiDay: boolean;
  level: Tour["level"];
  priceEur: string;
  priceWithMealEur: string;
  priceFromKalkanEur: string;
  distanceKm: string;
  hikingKm: string;
  departure: string;
  arrival: string;
  routeStopsText: string;
  heroImage: string;
  galleryText: string;
  title: Localized<string>;
  tagline: Localized<string>;
  description: Localized<string>;
  highlightsText: Localized<string>;
  includedText: Localized<string>;
  whyChooseText: Localized<string>;
  itineraryText: Localized<string>;
  // Multi-day fields (used when isMultiDay).
  durationDays: string;
  nights: string;
  pricePerPersonEur: string;
  singleSupplementEur: string;
  groupSize: Localized<string>;
  datesText: string;
  status: TourStatus;
  externalDetailPath: string;
  notIncludedText: Localized<string>;
  dayByDayText: Localized<string>;
}

const emptyLocalized = (): Localized<string> => ({ tr: "", en: "", fr: "", ru: "" });

export function emptyForm(): TourFormState {
  return {
    slug: "",
    published: true,
    sortOrder: "0",
    isMultiDay: false,
    level: "beginner",
    priceEur: "",
    priceWithMealEur: "",
    priceFromKalkanEur: "",
    distanceKm: "",
    hikingKm: "",
    departure: "",
    arrival: "",
    routeStopsText: "",
    heroImage: "",
    galleryText: "",
    title: emptyLocalized(),
    tagline: emptyLocalized(),
    description: emptyLocalized(),
    highlightsText: emptyLocalized(),
    includedText: emptyLocalized(),
    whyChooseText: emptyLocalized(),
    itineraryText: emptyLocalized(),
    durationDays: "",
    nights: "",
    pricePerPersonEur: "",
    singleSupplementEur: "",
    groupSize: emptyLocalized(),
    datesText: "",
    status: "final",
    externalDetailPath: "",
    notIncludedText: emptyLocalized(),
    dayByDayText: emptyLocalized(),
  };
}

// ─── text ↔ structure conversions ───────────────────────────────────────────────

const textToList = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const listToText = (list: string[] | undefined): string => (list ?? []).join("\n");

const mapLocalized = <A, B>(value: Localized<A>, fn: (item: A) => B): Localized<B> => ({
  tr: fn(value.tr),
  en: fn(value.en),
  fr: fn(value.fr),
  ru: fn(value.ru),
});

const hasAnyText = (value: Localized<string>): boolean =>
  LOCALES.some((locale) => value[locale].trim() !== "");

const numberToText = (value: number | null | undefined): string =>
  value == null ? "" : String(value);

const textToNumber = (value: string): number | null => {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Empty non-Turkish fields fall back to the Turkish value so pick() never
 * renders a blank string on the public site. */
const withTrFallback = (value: Localized<string>): Localized<string> => {
  const tr = value.tr.trim();
  return {
    tr,
    en: value.en.trim() || tr,
    fr: value.fr.trim() || tr,
    ru: value.ru.trim() || tr,
  };
};

const localizedLists = (value: Localized<string>): Localized<string[]> | null => {
  if (!hasAnyText(value)) return null;
  const lists = mapLocalized(value, textToList);
  return {
    tr: lists.tr,
    en: lists.en.length > 0 ? lists.en : lists.tr,
    fr: lists.fr.length > 0 ? lists.fr : lists.tr,
    ru: lists.ru.length > 0 ? lists.ru : lists.tr,
  };
};

const itineraryToText = (steps: ItineraryStep[] | undefined): string =>
  (steps ?? []).map((s) => `${s.icon} | ${s.title} | ${s.body}`).join("\n");

const textToItinerary = (text: string): ItineraryStep[] =>
  textToList(text).map((line) => {
    const [icon = "", title = "", ...rest] = line.split("|").map((part) => part.trim());
    return { icon, title, body: rest.join(" | ") };
  });

const dayPlanToText = (days: DayPlan[] | undefined): string =>
  (days ?? [])
    .map((d) => [d.day, d.title, d.body, d.distance].filter((part) => part != null && part !== "").join(" | "))
    .join("\n");

const textToDayPlan = (text: string): DayPlan[] =>
  textToList(text).map((line, index) => {
    const parts = line.split("|").map((part) => part.trim());
    const day = Number(parts[0]);
    return {
      day: Number.isFinite(day) && day > 0 ? day : index + 1,
      title: parts[1] ?? "",
      body: parts[2] ?? "",
      ...(parts[3] ? { distance: parts[3] } : {}),
    };
  });

const localizedItinerary = (value: Localized<string>): Localized<ItineraryStep[]> | null =>
  hasAnyText(value) ? mapLocalized(value, textToItinerary) : null;

const localizedDayPlan = (value: Localized<string>): Localized<DayPlan[]> | null =>
  hasAnyText(value) ? mapLocalized(value, textToDayPlan) : null;

// ─── row → form ─────────────────────────────────────────────────────────────────

export function rowToForm(row: TourRow): TourFormState {
  const md = row.multi_day;
  return {
    slug: row.slug,
    published: row.published,
    sortOrder: String(row.sort_order),
    isMultiDay: row.is_multi_day,
    level: row.level,
    priceEur: numberToText(row.price_eur),
    priceWithMealEur: numberToText(row.price_with_meal_eur),
    priceFromKalkanEur: numberToText(row.price_from_kalkan_eur),
    distanceKm: numberToText(row.distance_km),
    hikingKm: numberToText(row.hiking_km),
    departure: row.departure ?? "",
    arrival: row.arrival ?? "",
    routeStopsText: listToText(row.route_stops ?? undefined),
    heroImage: row.hero_image ?? "",
    galleryText: listToText(row.gallery ?? undefined),
    title: { ...emptyLocalized(), ...row.title },
    tagline: { ...emptyLocalized(), ...row.tagline },
    description: { ...emptyLocalized(), ...(row.description ?? {}) },
    highlightsText: mapLocalized({ ...({ tr: [], en: [], fr: [], ru: [] }), ...(row.highlights ?? {}) }, listToText),
    includedText: mapLocalized({ ...({ tr: [], en: [], fr: [], ru: [] }), ...(row.included ?? {}) }, listToText),
    whyChooseText: mapLocalized({ ...({ tr: [], en: [], fr: [], ru: [] }), ...(row.why_choose ?? {}) }, listToText),
    itineraryText: row.itinerary
      ? mapLocalized(row.itinerary, itineraryToText)
      : emptyLocalized(),
    durationDays: numberToText(md?.durationDays),
    nights: numberToText(md?.nights),
    pricePerPersonEur: numberToText(md?.pricePerPersonEur),
    singleSupplementEur: numberToText(md?.singleSupplementEur),
    groupSize: { ...emptyLocalized(), ...(md?.groupSize ?? {}) },
    datesText: listToText(md?.dates),
    status: md?.status ?? "final",
    externalDetailPath: md?.externalDetailPath ?? "",
    notIncludedText: md?.notIncluded ? mapLocalized(md.notIncluded, listToText) : emptyLocalized(),
    dayByDayText: md?.dayByDay ? mapLocalized(md.dayByDay, dayPlanToText) : emptyLocalized(),
  };
}

// ─── validation + form → input ──────────────────────────────────────────────────

const coreSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, rakam ve tire içermeli (örn. kekova-classic)."),
  titleTr: z.string().min(1, "Türkçe başlık zorunludur."),
  taglineTr: z.string().min(1, "Türkçe slogan zorunludur."),
});

/** Returns a Turkish error message, or null when the form can be saved. */
export function validateForm(form: TourFormState): string | null {
  const parsed = coreSchema.safeParse({
    slug: form.slug.trim(),
    titleTr: form.title.tr.trim(),
    taglineTr: form.tagline.tr.trim(),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Form geçersiz.";
  if (form.isMultiDay && textToNumber(form.durationDays) == null) {
    return "Çok günlü turlarda gün sayısı zorunludur.";
  }
  return null;
}

export function formToInput(form: TourFormState): TourInput {
  const multiDay: MultiDayMeta | null = form.isMultiDay
    ? {
        durationDays: textToNumber(form.durationDays) ?? 1,
        nights: textToNumber(form.nights) ?? 0,
        status: form.status,
        ...(textToNumber(form.pricePerPersonEur) != null
          ? { pricePerPersonEur: textToNumber(form.pricePerPersonEur)! }
          : {}),
        ...(textToNumber(form.singleSupplementEur) != null
          ? { singleSupplementEur: textToNumber(form.singleSupplementEur)! }
          : {}),
        ...(hasAnyText(form.groupSize) ? { groupSize: withTrFallback(form.groupSize) } : {}),
        ...(textToList(form.datesText).length > 0 ? { dates: textToList(form.datesText) } : {}),
        ...(localizedDayPlan(form.dayByDayText) ? { dayByDay: localizedDayPlan(form.dayByDayText)! } : {}),
        ...(localizedLists(form.notIncludedText) ? { notIncluded: localizedLists(form.notIncludedText)! } : {}),
        ...(form.externalDetailPath.trim()
          ? { externalDetailPath: form.externalDetailPath.trim() }
          : {}),
      }
    : null;

  const gallery = textToList(form.galleryText);

  return {
    slug: form.slug.trim(),
    published: form.published,
    sort_order: textToNumber(form.sortOrder) ?? 0,
    is_multi_day: form.isMultiDay,
    level: form.level,
    price_eur: textToNumber(form.priceEur),
    price_with_meal_eur: textToNumber(form.priceWithMealEur),
    price_from_kalkan_eur: textToNumber(form.priceFromKalkanEur),
    distance_km: textToNumber(form.distanceKm),
    hiking_km: textToNumber(form.hikingKm),
    departure: form.departure.trim() || null,
    arrival: form.arrival.trim() || null,
    route_stops: textToList(form.routeStopsText).length > 0 ? textToList(form.routeStopsText) : null,
    hero_image: form.heroImage.trim() || null,
    gallery: gallery.length > 0 ? gallery : null,
    title: withTrFallback(form.title),
    tagline: withTrFallback(form.tagline),
    description: hasAnyText(form.description) ? withTrFallback(form.description) : null,
    highlights: localizedLists(form.highlightsText),
    included: localizedLists(form.includedText),
    why_choose: localizedLists(form.whyChooseText),
    itinerary: localizedItinerary(form.itineraryText),
    multi_day: multiDay,
  };
}
