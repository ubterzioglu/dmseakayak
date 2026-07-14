# SEO/GEO Improvements + Site Launch — Design

Date: 2026-07-14
Status: Approved for planning

## Context

`dmseakayak` (Dragoman SeaKayak) already has a mature SEO foundation: a shared
`Seo.tsx` (react-helmet-async) component used on all 11 routes, hreflang
alternates across tr/en/fr/ru, canonical URLs, OG/Twitter tags, JSON-LD
(`SportsActivityLocation`, `TouristTrip`, `BreadcrumbList`, `FAQPage`,
`AggregateRating`/`Review`), geo meta tags, and a sitemap generator script.

Two things hold it back from being effective:

1. **The site isn't live.** Everything is staged under `/mvp`
   (`src/lib/site.ts` `BASE_PATH`), `robots.txt` disallows `/mvp`, and
   `sitemap.xml` lists only the root "Coming Soon" placeholder. Nothing is
   indexable today.
2. **i18n bugs undermine the multi-language SEO investment.** Hardcoded
   Turkish strings leak into every locale (component labels, error/loading
   states, and — highest impact — every WhatsApp booking CTA), and one
   content block (`about.storyBody`) is materially shorter/thinner in
   en/fr/ru than in tr, losing trust signals (agency license number, TSSF
   registration, founding year) that matter for both classic SEO E-E-A-T and
   GEO (AI answer engines reward concrete, verifiable facts).

This work makes the site live and indexable, closes the i18n gaps that leak
Turkish into other locales, and adds the remaining GEO-specific surface
(`llms.txt`; the two schema types that already exist are extended to more
pages rather than built from scratch).

Several small, independent copy/config fixes reported during research were
already applied directly (see "Already completed" below) since they were
unambiguous single-file changes with no design implications.

## Already completed (this session, before this doc)

- Fixed hardcoded Turkish eyebrows ("Deneyimler", "Ekspedisyonlar") in
  `TourHighlights.tsx` — now `t("tours.eyebrow")` / `t("tours.multiDayEyebrow")`.
- Fixed hardcoded loading/error strings in `TourHighlights.tsx`, `Tours.tsx`,
  `TourDetail.tsx`, `About.tsx` — now `t("common.loading")`,
  `t("tours.loadError")`, `t("tour.loadError")`, `t("tour.notFound")`.
- Changed tr-only `tours.multiDayTitle` from "Çok Günlü Ekspedisyonlar" to
  "Çok Günlü Turlar" (other locales unchanged).
- Added `subtitleClassName` prop to `SectionHeading`; applied
  `whitespace-nowrap` to the multi-day tours subtitle so it renders on one
  line.
- Corrected the Instagram URL sitewide (`src/lib/site.ts` and the
  organization JSON-LD in `index.html`) to
  `https://www.instagram.com/dragomandivingandoutdoors/`.
- Added a "Search Console" quick-link to the admin panel header
  (`src/pages/admin/AdminPage.tsx` `QUICK_LINKS`), pointing to
  `https://search.google.com/search-console?resource_id=sc-domain:dragomanseakayak.com`.

## Decisions (confirmed with user)

- **Launch now.** Flip `BASE_PATH` from `"/mvp"` to `""`, update
  `robots.txt` to drop the `/mvp` disallow, regenerate `sitemap.xml` with
  the full localized URL set. The site goes live at the domain root.
- **Footer ad-swap links stay as-is, untranslated.** The Turkish links in
  `Footer.tsx` (chatio.com.tr, spindorai.com, ufuksoynakliyat.com.tr) are
  left exactly as they are — not translated, not removed. Likely a
  reciprocal-link arrangement outside this task's scope.
- **WhatsApp CTA messages become locale-aware.** `buildWhatsappLink()` gets
  a `lang` parameter; every "Book now" / WhatsApp touchpoint sends a
  pre-filled message in the visitor's active locale instead of always
  Turkish.
- **ComingSoon page: no fix needed, verify it's unreachable.** Once
  `BASE_PATH` is live, the `/mvp` fallback in `App.tsx` won't route there
  for real traffic. Leave `ComingSoon.tsx` as dead code (not deleted, not
  translated) and confirm no route reaches it post-launch.
- **`about.storyBody` gets full parity across locales.** Translate the
  complete Turkish story (TÜRSAB license A4615, TSSF registration, 2002
  founding date, "Biz Kimiz?" sub-heading structure) into en/fr/ru so all
  four locales carry the same trust signals and the same
  paragraph/heading rendering structure in `About.tsx`.
- **URL slugs stay Turkish for every locale** (`/en/turlar`, not
  `/en/tours`). Documented as a deliberate scope cut, not an oversight —
  revisit only if the client asks later. Low priority since hreflang
  already correctly declares language per URL regardless of slug language.
- **GEO additions:** add `llms.txt`. FAQPage and AggregateRating/Review
  JSON-LD already exist (Faq.tsx, Reviews.tsx) — extend AggregateRating
  onto Home and TourDetail rather than building new schema.

## Scope

### 1. Launch activation
- `src/lib/site.ts`: `BASE_PATH = ""`.
- `public/robots.txt`: remove `Disallow: /mvp` and its staging comment.
- Run `scripts/generate-sitemap.mjs` to regenerate `public/sitemap.xml`
  with the full locale × page × tour-slug URL set (already root-based per
  the script's existing design).
- Smoke-check all 11 routes × 4 locales resolve at the root path, and that
  `/admin` still works (mounted outside `BASE_PATH`, unaffected).
- Confirm `ComingSoon` is unreachable via the live route tree (App.tsx's
  catch-all now resolves through `SiteLayout`, not the placeholder).

### 2. i18n fixes (remaining, from the audit)
- **`src/lib/whatsapp.ts`**: add a `lang: Locale` parameter to
  `buildWhatsappLink()`; replace the 5 hardcoded Turkish lines with new
  i18n keys (`whatsapp.greeting`, `whatsapp.tour`, `whatsapp.date`,
  `whatsapp.partySize`, `whatsapp.name`, `whatsapp.closing`) added to all 4
  locale files. Update every call site (ReservationForm, TourDetail,
  Contact, CustomTours, TrakExperience, Hero) to pass the active locale.
- **`src/hooks/useTours.ts`**: replace the 3 hardcoded Turkish
  thrown-error/fallback strings with i18n-safe equivalents (or leave as
  internal error codes since they're not currently rendered directly —
  decide during implementation based on whether `error.message` is ever
  surfaced to users).
- **`src/components/layout/ScrollToTop.tsx`**: `aria-label="Yukarı çık"` →
  `t("common.scrollToTop")` (new key, all 4 locales).
- **`src/pages/Contact.tsx`**: iframe `title="Dragoman SeaKayak — Kaş
  haritası"` → `t("contact.mapTitle")` (new key, all 4 locales).
- **`src/components/ui/confirm-dialog.tsx`**: hardcoded Turkish defaults
  (`confirmLabel`, `cancelLabel`, "Lütfen bekleyin...") — verify all call
  sites are admin-only; if so, this is acceptable as Turkish-only admin UI
  and out of scope. If any call site is user-facing, localize it.
- **`src/i18n/locales/{en,fr,ru}/common.json`**: replace `about.storyBody`
  with a full translation matching the Turkish structure (see Decisions).
- **Minor/optional polish** (include if time allows, low risk):
  `Lightbox.tsx` aria-labels ("Close"/"Previous"/"Next") → `t()`.

### 3. GEO additions
- **`public/llms.txt`**: plain-text summary for AI crawlers — company
  description, service area (Kekova/Kaş/Kalkan/Antalya), tour categories
  and links, contact info, languages served. Follows the emerging
  llms.txt convention (structured Markdown-ish sections, not JSON-LD).
- **AggregateRating on Home and TourDetail**: pull the same aggregate
  calculation Reviews.tsx already does (`fetchPublishedReviewsLocalized`)
  and fold an `aggregateRating` block into the existing `SportsActivityLocation`
  (Home) and `TouristTrip` (TourDetail) JSON-LD objects, so rich results
  aren't gated behind a visit to `/yorumlar`.
- **Fix the `GOOGLE_REVIEW_URL` TODO** in `Reviews.tsx` (line 13–14) —
  currently a generic Maps search query placeholder; needs the real Google
  Business Profile review link. Flag for the user to provide if not
  already available.

## Out of scope (explicitly deferred)

- URL slug localization per language.
- Removing/translating the Footer ad-swap links.
- SSR/prerendering for the SPA (larger architectural change; noted as a
  future GEO consideration since some AI crawlers don't execute JS, but not
  part of this pass).
- Full alt-text/image-optimization audit beyond what's touched incidentally.

## Testing

- `npx tsc -b --noEmit` clean.
- Manual check: all 4 locales' WhatsApp links produce correctly-localized
  pre-filled messages (one spot-check per locale).
- Manual check: sitemap.xml validates (well-formed XML, all expected URLs
  present) after regeneration.
- Manual check: robots.txt no longer blocks any real route; verify with
  Google's robots.txt tester syntax rules.
- Visual check: About page renders the new en/fr/ru storyBody with the
  same paragraph/heading structure as the Turkish version.
