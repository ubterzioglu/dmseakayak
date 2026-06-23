# Multi-Day Tour Cards — Design Spec

**Date:** 2026-06-23
**Source content:** `multidaystours.md`
**Goal:** Add tour cards for the multi-day expeditions (and the TRAK private session) described in `multidaystours.md`, rendered on both the Tours page and the home page, in all four site languages (TR/EN/FR/RU), without breaking the three existing single-day Kekova tours.

---

## 1. Context

The site is a React + Vite + TypeScript + Tailwind SPA. Tour data lives in `src/content/tours.ts` as a `TOURS: Tour[]` array. The current `Tour` interface is shaped for **single-day** tours:

- required `distanceKm`, `departure`, `arrival`, `priceEur` (small per-day price);
- `slug` is a fixed union `TourSlug = "kekova-classic" | "kekova-west" | "kekova-east"`;
- `itinerary` is an icon-stepped same-day sequence (`ItineraryStep[]`).

Rendering chain:
- `src/components/home/TourHighlights.tsx` (home) → `TourGrid` → `TourCard`.
- `src/pages/Tours.tsx` (tours page) → `TourGrid` → `TourCard`.
- `src/pages/TourDetail.tsx` ("View details" target), via `getTour(slug)`.
- Labels in `src/i18n/locales/{tr,en,fr,ru}/common.json` (`common.*`, `tours.*`). `common.duration` already exists; most multi-day labels do not.

Multi-day tours carry different facts: a **duration (days/nights)**, a **per-person package price** (e.g. 2090€), **fixed departure dates**, **separate included + not-included sections**, and a **day-by-day itinerary** (Day 1, Day 2…). The design extends the model to carry these without disturbing day tours.

## 2. Tours to build (decisions confirmed)

| Tour | Source | Status | Price | Notes |
|------|--------|--------|-------|-------|
| 7-Day Mediterranean Adventure | full 7-day | draft (no price/dates in doc) | On request | Day-by-day present (Day 1–7) |
| Coast of Light (4 days) | draft | draft | On request | Sparse day notes |
| Kekova Sound (2 days) | draft | draft | On request | Has internal cost breakdown (700€) — **never displayed** (it's cost, not selling price) |
| Lycian Kayak & Comfort Escape (7 days) | FINAL | final | 2090€ pp (single supp. +500€) | Full day-by-day, dates, included/not-included, destination guide |
| Carian Shore (1 week) | draft | draft | On request | **Intro only** — no itinerary; card shows intro + "itinerary coming soon" |
| TRAK Signature Experience | full | special | Private session (no pp price) | Already has a dedicated page (`TrakExperience.tsx`); card links there |

Confirmed choices:
- **Scope:** all five multi-day tours **+** TRAK Signature.
- **Drafts:** build with whatever content exists; flag `status:'draft'`; show price as **"On request"** when missing; Carian Shore renders intro + "itinerary coming soon".
- **Internal costs never shown.** Kekova Sound price = "On request".
- **Placement:** both the Tours page and the home page.
- **Languages:** full TR/EN/FR/RU.

## 3. Data model — extend `Tour`, add a parallel array

In `src/content/tours.ts`:

1. **Widen `TourSlug`** to add: `"7day-mediterranean" | "coast-of-light" | "kekova-sound" | "lycian-comfort-escape" | "carian-shore" | "trak-signature"`.

2. **Make day-only fields optional** on `Tour` so multi-day entries need not supply them:
   - `distanceKm?`, `departure?`, `arrival?`, `priceEur?` become optional.
   - `routeStops`, `included`, `itinerary` (icon-step) become optional (multi-day uses `dayByDay` instead; TRAK uses a custom shape).
   - This is safe: the three day tours still provide all of them.

3. **Add an optional `multiDay` block:**

   ```ts
   export interface DayPlan {
     day: number;            // 1-based; 0 or omitted allowed for non-day notes
     title: string;
     body: string;
     distance?: string;      // free text e.g. "15 km" / "8.5 miles"
   }

   export type TourStatus = "final" | "draft" | "special";

   export interface MultiDayMeta {
     durationDays: number;
     nights: number;
     pricePerPersonEur?: number;        // omitted => "On request"
     singleSupplementEur?: number;
     groupSize?: Localized<string>;     // "min 6, max 12"
     dates?: string[];                  // ["22-29 May 2026", ...] (language-agnostic)
     dayByDay?: Localized<DayPlan[]>;   // omitted (Carian) => "itinerary coming soon"
     notIncluded?: Localized<string[]>;
     status: TourStatus;
     /** When set, "View details" links to this internal route instead of the generated detail page (TRAK). */
     externalDetailPath?: string;
   }
   ```

   Add `multiDay?: MultiDayMeta;` to `Tour`. Add `description?: Localized<string>;` for the long intro paragraph (used by detail page + Carian card).

4. **New array** `export const MULTI_DAY_TOURS: Tour[]` with the six entries. `getTour` searches both `TOURS` and `MULTI_DAY_TOURS`.

5. **Pricing helper:** `priceLabel(tour, t)` returns either `from €X / per person` (day tours via `priceEur`, multi-day via `multiDay.pricePerPersonEur`) or the localized **"On request"** string when no price. TRAK shows the localized **"Private session"** label.

## 4. Rendering — branch on `multiDay`, one card component

`TourCard` and `TourDetail` already receive a full `Tour`. They branch on `tour.multiDay`:

- **Card meta row (multi-day):** show **"7 days / 6 nights"** (`Calendar` icon) and the price label, instead of distance + departure time. Add a small **status badge** for drafts (e.g. "Draft" / localized) and "Private" for TRAK. Day tours render unchanged.
- **Card "View details":** for TRAK, link to `multiDay.externalDetailPath` (the existing TRAK page); otherwise the normal `localePath(tours/<slug>)`.
- **Detail page (multi-day):** hero meta shows duration + price + dates; body renders:
  - long `description` paragraph (if present),
  - **highlights**,
  - **day-by-day** list (`DayPlan[]`) — each as "Day N — title" + body + optional distance; if `dayByDay` absent (Carian), render a localized "Detailed itinerary coming soon" note,
  - **included** and **not-included** sections,
  - CTA (book / WhatsApp) as today.
- **JSON-LD:** keep `TouristTrip`; price omitted when "On request".

`TourGrid` is unchanged (it maps any `Tour[]`). A single grid can mix day and multi-day cards because the card self-branches.

## 5. Placement

- **Tours page** (`src/pages/Tours.tsx`): add a second section under the existing one — `SectionHeading title={t("tours.multiDayTitle")}` + `<TourGrid tours={MULTI_DAY_TOURS} />`.
- **Home page** (`src/components/home/TourHighlights.tsx`): add a "Multi-Day Expeditions" block after the day-tour grid (or a compact subset). Keep the existing day-tour highlights intact.

## 6. i18n

Add to all four `common.json` (`common.*` unless noted):
- `days`, `nights`, `dates`, `notIncluded`, `groupSize`, `singleSupplement`, `onRequest`, `privateSession`, `comingSoonItinerary`, `draft`.
- `tours.multiDayTitle`, `tours.multiDaySubtitle`.

`common.duration` already exists — reuse it. All tour **content** (titles, taglines, descriptions, day-by-day, highlights, included, not-included) lives in `tours.ts` in all four languages. Existing keys `common.from`, `common.perPerson`, `common.included`, `common.highlights`, `common.route`, `common.bookNow`, `common.askQuestion`, `common.viewDetails` are reused.

## 7. Out of scope

- No new hero images are generated; `heroImage` paths point to `/images/tours/<slug>.jpg` and degrade gracefully (existing `onError` hides broken images).
- No reservation-form changes (multi-day booking still routes through the existing contact/WhatsApp flow).
- No redesign of the day tours or the TRAK page itself.
- Carian Shore's missing itinerary is **not** invented — only the supplied intro is used.

## 8. Verification

- `npm run build` (`tsc -b && vite build`) clean — type changes compile, no required-field regressions on day tours.
- `npm run preview`: `/tr` and `/en` tours page show both day and multi-day sections; `/tr/turlar/lycian-comfort-escape` renders day-by-day, dates, not-included; TRAK card links to the TRAK page; draft tours show "On request" and no internal cost figures.
- Spot-check all four languages on one multi-day card.
