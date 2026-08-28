import { describe, expect, it, vi } from "vitest";
import type { Tour } from "@/content/tours";
import {
  fetchPublishedTours,
  rowToTour,
  splitRows,
  tourToInput,
  type TourInput,
  type TourRow,
} from "./useTours";

const state = vi.hoisted(() => ({ client: null as unknown }));

vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return state.client;
  },
}));

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

/** Minimal stub of the supabase.from("tours") select chain. */
const makeClient = (result: QueryResult) => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          order: () => Promise.resolve(result),
        }),
      }),
    }),
  }),
});

const toRow = (input: TourInput, id = "row-1"): TourRow => ({
  ...input,
  id,
  created_at: "2026-01-01T00:00:00Z",
});

const DAY_TOUR: Tour = {
  slug: "kekova-classic",
  level: "beginner",
  priceEur: 45,
  priceWithMealEur: 60,
  priceFromKalkanEur: 70,
  distanceKm: 8,
  departure: "07:30",
  arrival: "14:30 / 15:00",
  routeStops: ["Üçağız", "Kekova Island"],
  heroImage: "/images/tours/kekova-classic/tomb1.jpg",
  gallery: [],
  title: { tr: "Kekova Klasik", en: "Kekova Classic", fr: "Kekova Classic", ru: "Кекова Классик", de: "Kekova Klassik" },
  tagline: { tr: "Etiket", en: "Tagline", fr: "Slogan", ru: "Слоган", de: "Slogan" },
  highlights: { tr: ["a"], en: ["a"], fr: ["a"], ru: ["a"], de: ["a"] },
  included: { tr: ["b"], en: ["b"], fr: ["b"], ru: ["b"], de: ["b"] },
  itinerary: {
    tr: [{ icon: "🚣", title: "Başlangıç", body: "Açıklama" }],
    en: [{ icon: "🚣", title: "Start", body: "Body" }],
    fr: [{ icon: "🚣", title: "Départ", body: "Texte" }],
    ru: [{ icon: "🚣", title: "Старт", body: "Текст" }],
    de: [{ icon: "🚣", title: "Start", body: "Text" }],
  },
  whyChoose: { tr: ["c"], en: ["c"], fr: ["c"], ru: ["c"], de: ["c"] },
};

const MULTI_DAY_TOUR: Tour = {
  slug: "lycian-comfort-escape",
  level: "intermediate-advanced",
  heroImage: "/images/tours/lycian-comfort-escape.jpg",
  gallery: [],
  title: { tr: "Likya Kaçamağı", en: "Lycian Escape", fr: "Escapade Lycienne", ru: "Ликийский эскейп", de: "Lykische Auszeit" },
  tagline: { tr: "Etiket", en: "Tagline", fr: "Slogan", ru: "Слоган", de: "Slogan" },
  description: { tr: "Açıklama", en: "Description", fr: "Description", ru: "Описание", de: "Beschreibung" },
  highlights: { tr: ["a"], en: ["a"], fr: ["a"], ru: ["a"], de: ["a"] },
  multiDay: { durationDays: 7, nights: 6, status: "final" },
};

describe("tourToInput / rowToTour", () => {
  it("round-trips a day tour", () => {
    const tour = rowToTour(toRow(tourToInput(DAY_TOUR)));

    expect(tour.slug).toBe(DAY_TOUR.slug);
    expect(tour.priceEur).toBe(45);
    expect(tour.priceWithMealEur).toBe(60);
    expect(tour.priceFromKalkanEur).toBe(DAY_TOUR.priceFromKalkanEur);
    expect(tour.title).toEqual(DAY_TOUR.title);
    expect(tour.highlights).toEqual(DAY_TOUR.highlights);
    expect(tour.included).toEqual(DAY_TOUR.included);
    expect(tour.itinerary).toEqual(DAY_TOUR.itinerary);
    expect(tour.whyChoose).toEqual(DAY_TOUR.whyChoose);
    expect(tour.routeStops).toEqual(DAY_TOUR.routeStops);
    expect(tour.gallery).toEqual(DAY_TOUR.gallery);
    expect(tour.multiDay).toBeUndefined();
  });

  it("round-trips a multi-day tour including its multiDay block", () => {
    const input = tourToInput(MULTI_DAY_TOUR);
    expect(input.is_multi_day).toBe(true);

    const tour = rowToTour(toRow(input));
    expect(tour.multiDay).toEqual(MULTI_DAY_TOUR.multiDay);
    expect(tour.description).toEqual(MULTI_DAY_TOUR.description);
    expect(tour.title).toEqual(MULTI_DAY_TOUR.title);
  });
});

describe("splitRows", () => {
  it("splits by is_multi_day and keeps row order", () => {
    const rows = [
      toRow(tourToInput(MULTI_DAY_TOUR, { sortOrder: 0 }), "m1"),
      toRow(tourToInput(DAY_TOUR, { sortOrder: 0 }), "d1"),
    ];
    const { dayTours, multiDayTours } = splitRows(rows);
    expect(dayTours.map((t) => t.slug)).toEqual([DAY_TOUR.slug]);
    expect(multiDayTours.map((t) => t.slug)).toEqual([MULTI_DAY_TOUR.slug]);
  });
});

describe("fetchPublishedTours", () => {
  it("throws when supabase is not configured", async () => {
    state.client = null;
    await expect(fetchPublishedTours()).rejects.toThrow("Supabase yapılandırılmamış");
  });

  it("throws on a query error", async () => {
    state.client = makeClient({ data: null, error: { message: "boom" } });
    await expect(fetchPublishedTours()).rejects.toThrow("boom");
  });

  it("returns empty lists when the table is empty", async () => {
    state.client = makeClient({ data: [], error: null });
    await expect(fetchPublishedTours()).resolves.toEqual({ dayTours: [], multiDayTours: [] });
  });

  it("returns mapped DB tours when rows exist", async () => {
    state.client = makeClient({
      data: [toRow(tourToInput(DAY_TOUR))],
      error: null,
    });
    const result = await fetchPublishedTours();
    expect(result.dayTours).toHaveLength(1);
    expect(result.dayTours[0].slug).toBe(DAY_TOUR.slug);
    expect(result.multiDayTours).toHaveLength(0);
  });
});
