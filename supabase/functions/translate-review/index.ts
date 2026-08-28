// Edge Function: translate-review
//
// Fills public.review_translations for one or many reviews. For each review it:
//   1. stores the original-language body as a translation row (is_machine=false),
//   2. machine-translates into every other language of {tr,en,fr,ru,de}.
//
// Translation goes through _shared/translate.ts (DeepL, MyMemory fallback).
//
// It NEVER overwrites a row with is_machine=false (admin edits / originals),
// so it is safe to re-run ("translate all", "re-translate") idempotently.
//
// Invocation paths:
//   • Postgres insert trigger  → { review_id }            (x-shared-secret header)
//   • Admin panel (browser)    → { review_ids: [...] }    (Supabase auth JWT)
//
// Secrets (supabase secrets set ...):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-injected by Supabase)
//   EDGE_SHARED_SECRET                        (must match Vault edge_shared_secret)
//   DEEPL_API_KEY, MYMEMORY_EMAIL             (see _shared/translate.ts)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { LANGS, sleep, translateText, type Lang } from "../_shared/translate.ts";

interface ReviewRow {
  id: string;
  body: string;
  source_lang: Lang;
}

interface TranslationRow {
  review_id: string;
  lang: Lang;
  is_machine: boolean;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SHARED_SECRET = Deno.env.get("EDGE_SHARED_SECRET") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Translate a single review into all missing target languages. */
async function processReview(review: ReviewRow, existing: TranslationRow[]): Promise<{
  written: number;
  skipped: number;
  failed: number;
}> {
  const byLang = new Map(existing.map((t) => [t.lang, t]));
  let written = 0;
  let skipped = 0;
  let failed = 0;

  // 1. Original-language row (is_machine=false). Upsert only if absent or still machine.
  const origExisting = byLang.get(review.source_lang);
  if (!origExisting || origExisting.is_machine) {
    const { error } = await admin
      .from("review_translations")
      .upsert(
        {
          review_id: review.id,
          lang: review.source_lang,
          body: review.body,
          is_machine: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "review_id,lang" },
      );
    if (error) failed++;
    else written++;
  }

  // 2. Machine-translate into the remaining languages.
  for (const lang of LANGS) {
    if (lang === review.source_lang) continue;
    const ex = byLang.get(lang);
    if (ex && !ex.is_machine) {
      skipped++; // admin-edited — never overwrite
      continue;
    }
    const translated = await translateText(review.body, review.source_lang, lang);
    if (translated === null) {
      failed++;
      continue;
    }
    const { error } = await admin.from("review_translations").upsert(
      {
        review_id: review.id,
        lang,
        body: translated,
        is_machine: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "review_id,lang" },
    );
    if (error) failed++;
    else written++;
    await sleep(250);
  }

  return { written, skipped, failed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  // Authorize: either the shared secret (DB trigger) OR a valid admin JWT
  // (Supabase verifies the JWT before the function runs when verify_jwt is on;
  //  the trigger path uses the shared secret because it has no user session).
  const headerSecret = req.headers.get("x-shared-secret") ?? "";
  const hasAuthHeader = !!req.headers.get("authorization");
  const secretOk = SHARED_SECRET && headerSecret === SHARED_SECRET;
  if (!secretOk && !hasAuthHeader) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: { review_id?: string; review_ids?: string[] };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  const ids = payload.review_ids ?? (payload.review_id ? [payload.review_id] : []);
  const validIds = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (validIds.length === 0) return json({ error: "no valid review_id(s)" }, 400);

  // Load reviews + their existing translations.
  const { data: reviews, error: rErr } = await admin
    .from("reviews")
    .select("id, body, source_lang")
    .in("id", validIds);
  if (rErr) return json({ error: rErr.message }, 500);
  if (!reviews?.length) return json({ error: "no reviews found" }, 404);

  const { data: translations, error: tErr } = await admin
    .from("review_translations")
    .select("review_id, lang, is_machine")
    .in("review_id", validIds);
  if (tErr) return json({ error: tErr.message }, 500);

  const byReview = new Map<string, TranslationRow[]>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    const arr = byReview.get(t.review_id) ?? [];
    arr.push(t);
    byReview.set(t.review_id, arr);
  }

  let written = 0;
  let skipped = 0;
  let failed = 0;
  for (const r of reviews as ReviewRow[]) {
    const result = await processReview(r, byReview.get(r.id) ?? []);
    written += result.written;
    skipped += result.skipped;
    failed += result.failed;
  }

  return json({ ok: true, reviews: reviews.length, written, skipped, failed });
});
