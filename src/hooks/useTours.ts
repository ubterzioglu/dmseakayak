import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Tour,
  type Localized,
  type ItineraryStep,
  type MultiDayMeta,
} from "@/content/tours";

// ---------------------------------------------------------------------------
// Admin-managed tours (public.tours, see supabase/migrations/0011_tours.sql).
// The public site reads exclusively from the DB — no static fallback.
// ---------------------------------------------------------------------------

/** Row shape of public.tours. Localized/nested content is jsonb passthrough. */
export interface TourRow {
  id: string;
  slug: string;
  published: boolean;
  sort_order: number;
  is_multi_day: boolean;
  level: Tour["level"];
  price_eur: number | null;
  price_with_meal_eur: number | null;
  price_from_kalkan_eur: number | null;
  distance_km: number | null;
  hiking_km: number | null;
  departure: string | null;
  arrival: string | null;
  route_stops: string[] | null;
  hero_image: string | null;
  gallery: string[] | null;
  title: Localized<string>;
  tagline: Localized<string>;
  description: Localized<string> | null;
  highlights: Localized<string[]> | null;
  included: Localized<string[]> | null;
  why_choose: Localized<string[]> | null;
  itinerary: Localized<ItineraryStep[]> | null;
  multi_day: MultiDayMeta | null;
  created_at: string;
}

export type TourInput = Omit<TourRow, "id" | "created_at">;

export interface ToursData {
  dayTours: Tour[];
  multiDayTours: Tour[];
}

const EMPTY_LISTS: Localized<string[]> = { tr: [], en: [], fr: [], ru: [] };

export function rowToTour(row: TourRow): Tour {
  return {
    slug: row.slug,
    level: row.level,
    priceEur: row.price_eur ?? undefined,
    priceWithMealEur: row.price_with_meal_eur ?? undefined,
    priceFromKalkanEur: row.price_from_kalkan_eur ?? undefined,
    distanceKm: row.distance_km ?? undefined,
    hikingKm: row.hiking_km ?? undefined,
    departure: row.departure ?? undefined,
    arrival: row.arrival ?? undefined,
    routeStops: row.route_stops ?? undefined,
    heroImage: row.hero_image ?? "",
    gallery: row.gallery ?? [],
    title: row.title,
    tagline: row.tagline,
    description: row.description ?? undefined,
    highlights: row.highlights ?? EMPTY_LISTS,
    included: row.included ?? undefined,
    itinerary: row.itinerary ?? undefined,
    whyChoose: row.why_choose ?? undefined,
    multiDay: row.multi_day ?? undefined,
  };
}

export function tourToInput(
  tour: Tour,
  opts: { published?: boolean; sortOrder?: number } = {},
): TourInput {
  return {
    slug: tour.slug,
    published: opts.published ?? true,
    sort_order: opts.sortOrder ?? 0,
    is_multi_day: tour.multiDay != null,
    level: tour.level,
    price_eur: tour.priceEur ?? null,
    price_with_meal_eur: tour.priceWithMealEur ?? null,
    price_from_kalkan_eur: tour.priceFromKalkanEur ?? null,
    distance_km: tour.distanceKm ?? null,
    hiking_km: tour.hikingKm ?? null,
    departure: tour.departure ?? null,
    arrival: tour.arrival ?? null,
    route_stops: tour.routeStops ?? null,
    hero_image: tour.heroImage || null,
    gallery: tour.gallery.length > 0 ? tour.gallery : null,
    title: tour.title,
    tagline: tour.tagline,
    description: tour.description ?? null,
    highlights: tour.highlights,
    included: tour.included ?? null,
    why_choose: tour.whyChoose ?? null,
    itinerary: tour.itinerary ?? null,
    multi_day: tour.multiDay ?? null,
  };
}

/** Splits DB rows into the two public sections by the admin-managed flag. */
export function splitRows(rows: TourRow[]): ToursData {
  return {
    dayTours: rows.filter((r) => !r.is_multi_day).map(rowToTour),
    multiDayTours: rows.filter((r) => r.is_multi_day).map(rowToTour),
  };
}

/** Published tours ordered by sort_order. Throws on missing config or query error. */
export async function fetchPublishedTours(): Promise<ToursData> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as TourRow[];
  return splitRows(rows);
}

export interface UseToursDataState extends ToursData {
  loading: boolean;
  error: string | null;
}

/** Public pages: loads tours from the DB. No static fallback — callers must
 * handle `loading` and `error`. */
export function useToursData(): UseToursDataState {
  const [state, setState] = useState<UseToursDataState>({
    dayTours: [],
    multiDayTours: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchPublishedTours()
      .then((data) => {
        if (cancelled) return;
        setState({ ...data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Turlar yüklenemedi";
        setState({ dayTours: [], multiDayTours: [], loading: false, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export interface UseTourState {
  tour: Tour | undefined;
  loading: boolean;
  error: string | null;
}

/** Tour detail: resolves a slug against the DB. No static fallback. */
export function useTour(slug: string | undefined): UseTourState {
  const [state, setState] = useState<UseTourState>({
    tour: undefined,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ tour: undefined, loading: true, error: null });
    fetchPublishedTours()
      .then(({ dayTours, multiDayTours }) => {
        if (cancelled) return;
        const tour = [...dayTours, ...multiDayTours].find((t) => t.slug === slug);
        setState({ tour, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Tur yüklenemedi";
        setState({ tour: undefined, loading: false, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

// ─── Admin CRUD ─────────────────────────────────────────────────────────────────

export async function fetchAllTours(): Promise<TourRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TourRow[];
}

export async function saveTour(input: TourInput, id?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = id
    ? await supabase.from("tours").update(input).eq("id", id)
    : await supabase.from("tours").insert(input);
  if (error) throw new Error(error.message);
}

export async function deleteTour(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Uploads an image to the tour-images bucket and returns its public URL. */
export async function uploadTourImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `tours/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("tour-images").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("tour-images").getPublicUrl(path).data.publicUrl;
}

// ─── Admin: form-field machine translation ─────────────────────────────────────

export type TourLang = "tr" | "en" | "fr" | "ru";

interface TranslateTextItem {
  text: string;
  from: TourLang;
  to: TourLang;
}

/**
 * Batch-translates plain text via the translate-text Edge Function (free
 * MyMemory API). Used by the tour form's "Otomatik çevir" buttons. Items with
 * empty text are skipped and resolve to null in the same position.
 */
export async function translateTexts(items: TranslateTextItem[]): Promise<(string | null)[]> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  if (items.length === 0) return [];
  const { data, error } = await supabase.functions.invoke("translate-text", {
    body: { items },
  });
  if (error) throw new Error(error.message);
  return (data as { translations: (string | null)[] }).translations;
}
