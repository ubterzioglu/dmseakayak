-- Disable the admin-managed hero video feature to stop Supabase Storage egress.
-- The public site now uses the bundled /videos/heronew.mp4 asset instead.

delete from public.hero_video;

drop policy if exists "public read hero video" on storage.objects;
drop policy if exists "auth write hero video" on storage.objects;

update storage.buckets
set
  public = false,
  file_size_limit = 1048576
where id = 'hero-video';
