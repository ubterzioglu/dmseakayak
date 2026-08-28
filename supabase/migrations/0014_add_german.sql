-- Adds German (de) as the fifth site language.
--
-- The public site and the tour content need no schema change: tours stores its
-- translatable fields as schemaless jsonb keyed by language, so 'de' just
-- becomes another key. What *is* pinned to the four original languages are the
-- check constraints on reviews.source_lang and review_translations.lang, plus
-- the per-language gallery caption columns.
--
-- The original constraints in 0004 were declared inline and therefore carry
-- Postgres-generated names. Rather than guess them, drop whatever check
-- constraint currently governs each column and recreate it under an explicit
-- name, so the next language addition has something predictable to target.

-- ─── reviews.source_lang ───────────────────────────────────────────────────────
do $$
declare
  con_name text;
begin
  for con_name in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any (c.conkey)
    where c.conrelid = 'public.reviews'::regclass
      and c.contype = 'c'
      and a.attname = 'source_lang'
  loop
    execute format('alter table public.reviews drop constraint %I', con_name);
  end loop;
end $$;

alter table public.reviews
  add constraint reviews_source_lang_check
  check (source_lang in ('tr','en','fr','ru','de'));

-- ─── review_translations.lang ──────────────────────────────────────────────────
do $$
declare
  con_name text;
begin
  for con_name in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any (c.conkey)
    where c.conrelid = 'public.review_translations'::regclass
      and c.contype = 'c'
      and a.attname = 'lang'
  loop
    execute format('alter table public.review_translations drop constraint %I', con_name);
  end loop;
end $$;

alter table public.review_translations
  add constraint review_translations_lang_check
  check (lang in ('tr','en','fr','ru','de'));

-- ─── gallery captions ──────────────────────────────────────────────────────────
-- Follows 0005: the base `caption` column holds Turkish, one nullable column
-- per additional language, filled in by hand from the gallery panel. Null falls
-- back at render time.
alter table public.gallery_images
  add column if not exists caption_de text;
