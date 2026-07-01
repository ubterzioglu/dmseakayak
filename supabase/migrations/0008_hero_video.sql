-- Admin-managed hero video: the autoplaying background video on the homepage
-- hero section. Single active row model (unlike gallery/blog which are lists) —
-- admin uploads a replacement, its row overwrites the previous one. Auth model
-- matches 0002/0003: anonymous visitors read; only authenticated admins write.

-- ─── hero_video ─────────────────────────────────────────────────────────────────
create table if not exists public.hero_video (
  id          uuid primary key default gen_random_uuid(),
  video_url   text not null,
  updated_at  timestamptz not null default now()
);
alter table public.hero_video enable row level security;

drop policy if exists "anon read hero video" on public.hero_video;
drop policy if exists "auth all hero video" on public.hero_video;

create policy "anon read hero video" on public.hero_video
  for select to anon, authenticated using (true);
create policy "auth all hero video" on public.hero_video
  for all to authenticated using (true) with check (true);

-- ─── hero-video storage bucket ──────────────────────────────────────────────────
-- Public read; only authenticated admins upload/delete. file_size_limit matches
-- the Supabase free plan's global 50MB cap — a bucket limit can be lower than
-- the project-wide limit but never higher, so this documents the ceiling
-- explicitly and gives a clear server-side error if the client check is bypassed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-video',
  'hero-video',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime'];

drop policy if exists "public read hero video" on storage.objects;
drop policy if exists "auth write hero video" on storage.objects;

create policy "public read hero video" on storage.objects
  for select to anon, authenticated using (bucket_id = 'hero-video');
create policy "auth write hero video" on storage.objects
  for all to authenticated using (bucket_id = 'hero-video') with check (bucket_id = 'hero-video');
