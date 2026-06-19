#!/usr/bin/env bash
# =============================================================================
# Dragoman SeaKayak — Supabase şema kurulumu (idempotent)
#
# Bu script, Supabase Management API üzerinden SQL/DDL çalıştırarak:
#   - revision_requests tablosu + RLS
#   - blog_posts tablosu + RLS
#   - blog-images storage bucket + storage RLS
# oluşturur. Tekrar çalıştırılması güvenlidir (create if not exists / on conflict).
#
# Değerleri .env.local'den okur — secret içermez, repo'da kalabilir.
# Kullanım:  bash scripts/setup-supabase.sh
# =============================================================================
set -euo pipefail

# --- .env.local yükle (proje kökünden) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "HATA: $ENV_FILE bulunamadı." >&2
  exit 1
fi
set -a; . "$ENV_FILE"; set +a

: "${SB_PROJECT_URL:?SB_PROJECT_URL gerekli}"
: "${SB_ACCESS_TOKEN:?SB_ACCESS_TOKEN gerekli}"

PROJECT_REF="$(echo "$SB_PROJECT_URL" | sed -E 's#https://([a-z0-9]+)\.supabase\.co.*#\1#')"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"

# --- SQL'i Management API ile çalıştıran yardımcı ---
run_sql() {
  local sql="$1"
  local payload
  payload="$(printf '%s' "$sql" | python -c 'import json,sys; print(json.dumps({"query": sys.stdin.read()}))')"
  local resp code
  resp="$(curl -s -w $'\n%{http_code}' -X POST "$API" \
    -H "Authorization: Bearer ${SB_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload")"
  code="$(printf '%s' "$resp" | tail -n1)"
  body="$(printf '%s' "$resp" | sed '$d')"
  if [[ "$code" != "200" && "$code" != "201" ]]; then
    echo "  ✗ SQL hatası (HTTP $code): $body" >&2
    return 1
  fi
  echo "  ✓ OK (HTTP $code)"
}

echo "Proje: ${PROJECT_REF}.supabase.co"
echo ""

# ----------------------------------------------------------------------------
echo "[1/3] revision_requests tablosu + RLS..."
run_sql "
create table if not exists public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  requester text not null,
  body text not null,
  urgency smallint not null check (urgency between 1 and 10),
  status text not null default 'open' check (status in ('open','progress','done')),
  created_at timestamptz not null default now()
);
alter table public.revision_requests enable row level security;

drop policy if exists \"anon insert rev\" on public.revision_requests;
drop policy if exists \"anon select rev\" on public.revision_requests;
drop policy if exists \"anon update rev\" on public.revision_requests;
drop policy if exists \"anon delete rev\" on public.revision_requests;

create policy \"anon insert rev\" on public.revision_requests for insert to anon with check (true);
create policy \"anon select rev\" on public.revision_requests for select to anon using (true);
create policy \"anon update rev\" on public.revision_requests for update to anon using (true) with check (true);
create policy \"anon delete rev\" on public.revision_requests for delete to anon using (true);
"

# ----------------------------------------------------------------------------
echo "[2/3] blog_posts tablosu + RLS..."
run_sql "
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content_html text not null,
  cover_image_url text,
  excerpt text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;

drop policy if exists \"public read published\" on public.blog_posts;
drop policy if exists \"anon full blog\" on public.blog_posts;
drop policy if exists \"anon read published\" on public.blog_posts;
drop policy if exists \"anon insert blog\" on public.blog_posts;
drop policy if exists \"anon update blog\" on public.blog_posts;
drop policy if exists \"anon delete blog\" on public.blog_posts;

-- KRİTİK: anon (hem ziyaretçi hem client-şifreli admin) SELECT'te YALNIZCA published görür.
-- Bu yüzden 'taslak' şimdilik desteklenmez (admin de taslakları listeleyemez).
-- Yazma işlemleri anon'a açık (admin client-şifre ile yazar). Auth gelince (Bölüm 4) sıkılaştırılacak.
create policy \"anon read published\" on public.blog_posts for select to anon using (published = true);
create policy \"anon insert blog\" on public.blog_posts for insert to anon with check (true);
create policy \"anon update blog\" on public.blog_posts for update to anon using (true) with check (true);
create policy \"anon delete blog\" on public.blog_posts for delete to anon using (true);
"

# ----------------------------------------------------------------------------
echo "[3/3] blog-images storage bucket + storage RLS..."
run_sql "
insert into storage.buckets (id, name, public)
values ('blog-images','blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists \"public read blog images\" on storage.objects;
drop policy if exists \"anon upload blog images\" on storage.objects;
drop policy if exists \"anon update blog images\" on storage.objects;
drop policy if exists \"anon delete blog images\" on storage.objects;

create policy \"public read blog images\" on storage.objects
  for select to anon using (bucket_id = 'blog-images');
create policy \"anon upload blog images\" on storage.objects
  for insert to anon with check (bucket_id = 'blog-images');
create policy \"anon update blog images\" on storage.objects
  for update to anon using (bucket_id = 'blog-images') with check (bucket_id = 'blog-images');
create policy \"anon delete blog images\" on storage.objects
  for delete to anon using (bucket_id = 'blog-images');
"

echo ""
echo "✓ Kurulum tamamlandı."
