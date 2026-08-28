// Shared DeepL client for the Node scripts (translate-locale, backfill-german).
//
// The Edge Functions have their own copy in supabase/functions/_shared/ because
// they run on Deno and cannot import from here; keep the two in step when the
// protected-term list or the language mapping changes.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Read .env.local into a plain object. Same loader shape as generate-sitemap.mjs. */
export function loadEnv() {
  const txt = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return env;
}

/** DeepL rejects a bare "EN" as a target; source codes are the plain ones. */
export const DEEPL_TARGET = { tr: "TR", en: "EN-GB", fr: "FR", ru: "RU", de: "DE" };
export const DEEPL_SOURCE = { tr: "TR", en: "EN", fr: "FR", ru: "RU", de: "DE" };

/**
 * Brand and product names DeepL must not translate ("SeaKayak" comes back as
 * "Seekajak"). Swapped for opaque sentinels rather than DeepL's ignore_tags,
 * which treats the span as foreign and wraps the result in German quotation
 * marks. Longest first, so "Dragoman SeaKayak" is claimed before bare
 * "Dragoman" can split it.
 */
export const DO_NOT_TRANSLATE = [
  "Dragoman SeaKayak",
  "Dragoman Turkey",
  "Dragoman",
  "TRAK",
  "SeaKayak",
  "TÜRSAB",
];

const sentinel = (i) => `XKEEP${i}X`;
const protectTerms = (t) => DO_NOT_TRANSLATE.reduce((s, term, i) => s.split(term).join(sentinel(i)), t);
const restoreTerms = (t) => DO_NOT_TRANSLATE.reduce((s, term, i) => s.split(sentinel(i)).join(term), t);

/** Free-tier keys end in ":fx" and must use the api-free host; pro keys 403 there. */
const baseUrl = (key) =>
  key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";

/** DeepL accepts at most 50 text params per request. */
const BATCH = 50;

/**
 * Translate an array of strings, preserving order. Splits into 50-item batches.
 * Throws on any HTTP failure — callers here are one-off scripts where a partial
 * write is worse than stopping.
 */
export async function translateAll(texts, from, to, apiKey, onBatch) {
  if (!DEEPL_SOURCE[from] || !DEEPL_TARGET[to]) {
    throw new Error(`Unsupported locale pair ${from} -> ${to}`);
  }
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const res = await fetch(`${baseUrl(apiKey)}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: slice.map(protectTerms),
        source_lang: DEEPL_SOURCE[from],
        target_lang: DEEPL_TARGET[to],
        preserve_formatting: true,
      }),
    });
    if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (data.translations?.length !== slice.length) {
      throw new Error(`DeepL returned ${data.translations?.length} of ${slice.length} translations`);
    }
    out.push(...data.translations.map((t) => restoreTerms(t.text)));
    onBatch?.(Math.floor(i / BATCH) + 1, slice.length);
  }
  return out;
}

/** Current month's character usage, for a before/after sanity check. */
export async function usage(apiKey) {
  const res = await fetch(`${baseUrl(apiKey)}/v2/usage`, {
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
  });
  if (!res.ok) throw new Error(`DeepL usage ${res.status}: ${await res.text()}`);
  return res.json();
}
