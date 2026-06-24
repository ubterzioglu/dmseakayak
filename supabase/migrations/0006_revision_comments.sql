-- Threaded comments on revision requests (admin-only discussion under each
-- internal change request). Mirrors the auth model of revision_requests:
-- fully admin-managed, no anon access.

create table if not exists public.revision_comments (
  id          uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);
alter table public.revision_comments enable row level security;

drop policy if exists "auth all rev comments" on public.revision_comments;

create policy "auth all rev comments" on public.revision_comments
  for all to authenticated using (true) with check (true);

create index if not exists revision_comments_revision_idx
  on public.revision_comments (revision_id, created_at asc);
