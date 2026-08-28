// Shared translation backend for the translate-text and translate-review
// Edge Functions.
//
// DeepL is primary; MyMemory is the fallback that both functions used
// exclusively before German was added. Keeping MyMemory means a DeepL outage
// or an exhausted monthly quota degrades quality instead of breaking the admin
// panel outright.
//
// Why DeepL became primary: adding a fifth language multiplied the volume every
// "translate" click produces, and MyMemory bills that as one HTTP request per
// 480-character chunk per language with a courtesy delay between each. DeepL
// takes up to 50 texts in a single request and has no per-request throttle, so
// a full tour form went from dozens of serialized calls to a handful.
//
// Secrets (supabase secrets set ...):
//   DEEPL_API_KEY   — enables DeepL. Absent: everything falls back to MyMemory.
//   MYMEMORY_EMAIL  — optional, raises MyMemory's free daily quota.

import {
  DEEPL_SOURCE,
  DEEPL_TARGET,
  protectTerms,
  restoreTerms,
  type Lang,
} from "./translate-terms.ts";

export { LANGS, isLang, type Lang } from "./translate-terms.ts";

const DEEPL_API_KEY = Deno.env.get("DEEPL_API_KEY") ?? "";
const MYMEMORY_EMAIL = Deno.env.get("MYMEMORY_EMAIL") ?? "";

/** Free-tier keys end in ":fx" and must use the api-free host; pro keys 403 there. */
const deeplBase = () =>
  DEEPL_API_KEY.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** DeepL accepts at most 50 text params per request. */
const DEEPL_BATCH = 50;

/**
 * Translate a batch of texts with DeepL. Returns null (the whole batch) when
 * DeepL is unconfigured or errors, so the caller can fall back per item.
 */
async function deeplBatch(texts: string[], from: Lang, to: Lang): Promise<string[] | null> {
  if (!DEEPL_API_KEY || texts.length === 0) return null;
  try {
    const res = await fetch(`${deeplBase()}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts.map(protectTerms),
        source_lang: DEEPL_SOURCE[from],
        target_lang: DEEPL_TARGET[to],
        preserve_formatting: true,
      }),
    });
    if (!res.ok) {
      // 456 = quota exhausted, 429 = rate limited, 5xx = outage. All fall back.
      console.error(`DeepL ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const out: unknown = data?.translations;
    if (!Array.isArray(out) || out.length !== texts.length) return null;
    return out.map((t) => restoreTerms(String(t?.text ?? "")));
  } catch (err) {
    console.error("DeepL request failed", err);
    return null;
  }
}

// ─── MyMemory fallback ────────────────────────────────────────────────────────

/** Translate one chunk (<=480 chars) via MyMemory. Returns null on failure. */
async function myMemoryChunk(text: string, from: Lang, to: Lang): Promise<string | null> {
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
async function myMemoryText(text: string, from: Lang, to: Lang): Promise<string | null> {
  const MAX = 480;
  if (text.length <= MAX) return myMemoryChunk(text, from, to);

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
    const piece = await myMemoryChunk(c.trim(), from, to);
    if (piece === null) return null; // partial translation is worse than none
    out.push(piece);
    await sleep(200);
  }
  return out.join(" ");
}

// ─── public API ───────────────────────────────────────────────────────────────

/** Translate a single text. Returns null when both providers fail. */
export async function translateText(
  text: string,
  from: Lang,
  to: Lang,
): Promise<string | null> {
  if (!text.trim() || from === to) return null;
  const viaDeepl = await deeplBatch([text], from, to);
  if (viaDeepl) return viaDeepl[0];
  return myMemoryText(text, from, to);
}

/**
 * Translate many texts sharing one language pair. Index-aligned with the input;
 * a failed item is null. DeepL handles these 50 at a time; only the items DeepL
 * could not cover fall through to MyMemory's one-request-per-item path.
 */
export async function translateMany(
  texts: string[],
  from: Lang,
  to: Lang,
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(texts.length).fill(null);

  // Blank inputs never reach a provider but must keep their slot.
  const pending = texts
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text.trim() !== "");
  if (pending.length === 0 || from === to) return results;

  let deeplCovered = false;
  for (let i = 0; i < pending.length; i += DEEPL_BATCH) {
    const slice = pending.slice(i, i + DEEPL_BATCH);
    const out = await deeplBatch(slice.map((p) => p.text), from, to);
    if (!out) break; // DeepL is down or over quota — hand the rest to MyMemory
    slice.forEach((p, j) => (results[p.index] = out[j]));
    deeplCovered = true;
  }

  const missing = pending.filter((p) => results[p.index] === null);
  if (missing.length === 0) return results;
  if (deeplCovered) console.warn(`DeepL covered partially; ${missing.length} items via MyMemory`);

  for (const p of missing) {
    results[p.index] = await myMemoryText(p.text, from, to);
    await sleep(200);
  }
  return results;
}
