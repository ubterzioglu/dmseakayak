# Turları Tamamen DB'ye Taşıma Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statik tur verisi fallback'ini (`src/content/tours.ts` içindeki `TOURS`, `src/content/multiDayTours.ts` içindeki `MULTI_DAY_TOURS`) tamamen kaldırıp, siteyi yalnızca Supabase `public.tours` tablosundan besle. DB'ye erişilemediğinde kırık statik veri yerine açık bir hata durumu göster.

**Architecture:** `src/hooks/useTours.ts` içindeki `fetchPublishedTours()`/`useToursData()`/`useTour()` statik-fallback dallarını kaldırıp `{ data, loading, error }` şeklinde açık bir hata kanalı ekliyoruz. Tüketen bileşenler bu üç state'i karşılayacak şekilde güncelleniyor. `src/content/tours.ts` yalnızca paylaşılan TypeScript type'larını (`Tour`, `Localized`, vb.) barındıran bir dosyaya indirgeniyor; içerik dosyaları (`multiDayTours.ts`, `tourImages.ts`) silinip repodan çıkarılıyor.

**Tech Stack:** React + TypeScript, Vite, Supabase JS client, Vitest.

## Global Constraints

- Statik veri hiçbir yerde fallback olarak kullanılmayacak — DB erişilemezse kullanıcıya Türkçe hata mesajı gösterilir: "Turlar yüklenemedi, lütfen daha sonra tekrar deneyin."
- `Tour`, `Localized`, `ItineraryStep`, `DayPlan`, `MultiDayMeta`, `TourStatus`, `TourSlug` type tanımları `src/content/tours.ts` içinde kalır — silinmez.
- Mevcut kart/liste görsel tasarımı değişmez; sadece veri kaynağı ve boş/hata durumu davranışı değişir.
- Her task sonunda `npx vitest run` ve `npx tsc --noEmit` (veya proje build komutu) hatasız geçmeli.

---

### Task 1: `useTours.ts` — statik fallback'i kaldır, `error` state'i ekle

**Files:**
- Modify: `src/hooks/useTours.ts`
- Test: `src/hooks/useTours.test.ts`

**Interfaces:**
- Produces:
  - `export interface ToursData { dayTours: Tour[]; multiDayTours: Tour[]; }` (değişmedi)
  - `export async function fetchPublishedTours(): Promise<ToursData>` — artık DB'ye ulaşılamazsa `throw new Error(message)` fırlatır; başarılı ama boş sonuçta `{ dayTours: [], multiDayTours: [] }` döner.
  - `export interface UseToursDataState { dayTours: Tour[]; multiDayTours: Tour[]; loading: boolean; error: string | null; }`
  - `export function useToursData(): UseToursDataState`
  - `export interface UseTourState { tour: Tour | undefined; loading: boolean; error: string | null; }`
  - `export function useTour(slug: string | undefined): UseTourState`
  - `rowToTour`, `tourToInput`, `splitRows`, `fetchAllTours`, `saveTour`, `deleteTour`, `uploadTourImage`, `translateTexts` — değişmedi.
  - `importStaticTours` — **kaldırılır** (Task 5'te admin panelinden referansı da kaldırılacak).
  - `STATIC_TOURS_DATA` — **kaldırılır**.

- [ ] **Step 1: Testi güncelle — statik veri importlarını kaldır, inline fixture kullan**

`src/hooks/useTours.test.ts` dosyasını baştan yaz:

```typescript
import { describe, expect, it, vi } from "vitest";
import {
  fetchPublishedTours,
  rowToTour,
  splitRows,
  tourToInput,
  type Tour,
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
  title: { tr: "Kekova Klasik", en: "Kekova Classic", fr: "Kekova Classic", ru: "Кекова Классик" },
  tagline: { tr: "Etiket", en: "Tagline", fr: "Slogan", ru: "Слоган" },
  highlights: { tr: ["a"], en: ["a"], fr: ["a"], ru: ["a"] },
  included: { tr: ["b"], en: ["b"], fr: ["b"], ru: ["b"] },
  itinerary: {
    tr: [{ icon: "🚣", title: "Başlangıç", body: "Açıklama" }],
    en: [{ icon: "🚣", title: "Start", body: "Body" }],
    fr: [{ icon: "🚣", title: "Départ", body: "Texte" }],
    ru: [{ icon: "🚣", title: "Старт", body: "Текст" }],
  },
  whyChoose: { tr: ["c"], en: ["c"], fr: ["c"], ru: ["c"] },
};

const MULTI_DAY_TOUR: Tour = {
  slug: "lycian-comfort-escape",
  level: "intermediate-advanced",
  heroImage: "/images/tours/lycian-comfort-escape.jpg",
  gallery: [],
  title: { tr: "Likya Kaçamağı", en: "Lycian Escape", fr: "Escapade Lycienne", ru: "Ликийский эскейп" },
  tagline: { tr: "Etiket", en: "Tagline", fr: "Slogan", ru: "Слоган" },
  description: { tr: "Açıklama", en: "Description", fr: "Description", ru: "Описание" },
  highlights: { tr: ["a"], en: ["a"], fr: ["a"], ru: ["a"] },
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
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/hooks/useTours.test.ts`
Expected: FAIL — `fetchPublishedTours` henüz `throw` etmiyor, hâlâ `STATIC_TOURS_DATA`'ya düşüyor; `error` alanı yok.

- [ ] **Step 3: `useTours.ts` içindeki statik fallback'i kaldır**

`src/hooks/useTours.ts` dosyasının üst kısmındaki import'ları ve `STATIC_TOURS_DATA`'yı kaldır:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getTour,
  type Tour,
  type Localized,
  type ItineraryStep,
  type MultiDayMeta,
} from "@/content/tours";
```

(Not: `getTour` artık statik arama yapmayacak — Task 3'te DB tabanlı hale getirilecek `useTour` bu importu hiç kullanmayacak şekilde de yazılabilir; burada basitlik için `getTour` import'unu tamamen kaldırıyoruz çünkü `useTour` DB'yi doğrudan sorgulayacak.)

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Tour,
  type Localized,
  type ItineraryStep,
  type MultiDayMeta,
} from "@/content/tours";
```

`STATIC_TOURS_DATA` tanımını ve üstündeki yorum bloğunu tamamen sil:

```typescript
// SİL:
// ---------------------------------------------------------------------------
// Admin-managed tours (public.tours, see supabase/migrations/0011_tours.sql).
// The public site reads the DB first and silently falls back to the bundled
// static tours when the table is empty or unreachable — same pattern as the
// hero video and the old gallery.
// ---------------------------------------------------------------------------
//
// export const STATIC_TOURS_DATA: ToursData = {
//   dayTours: TOURS,
//   multiDayTours: MULTI_DAY_TOURS,
// };
```

Yerine kısa bir yorum bırak:

```typescript
// ---------------------------------------------------------------------------
// Admin-managed tours (public.tours, see supabase/migrations/0011_tours.sql).
// The public site reads exclusively from the DB — no static fallback.
// ---------------------------------------------------------------------------
```

- [ ] **Step 4: `fetchPublishedTours` — throw yerine fallback'i kaldır**

```typescript
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
```

- [ ] **Step 5: `useToursData` — `loading`/`error` state'i ekle**

```typescript
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
```

- [ ] **Step 6: `useTour` — statik `getTour` fallback'ini kaldır, DB-only yap**

```typescript
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
```

- [ ] **Step 7: `importStaticTours` fonksiyonunu tamamen kaldır**

`src/hooks/useTours.ts` içindeki şu bloğu sil (Task 5'te `ToursPanel.tsx`'teki referansı ayrıca kaldırılacak):

```typescript
// SİL:
// /** Inserts the bundled static tours that are missing from the DB (matched by
//  * slug); existing rows are left untouched. Returns how many were added. */
// export async function importStaticTours(): Promise<number> {
//   ...
// }
```

- [ ] **Step 8: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/hooks/useTours.test.ts`
Expected: PASS — tüm testler yeşil.

- [ ] **Step 9: Tip kontrolü — henüz kırık import'lar olacak, bu adımda göz ardı et**

Run: `npx tsc --noEmit`
Expected: `src/content/tours.ts`, `ToursPanel.tsx`, `ReservationForm.tsx`, `About.tsx`, `WhyChooseUs.tsx` gibi dosyalarda hata beklenir (henüz güncellenmediler) — bu adımda sadece `useTours.ts`/`useTours.test.ts` içinde yeni hata olmadığını gözle doğrula, tam yeşil olması Task 6 sonunda beklenir.

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useTours.ts src/hooks/useTours.test.ts
git commit -m "refactor: useTours hook'larından statik fallback'i kaldır, error state ekle"
```

---

### Task 2: `src/content/tours.ts` — statik `TOURS` dizisini ve `getTour`'u kaldır, sadece type'ları bırak

**Files:**
- Modify: `src/content/tours.ts`
- Modify: `src/content/tours.test.ts`

**Interfaces:**
- Consumes: yok (bu dosya en alt katman).
- Produces: `Localized<T>`, `TourSlug`, `ItineraryStep`, `DayPlan`, `TourStatus`, `MultiDayMeta`, `Tour` — type'lar aynı isim ve şekilde kalır. `TOURS`, `MULTI_DAY_TOURS`, `getTour`, `INCLUDED_RESTAURANT`, `INCLUDED_LUNCHBOX` **kaldırılır**.

- [ ] **Step 1: Testi güncelle — statik veri bütünlük testlerini kaldır**

`src/content/tours.test.ts` dosyasının tamamını sil (bu dosya yalnızca statik `TOURS`/`MULTI_DAY_TOURS` içeriğini doğruluyordu, DB'ye taşınan veri artık bu dosyada yok):

```bash
rm src/content/tours.test.ts
```

- [ ] **Step 2: `tours.ts`'i yeniden yaz — sadece type'lar ve `TourSlug` union kalsın**

`src/content/tours.ts` dosyasının tam içeriği:

```typescript
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
```

- [ ] **Step 3: Kalan referansları grep ile bul**

Run: `npx tsc --noEmit 2>&1 | grep -E "content/tours|content/multiDayTours|content/tourImages"`
Expected: `src/content/multiDayTours.ts`, `src/content/tourImages.ts`, `src/pages/admin/tours/ToursPanel.tsx`, `src/components/reservation/ReservationForm.tsx`, `src/pages/About.tsx`, `src/components/home/WhyChooseUs.tsx` içinde `TOURS`/`MULTI_DAY_TOURS`/`getTour` importlarına dair hatalar listelenir. Bu hatalar Task 3–6'da giderilecek.

- [ ] **Step 4: Commit**

```bash
git add src/content/tours.ts src/content/tours.test.ts
git commit -m "refactor: tours.ts'i yalnızca paylaşılan type tanımlarına indirge"
```

---

### Task 3: `src/content/multiDayTours.ts` ve `src/content/tourImages.ts` dosyalarını sil

**Files:**
- Delete: `src/content/multiDayTours.ts`
- Delete: `src/content/tourImages.ts`

**Interfaces:**
- Consumes: yok (bu dosyalar artık hiçbir yerden import edilmeyecek — Task 2 sonrası `tours.ts` bunları re-export etmiyor).
- Produces: yok.

- [ ] **Step 1: Dosyaların başka hiçbir yerden import edilmediğini doğrula**

Run: `grep -rn "content/multiDayTours\|content/tourImages" src/ --include="*.ts" --include="*.tsx"`
Expected: Hiçbir sonuç dönmemeli (Task 2 sonrası `tours.ts` bu dosyaları import etmiyor).

- [ ] **Step 2: Dosyaları sil**

```bash
rm src/content/multiDayTours.ts
rm src/content/tourImages.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A src/content/multiDayTours.ts src/content/tourImages.ts
git commit -m "chore: kullanılmayan statik tur içerik dosyalarını sil"
```

---

### Task 4: `ReservationForm.tsx` — statik `getTour` fallback'ini kaldır

**Files:**
- Modify: `src/components/reservation/ReservationForm.tsx`

**Interfaces:**
- Consumes: `useToursData()` artık `{ dayTours, multiDayTours, loading, error }` döner (Task 1).
- Produces: değişmedi (bileşen dışa bir şey export etmiyor).

- [ ] **Step 1: `getTour` import'unu ve kullanımını kaldır**

`src/components/reservation/ReservationForm.tsx:9` satırındaki import'u sil:

```typescript
// SİL:
import { getTour } from "@/content/tours";
```

`onSubmit` içindeki `tour` çözümlemesini (satır 36-38) güncelle:

```typescript
const tour = data.tourSlug
  ? dayTours.find((t) => t.slug === data.tourSlug)
  : undefined;
```

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit 2>&1 | grep ReservationForm`
Expected: Sonuç boş (bu dosyaya dair hata kalmamalı).

- [ ] **Step 3: Commit**

```bash
git add src/components/reservation/ReservationForm.tsx
git commit -m "refactor: ReservationForm'dan statik getTour fallback'ini kaldır"
```

---

### Task 5: `About.tsx` ve `WhyChooseUs.tsx` — statik `TOURS[0]` fallback'ini kaldır

**Files:**
- Modify: `src/pages/About.tsx`
- Modify: `src/components/home/WhyChooseUs.tsx`

**Interfaces:**
- Consumes: `useToursData()` → `{ dayTours, multiDayTours, loading, error }` (Task 1). DB'deki 3 day-tour kaydının (`kekova-classic`, `kekova-west`, `kekova-east`) `why_choose` alanı doludur (doğrulandı — bkz. spec), bu yüzden `dayTours.find((t) => t.whyChoose)` DB canlıyken her zaman bir sonuç bulur; boş sonuç sadece DB henüz yüklenmemişken (`loading`) olur.
- Produces: değişmedi.

- [ ] **Step 1: `About.tsx` — `TOURS` import'unu ve fallback'i kaldır**

`src/pages/About.tsx:4` satırındaki import'u sil:

```typescript
// SİL:
import { TOURS } from "@/content/tours";
```

`src/pages/About.tsx:11` ve `:14` satırlarını güncelle:

```typescript
const { dayTours, loading, error } = useToursData();

// First day tour that defines whyChoose.
const whyChoose = pick(dayTours.find((tour) => tour.whyChoose)?.whyChoose ?? { tr: [], en: [], fr: [], ru: [] });
```

"Why Choose Us" bölümüne (satır 84-101 civarı) yükleniyor/hata durumu ekle — `<SectionHeading ... />` ile `<ul>` arasına:

```tsx
{error && (
  <p className="mt-6 text-sm text-red-600">Turlar yüklenemedi, lütfen daha sonra tekrar deneyin.</p>
)}
{!error && !loading && whyChoose.length === 0 && null}
{!error && whyChoose.length > 0 && (
  <ul className="mt-6 grid gap-4">
    {whyChoose.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
          ✓
        </span>
        <span className="text-teal/80">{item}</span>
      </li>
    ))}
  </ul>
)}
```

(Bu, mevcut `<ul className="mt-6 grid gap-4">...</ul>` bloğunun tamamının yerini alır.)

- [ ] **Step 2: `WhyChooseUs.tsx` — `TOURS` import'unu ve fallback'i kaldır**

`src/components/home/WhyChooseUs.tsx` dosyasının tamamını güncelle:

```typescript
import { CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";

export function WhyChooseUs() {
  const { t, pick } = useLang();
  const { dayTours, error } = useToursData();
  const benefits = pick(
    dayTours.find((tour) => tour.whyChoose)?.whyChoose ?? { tr: [], en: [], fr: [], ru: [] },
  );

  if (error || benefits.length === 0) return null;

  return (
    <Section className="bg-sand">
      <SectionHeading
        title={t("whyChoose.title")}
        subtitle={t("whyChoose.subtitle")}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-teal/10 bg-white p-5 shadow-sm"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            <span className="text-sm leading-relaxed text-ink/80">{benefit}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

(Yükleniyor/hata anında bölüm tamamen gizlenir — anasayfada boş bir "Neden Biz" bloğu göstermemek için, `TourHighlights`'tan farklı olarak burada sessiz gizleme tercih edildi çünkü bu bölüm sayfanın ana içeriği değil, tamamlayıcı bir blok.)

- [ ] **Step 3: Tip kontrolü**

Run: `npx tsc --noEmit 2>&1 | grep -E "About.tsx|WhyChooseUs.tsx"`
Expected: Sonuç boş.

- [ ] **Step 4: Commit**

```bash
git add src/pages/About.tsx src/components/home/WhyChooseUs.tsx
git commit -m "refactor: About ve WhyChooseUs'tan statik TOURS[0] fallback'ini kaldır"
```

---

### Task 6: `TourHighlights.tsx` ve `Tours.tsx` — `loading`/`error` state'i göster

**Files:**
- Modify: `src/components/home/TourHighlights.tsx`
- Modify: `src/pages/Tours.tsx`

**Interfaces:**
- Consumes: `useToursData()` → `{ dayTours, multiDayTours, loading, error }` (Task 1).
- Produces: değişmedi.

- [ ] **Step 1: `TourHighlights.tsx` güncelle**

Dosyanın tamamı:

```tsx
import { Link } from "react-router-dom";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TourGrid } from "@/components/tours/TourGrid";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function TourHighlights() {
  const { t, localePath } = useLang();
  const { dayTours, multiDayTours, loading, error } = useToursData();

  if (error) {
    return (
      <Section>
        <p className="text-center text-sm text-red-600">
          Turlar yüklenemedi, lütfen daha sonra tekrar deneyin.
        </p>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Deneyimler"
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
        ) : (
          <TourGrid tours={dayTours} />
        )}
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          eyebrow="Ekspedisyonlar"
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
        ) : (
          <TourGrid tours={multiDayTours} />
        )}
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: `Tours.tsx` güncelle**

Dosyanın tamamı:

```tsx
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { TourGrid } from "@/components/tours/TourGrid";
import { CurrencyConverter } from "@/components/tours/CurrencyConverter";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";

export default function Tours() {
  const { t, pick, localePath } = useLang();
  const { dayTours, multiDayTours, loading, error } = useToursData();

  const allTours = [...dayTours, ...multiDayTours];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allTours.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.domain}${localePath(`${SEG.tours}/${tour.slug}`)}`,
      name: pick(tour.title),
    })),
  };

  return (
    <>
      <Seo title={t("tours.title")} description={t("tours.subtitle")} jsonLd={jsonLd} />
      {error ? (
        <Section>
          <p className="text-center text-sm text-red-600">
            Turlar yüklenemedi, lütfen daha sonra tekrar deneyin.
          </p>
        </Section>
      ) : (
        <>
          <Section>
            <SectionHeading
              title={t("tours.title")}
              subtitle={t("tours.subtitle")}
            />
            {loading ? (
              <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
            ) : (
              <TourGrid tours={dayTours} />
            )}
          </Section>
          <Section className="bg-foam/40">
            <SectionHeading
              title={t("tours.multiDayTitle")}
              subtitle={t("tours.multiDaySubtitle")}
            />
            {loading ? (
              <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
            ) : (
              <TourGrid tours={multiDayTours} />
            )}
          </Section>
        </>
      )}
      <Section>
        <CurrencyConverter />
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Tip kontrolü**

Run: `npx tsc --noEmit 2>&1 | grep -E "TourHighlights.tsx|pages/Tours.tsx"`
Expected: Sonuç boş.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TourHighlights.tsx src/pages/Tours.tsx
git commit -m "feat: TourHighlights ve Tours sayfalarında loading/error durumu göster"
```

---

### Task 7: `TourDetail.tsx` — `useTour` hook'unun yeni `error` alanını karşıla

**Files:**
- Modify: `src/pages/TourDetail.tsx`

**Interfaces:**
- Consumes: `useTour(slug)` → `{ tour, loading, error }` (Task 1).

- [ ] **Step 1: `error` dalını ekle**

`src/pages/TourDetail.tsx:20-38` bloğunu güncelle. Mevcut hali:

```tsx
  const { tour, loading } = useTour(slug);

  if (!tour) {
    if (loading) {
      return (
        <Section>
          <p className="text-lg text-ink/70">{t("common.loading")}</p>
        </Section>
      );
    }
    return (
      <Section>
        <p className="text-lg text-ink/70">Tour not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={localePath(SEG.tours)}>{t("nav.tours")}</Link>
        </Button>
      </Section>
    );
  }
```

Yeni hali:

```tsx
  const { tour, loading, error } = useTour(slug);

  if (!tour) {
    if (loading) {
      return (
        <Section>
          <p className="text-lg text-ink/70">{t("common.loading")}</p>
        </Section>
      );
    }
    if (error) {
      return (
        <Section>
          <p className="text-lg text-red-600">
            Tur yüklenemedi, lütfen daha sonra tekrar deneyin.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to={localePath(SEG.tours)}>{t("nav.tours")}</Link>
          </Button>
        </Section>
      );
    }
    return (
      <Section>
        <p className="text-lg text-ink/70">Tour not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={localePath(SEG.tours)}>{t("nav.tours")}</Link>
        </Button>
      </Section>
    );
  }
```

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit 2>&1 | grep TourDetail`
Expected: Sonuç boş.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TourDetail.tsx
git commit -m "feat: tur detay sayfasında DB hata durumunu göster"
```

---

### Task 8: Admin panel — "Statik turları içe aktar" butonunu kaldır

**Files:**
- Modify: `src/pages/admin/tours/ToursPanel.tsx`

**Interfaces:**
- Consumes: `fetchAllTours`, `saveTour`, `deleteTour` (değişmedi — `useTours.ts`'de kaldı). `importStaticTours` artık export edilmiyor (Task 1, Step 7).

- [ ] **Step 1: `importStaticTours` import'unu ve `handleImport` fonksiyonunu kaldır**

`src/pages/admin/tours/ToursPanel.tsx:1-10` içindeki import'u güncelle:

```typescript
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteTour,
  fetchAllTours,
  saveTour,
  type TourInput,
  type TourRow,
} from "@/hooks/useTours";
```

`importing` state'ini (satır 26) ve `handleImport` fonksiyonunu (satır 89-108) tamamen sil:

```typescript
// SİL:
// const [importing, setImporting] = useState(false);
//
// const handleImport = async () => {
//   ...
// };
```

- [ ] **Step 2: `AdminSurface`'in `actions` prop'undaki butonu kaldır**

Satır 130-142 civarındaki `<AdminSurface ... actions={...}>` bloğunu güncelle:

```tsx
<AdminSurface
  title="Turlar"
  description="Sitede görünen sıra, her bölüm içinde 'Sıra' değerine göredir."
>
```

- [ ] **Step 3: Boş-liste mesajını güncelle**

Satır 146-150 civarındaki `AdminEmptyState`'i güncelle:

```tsx
{!loading && rows.length === 0 && (
  <AdminEmptyState
    title="Panelde henüz tur yok"
    description="Yukarıdaki 'Yeni tur' formunu kullanarak ilk turu ekleyebilirsiniz."
  />
)}
```

- [ ] **Step 4: Tip kontrolü**

Run: `npx tsc --noEmit 2>&1 | grep ToursPanel`
Expected: Sonuç boş.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/tours/ToursPanel.tsx
git commit -m "chore: admin panelinden statik tur içe aktarma özelliğini kaldır"
```

---

### Task 9: Tam doğrulama — build, test, manuel kontrol

**Files:** yok (yalnızca doğrulama).

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `npx vitest run`
Expected: Tüm test dosyaları PASS. Hiçbir dosya `content/tours.ts`'ten `TOURS`/`MULTI_DAY_TOURS`/`getTour` import etmemeli.

- [ ] **Step 2: Kalan referansları son kez tara**

Run: `grep -rn "STATIC_TOURS_DATA\|importStaticTours\|from \"@/content/multiDayTours\"\|from \"@/content/tourImages\"" src/`
Expected: Sonuç boş.

Run: `grep -rn "TOURS\[0\]\|import.*TOURS.*from \"@/content/tours\"\|import.*MULTI_DAY_TOURS" src/`
Expected: Sonuç boş.

- [ ] **Step 3: Tam TypeScript build**

Run: `npx tsc --noEmit`
Expected: Hatasız (exit 0).

- [ ] **Step 4: Vite production build**

Run: `npm run build`
Expected: Build başarıyla tamamlanır, hata vermez.

- [ ] **Step 5: Dev sunucusunu başlat, manuel doğrula**

Run: `npm run dev` (arka planda)

Tarayıcıda ana sayfayı ve `/tours` sayfasını aç:
- "Çok Günlü Ekspedisyonlar" bölümündeki 6 kartın tamamında gerçek fotoğraf görünmeli (yeşil boş gradient olmamalı).
- "Neden Biz" bölümü DB'den gelen içerikle doluyor.
- Rezervasyon formundaki tur seçim listesi DB'deki günübirlik turları gösteriyor.
- Admin panelinde `/admin` → Turlar sekmesinde "Statik turları içe aktar" butonu artık yok.

- [ ] **Step 6: Dev sunucusunu durdur**

Manuel doğrulama tamamlandıktan sonra arka plan sürecini sonlandır.

- [ ] **Step 7: Son commit (varsa kalan ufak düzeltmeler)**

```bash
git status
git add -A
git commit -m "chore: tours DB-only geçişi sonrası son temizlik" --allow-empty
```

(Eğer Step 1-6 sırasında ek bir düzeltme yapılmadıysa bu adım atlanır — `--allow-empty` yalnızca commit zinciri tutarlılığı için, gerçek bir değişiklik yoksa commit atılmaz.)

---

## Spec Coverage Kontrolü

- [x] Statik fallback kaldırma → Task 1
- [x] `error` state ile hata gösterimi → Task 1, 6, 7
- [x] Tüketen bileşenlerin güncellenmesi (TourHighlights, Tours, About, WhyChooseUs, ReservationForm) → Task 4, 5, 6
- [x] Tur detay sayfası → Task 7
- [x] `tours.ts`'te type'ların korunması → Task 2
- [x] `multiDayTours.ts`/`tourImages.ts` silinmesi → Task 3
- [x] Test dosyalarının güncellenmesi → Task 1 (useTours.test.ts), Task 2 (tours.test.ts silme)
- [x] Admin panel "içe aktar" butonunun kaldırılması → Task 8
- [x] Build/test doğrulaması → Task 9
