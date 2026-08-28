// Edge Function: translate-text
//
// Stateless free-text translator for the admin panel (tour form "TR'den çevir"
// buttons). Unlike translate-review, this never touches the database — it just
// proxies to the translation providers so the browser doesn't hit them (and
// their CORS restrictions) directly.
//
// Request:  { items: [{ text: string, from: Lang, to: Lang }, ...] }
// Response: { translations: (string | null)[] }  (null = that item failed)
//
// The response is positional, so an invalid item keeps its slot as null rather
// than shifting every later translation by one. Items are grouped by language
// pair before dispatch, turning one tour field bound for four target languages
// into four batched provider calls instead of one call per string.
//
// Secrets: see supabase/functions/_shared/translate.ts.

import { corsHeaders } from "../_shared/cors.ts";
import { groupByLangPair, validateItem } from "../_shared/translate-terms.ts";
import { translateMany } from "../_shared/translate.ts";

// Raised from 40 when German became the fifth language: the tour form's longest
// fields (itinerary, day-by-day) send one item per line per target language,
// and 40 started truncating real submissions.
const MAX_ITEMS = 200;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let payload: { items?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) return json({ error: "no items" }, 400);
  if (items.length > MAX_ITEMS) return json({ error: `too many items (max ${MAX_ITEMS})` }, 400);

  const valid = items.map(validateItem);
  const translations: (string | null)[] = new Array(valid.length).fill(null);

  for (const group of groupByLangPair(valid)) {
    const out = await translateMany(
      group.indices.map((i) => valid[i]!.text),
      group.from,
      group.to,
    );
    group.indices.forEach((i, j) => (translations[i] = out[j]));
  }

  return json({ translations });
});
