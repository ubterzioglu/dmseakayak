-- Threaded comments on the static "Genel Durum Raporu" items (admin-only
-- discussion under each outstanding-item card in the Revizyonlar panel).
-- The report items are hardcoded in src/pages/admin/GeneralStatusReport.tsx,
-- not DB rows, so comments hang off a stable text `topic` key (e.g. 'osi-1',
-- 'elif-1') instead of a foreign key. Same auth model as revision_comments:
-- fully admin-managed, no anon access.

create table if not exists public.report_comments (
  id          uuid primary key default gen_random_uuid(),
  topic       text not null,                                   -- stable item key, e.g. 'osi-1'
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);
alter table public.report_comments enable row level security;

drop policy if exists "auth all report comments" on public.report_comments;

create policy "auth all report comments" on public.report_comments
  for all to authenticated using (true) with check (true);

create index if not exists report_comments_topic_idx
  on public.report_comments (topic, created_at asc);
