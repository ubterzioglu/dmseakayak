-- Admin-managed gallery: photos + captions shown on the public /galeri page.
-- Auth model (matches 0002): anonymous visitors read PUBLISHED images only;
-- authenticated admins manage everything. Images live in the gallery-images bucket.

-- ─── gallery_images ─────────────────────────────────────────────────────────────
create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  caption     text,
  alt         text,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.gallery_images enable row level security;

drop policy if exists "anon read published gallery" on public.gallery_images;
drop policy if exists "auth all gallery" on public.gallery_images;

create policy "anon read published gallery" on public.gallery_images
  for select to anon using (published = true);
create policy "auth all gallery" on public.gallery_images
  for all to authenticated using (true) with check (true);

create index if not exists gallery_images_sort_idx
  on public.gallery_images (sort_order asc, created_at desc);

-- ─── gallery-images storage bucket ──────────────────────────────────────────────
-- Public read; only authenticated admins upload/delete.
insert into storage.buckets (id, name, public)
values ('gallery-images','gallery-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read gallery images" on storage.objects;
drop policy if exists "auth write gallery images" on storage.objects;

create policy "public read gallery images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery-images');
create policy "auth write gallery images" on storage.objects
  for all to authenticated using (bucket_id = 'gallery-images') with check (bucket_id = 'gallery-images');
