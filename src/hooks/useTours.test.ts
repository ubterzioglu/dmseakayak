import { describe, expect, it, vi } from "vitest";
import { TOURS, MULTI_DAY_TOURS } from "@/content/tours";
import {
  STATIC_TOURS_DATA,
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

describe("tourToInput / rowToTour", () => {
  it("round-trips the kekova-classic day tour", () => {
    const original = TOURS[0];
    const tour = rowToTour(toRow(tourToInput(original)));

    expect(tour.slug).toBe(original.slug);
    expect(tour.priceEur).toBe(45);
    expect(tour.priceWithMealEur).toBe(60);
    expect(tour.priceFromKalkanEur).toBe(original.priceFromKalkanEur);
    expect(tour.title).toEqual(original.title);
    expect(tour.highlights).toEqual(original.highlights);
    expect(tour.included).toEqual(original.included);
    expect(tour.itinerary).toEqual(original.itinerary);
    expect(tour.whyChoose).toEqual(original.whyChoose);
    expect(tour.routeStops).toEqual(original.routeStops);
    expect(tour.gallery).toEqual(original.gallery);
    expect(tour.multiDay).toBeUndefined();
  });

  it("round-trips a multi-day tour including day-by-day plans", () => {
    const original = MULTI_DAY_TOURS[0];
    const input = tourToInput(original);
    expect(input.is_multi_day).toBe(true);

    const tour = rowToTour(toRow(input));
    expect(tour.multiDay).toEqual(original.multiDay);
    expect(tour.description).toEqual(original.description);
    expect(tour.title).toEqual(original.title);
  });
});

describe("splitRows", () => {
  it("splits by is_multi_day and keeps row order", () => {
    const rows = [
      toRow(tourToInput(MULTI_DAY_TOURS[0], { sortOrder: 0 }), "m1"),
      toRow(tourToInput(TOURS[0], { sortOrder: 0 }), "d1"),
      toRow(tourToInput(TOURS[1], { sortOrder: 1 }), "d2"),
    ];
    const { dayTours, multiDayTours } = splitRows(rows);
    expect(dayTours.map((t) => t.slug)).toEqual([TOURS[0].slug, TOURS[1].slug]);
    expect(multiDayTours.map((t) => t.slug)).toEqual([MULTI_DAY_TOURS[0].slug]);
  });
});

describe("fetchPublishedTours", () => {
  it("falls back to the static tours when supabase is not configured", async () => {
    state.client = null;
    await expect(fetchPublishedTours()).resolves.toBe(STATIC_TOURS_DATA);
  });

  it("falls back to the static tours on a query error", async () => {
    state.client = makeClient({ data: null, error: { message: "boom" } });
    await expect(fetchPublishedTours()).resolves.toBe(STATIC_TOURS_DATA);
  });

  it("falls back to the static tours when the table is empty", async () => {
    state.client = makeClient({ data: [], error: null });
    await expect(fetchPublishedTours()).resolves.toBe(STATIC_TOURS_DATA);
  });

  it("returns mapped DB tours when rows exist", async () => {
    state.client = makeClient({
      data: [toRow(tourToInput(TOURS[0]))],
      error: null,
    });
    const result = await fetchPublishedTours();
    expect(result.dayTours).toHaveLength(1);
    expect(result.dayTours[0].slug).toBe(TOURS[0].slug);
    expect(result.multiDayTours).toHaveLength(0);
  });
});
