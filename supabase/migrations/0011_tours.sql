-- Admin-managed tours: full CRUD for day tours and multi-day expeditions.
-- Auth model (matches 0002/0003): anonymous visitors read PUBLISHED tours only;
-- authenticated admins manage everything. Localized ({tr,en,fr,ru}) and nested
-- content is stored as jsonb mirroring the Tour interface in src/content/tours.ts;
-- scalar fields used for listing/sorting are flat columns.

-- ─── tours ──────────────────────────────────────────────────────────────────────
create table if not exists public.tours (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  published            boolean not null default true,
  sort_order           integer not null default 0,
  is_multi_day         boolean not null default false,
  level                text not null default 'beginner',  -- 'beginner' | 'intermediate-advanced'
  price_eur            numeric,
  price_with_meal_eur  numeric,
  price_from_kalkan_eur numeric,
  distance_km          numeric,
  hiking_km            numeric,
  departure            text,
  arrival              text,
  route_stops          jsonb,           -- string[]
  hero_image           text,
  gallery              jsonb,           -- string[]
  title                jsonb not null,  -- Localized<string>
  tagline              jsonb not null,  -- Localized<string>
  description          jsonb,           -- Localized<string>
  highlights           jsonb,           -- Localized<string[]>
  included             jsonb,           -- Localized<string[]>
  why_choose           jsonb,           -- Localized<string[]>
  itinerary            jsonb,           -- Localized<ItineraryStep[]>
  multi_day            jsonb,           -- MultiDayMeta (dayByDay, status, externalDetailPath, ...)
  created_at           timestamptz not null default now()
);
alter table public.tours enable row level security;

drop policy if exists "anon read published tours" on public.tours;
drop policy if exists "auth all tours" on public.tours;

create policy "anon read published tours" on public.tours
  for select to anon using (published = true);
create policy "auth all tours" on public.tours
  for all to authenticated using (true) with check (true);

create index if not exists tours_sort_idx
  on public.tours (sort_order asc, created_at desc);

-- ─── tour-images storage bucket ─────────────────────────────────────────────────
-- Public read; only authenticated admins upload/delete. Bundled images keep
-- their /images/tours/... public paths; admin uploads land here instead.
insert into storage.buckets (id, name, public)
values ('tour-images','tour-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read tour images" on storage.objects;
drop policy if exists "auth write tour images" on storage.objects;

create policy "public read tour images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'tour-images');
create policy "auth write tour images" on storage.objects
  for all to authenticated using (bucket_id = 'tour-images') with check (bucket_id = 'tour-images');
