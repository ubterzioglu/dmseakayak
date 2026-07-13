import type { Locale } from "@/lib/site";

export type Localized<T> = Record<Locale, T>;

/** Known slugs from the original bundled content. Admin-created tours may use
 * any free-form slug — see `Tour.slug`. */
export type TourSlug =
  | "kekova-classic"
  | "kekova-west"
  | "kekova-east"
  | "kekova-gulet"
  | "coast-of-light"
  | "kekova-sound"
  | "lycian-comfort-escape"
  | "carian-shore"
  | "trak-signature";

export interface ItineraryStep {
  icon: string;
  title: string;
  body: string;
}

/** A single day in a multi-day tour. */
export interface DayPlan {
  /** 1-based day number. */
  day: number;
  title: string;
  body: string;
  /** Free-text distance, e.g. "15 km" or "8.5 miles". */
  distance?: string;
}

export type TourStatus = "final" | "draft" | "special";

export interface MultiDayMeta {
  durationDays: number;
  nights: number;
  /** Omitted => shown as "On request". */
  pricePerPersonEur?: number;
  singleSupplementEur?: number;
  /** Localized free text, e.g. "min 6, max 12". */
  groupSize?: Localized<string>;
  /** Language-agnostic departure dates, e.g. "22-29 May 2026". */
  dates?: string[];
  /** Omitted (e.g. Carian Shore) => detail page shows "itinerary coming soon". */
  dayByDay?: Localized<DayPlan[]>;
  notIncluded?: Localized<string[]>;
  status: TourStatus;
  /** When set, "View details" links here instead of the generated detail page (TRAK). */
  externalDetailPath?: string;
}

export interface Tour {
  /** Admin-created tours use free-form slugs; the union above is historical. */
  slug: string;
  level: "beginner" | "intermediate-advanced";
  /** Per-person day-tour price. Optional for multi-day tours (use multiDay.pricePerPersonEur). */
  priceEur?: number;
  /** When set, priceEur is the without-meal price and this the with-meal price. */
  priceWithMealEur?: number;
  priceFromKalkanEur?: number;
  distanceKm?: number;
  hikingKm?: number;
  departure?: string;
  arrival?: string;
  /** Language-agnostic place names along the route. */
  routeStops?: string[];
  heroImage: string;
  gallery: string[];
  title: Localized<string>;
  tagline: Localized<string>;
  /** Long intro paragraph (multi-day tours). */
  description?: Localized<string>;
  highlights: Localized<string[]>;
  included?: Localized<string[]>;
  itinerary?: Localized<ItineraryStep[]>;
  whyChoose?: Localized<string[]>;
  /** Present only for multi-day expeditions / the TRAK session. */
  multiDay?: MultiDayMeta;
}
