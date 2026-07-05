// Edge Function: translate-text
//
// Stateless free-text translator for the admin panel (tour form "Otomatik
// çevir" buttons). Unlike translate-review, this never touches the database —
// it just proxies to the free MyMemory API so the browser doesn't hit MyMemory
// (and its CORS restrictions) directly.
//
// Request:  { items: [{ text: string, from: Lang, to: Lang }, ...] }
// Response: { translations: (string | null)[] }  (null = that item failed)
//
// Secrets (supabase secrets set ...):
//   MYMEMORY_EMAIL (optional) — raises the free daily quota.

import { corsHeaders } from "../_shared/cors.ts";

type Lang = "tr" | "en" | "fr" | "ru";

interface TranslateItem {
  text: string;
  from: Lang;
  to: Lang;
}

const MYMEMORY_EMAIL = Deno.env.get("MYMEMORY_EMAIL") ?? "";
const MAX_ITEMS = 40;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Translate one chunk (<=480 chars) via MyMemory. Returns null on failure. */
async function translateChunk(text: string, from: Lang, to: Lang): Promise<string | null> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${from}|${to}`);
  if (MYMEMORY_EMAIL) url.searchParams.set("de", MYMEMORY_EMAIL);

  try {
    const res = await fetch(url.toString(), { headers: { "User-Agent": "dmseakayak/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    const translated: string | undefined = data?.responseData?.translatedText;
    if (!translated || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(translated)) {
      return null;
    }
    return translated;
  } catch {
    return null;
  }
}

/** MyMemory caps each query at 500 bytes; split long text on sentence boundaries. */
async function translateText(text: string, from: Lang, to: Lang): Promise<string | null> {
  const MAX = 480;
  if (text.length <= MAX) return translateChunk(text, from, to);

  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > MAX && buf) {
      chunks.push(buf);
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf) chunks.push(buf);

  const out: string[] = [];
  for (const c of chunks) {
    const piece = await translateChunk(c.trim(), from, to);
    if (piece === null) return null;
    out.push(piece);
    await sleep(200);
  }
  return out.join(" ");
}

const LANGS: Lang[] = ["tr", "en", "fr", "ru"];
const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as string[]).includes(v);

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

  const valid: TranslateItem[] = [];
  for (const raw of items) {
    const item = raw as Partial<TranslateItem>;
    if (
      typeof item.text === "string" &&
      item.text.trim() &&
      isLang(item.from) &&
      isLang(item.to) &&
      item.from !== item.to
    ) {
      valid.push({ text: item.text, from: item.from, to: item.to });
    } else {
      valid.push({ text: "", from: "tr", to: "tr" }); // placeholder keeps index alignment
    }
  }

  const translations: (string | null)[] = [];
  for (const item of valid) {
    if (!item.text) {
      translations.push(null);
      continue;
    }
    translations.push(await translateText(item.text, item.from, item.to));
    await sleep(200);
  }

  return json({ translations });
});
