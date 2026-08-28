// Fills the German (de) variant of every translatable field on public.tours,
// translating from the English text with DeepL.
//
// Run once after German was added as a site language. It is idempotent: a field
// that already has non-blank German is left alone unless --force is given, so
// an interrupted run can simply be repeated, and a later run only picks up
// tours added since.
//
// Structured fields keep their non-text parts: itinerary steps keep their icon,
// day plans keep their day number. Everything else about the shape is preserved
// exactly — this script only ever adds a "de" key alongside the existing ones.
//
// Usage:
//   node scripts/backfill-german.mjs --dry-run     # show what would change
//   node scripts/backfill-german.mjs               # write
//   node scripts/backfill-german.mjs --slug=kekova-classic
//   node scripts/backfill-german.mjs --force       # overwrite existing German

import { loadEnv, translateAll, usage } from "./deepl.mjs";

const TARGET = "de";
/** Source language to translate from, best first. English reads better in German. */
const SOURCE_ORDER = ["en", "tr"];

const flags = process.argv.slice(2);
const DRY_RUN = flags.includes("--dry-run");
const FORCE = flags.includes("--force");
const ONLY_SLUG = flags.find((f) => f.startsWith("--slug="))?.slice("--slug=".length);

const env = loadEnv();
const API = (env.SB_PROJECT_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = env.SB_SERVICE_ROLE_KEY;
const DEEPL_KEY = env.DEEPL_API_KEY;

const isBlank = (v) => v == null || (typeof v === "string" && v.trim() === "");

/** Pick the first non-blank source language for a localized value. */
function sourceFor(localized) {
  if (!localized || typeof localized !== "object") return null;
  for (const lang of SOURCE_ORDER) {
    const value = localized[lang];
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return { lang, value };
  }
  return null;
}

// ─── field extraction ─────────────────────────────────────────────────────────
//
// Each extractor turns a localized value into a flat list of strings to
// translate, plus a rebuild function that puts the translations back in shape.
// Keeping the two next to each other is what guarantees they stay in step.

const asText = {
  strings: (value) => [value],
  rebuild: (_source, [translated]) => translated,
};

const asList = {
  strings: (value) => value,
  rebuild: (_source, translated) => translated,
};

/** Itinerary steps: translate title and body, keep the icon verbatim. */
const asItinerary = {
  strings: (steps) => steps.flatMap((s) => [s.title ?? "", s.body ?? ""]),
  rebuild: (steps, translated) =>
    steps.map((s, i) => ({ ...s, title: translated[i * 2], body: translated[i * 2 + 1] })),
};

/**
 * Day plans: translate title, body and the distance label ("3 miles" is
 * "3 мили" in the Russian rows, so it is content, not a code). The day number
 * is left alone.
 */
const asDayPlan = {
  strings: (days) => days.flatMap((d) => [d.title ?? "", d.body ?? "", d.distance ?? ""]),
  rebuild: (days, translated) =>
    days.map((d, i) => {
      const [title, body, distance] = translated.slice(i * 3, i * 3 + 3);
      return { ...d, title, body, ...(d.distance != null ? { distance } : {}) };
    }),
};

/** Top-level jsonb columns on public.tours. */
const COLUMNS = [
  ["title", asText],
  ["tagline", asText],
  ["description", asText],
  ["highlights", asList],
  ["included", asList],
  ["why_choose", asList],
  ["itinerary", asItinerary],
];

/** Localized members inside the multi_day jsonb blob. `dates` is language-agnostic. */
const MULTI_DAY_FIELDS = [
  ["groupSize", asText],
  ["notIncluded", asList],
  ["dayByDay", asDayPlan],
];

/**
 * Work out every field needing German for one tour. Returns job descriptors
 * that carry their own rebuild step, so the translation pass stays generic.
 */
function planTour(row) {
  const jobs = [];

  const consider = (label, localized, handler, apply) => {
    if (!localized || typeof localized !== "object") return;
    const existing = localized[TARGET];
    const alreadyFilled =
      existing != null &&
      !(typeof existing === "string" && existing.trim() === "") &&
      !(Array.isArray(existing) && existing.length === 0);
    if (alreadyFilled && !FORCE) return;

    const source = sourceFor(localized);
    if (!source) return;

    const strings = handler.strings(source.value);
    if (strings.every(isBlank)) return;
    jobs.push({ label, sourceLang: source.lang, strings, handler, source: source.value, apply });
  };

  for (const [column, handler] of COLUMNS) {
    consider(column, row[column], handler, (value) => ({ [column]: { ...row[column], de: value } }));
  }

  const md = row.multi_day;
  if (md && typeof md === "object") {
    for (const [key, handler] of MULTI_DAY_FIELDS) {
      consider(`multi_day.${key}`, md[key], handler, (value) => ({
        multi_day: { ...md, [key]: { ...md[key], de: value } },
      }));
    }
  }
  return jobs;
}

async function fetchTours() {
  const query = ONLY_SLUG ? `&slug=eq.${encodeURIComponent(ONLY_SLUG)}` : "";
  const res = await fetch(`${API}/rest/v1/tours?select=*${query}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function patchTour(id, patch) {
  const res = await fetch(`${API}/rest/v1/tours?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase patch failed: ${res.status} ${await res.text()}`);
}

async function main() {
  if (!API || !SERVICE_KEY) throw new Error("Missing SB_PROJECT_URL / SB_SERVICE_ROLE_KEY in .env.local");
  if (!DEEPL_KEY) throw new Error("DEEPL_API_KEY missing from .env.local");

  const before = await usage(DEEPL_KEY);
  console.log(`DeepL usage before: ${before.character_count} / ${before.character_limit}`);

  const tours = await fetchTours();
  console.log(`${tours.length} tour(s) loaded${ONLY_SLUG ? ` (slug=${ONLY_SLUG})` : ""}`);

  // Plan everything first so one DeepL pass covers all tours, and so a dry run
  // reports the true cost before anything is written.
  const planned = tours
    .map((row) => ({ row, jobs: planTour(row) }))
    .filter(({ jobs }) => jobs.length > 0);

  if (planned.length === 0) {
    console.log(FORCE ? "Nothing to translate." : "All tours already have German. (Use --force to redo.)");
    return;
  }

  // Group by source language: DeepL needs one language pair per request.
  const byLang = new Map();
  for (const { jobs } of planned) {
    for (const job of jobs) {
      const bucket = byLang.get(job.sourceLang) ?? [];
      bucket.push(job);
      byLang.set(job.sourceLang, bucket);
    }
  }

  const totalStrings = [...byLang.values()].flat().reduce((n, j) => n + j.strings.length, 0);
  const totalChars = [...byLang.values()]
    .flat()
    .reduce((n, j) => n + j.strings.join("").length, 0);
  console.log(
    `${planned.length} tour(s) need German: ${totalStrings} strings, ~${totalChars} characters`,
  );

  for (const [lang, jobs] of byLang) {
    const flat = jobs.flatMap((j) => j.strings);
    console.log(`\nTranslating ${flat.length} strings ${lang} -> ${TARGET}`);
    const out = await translateAll(flat, lang, TARGET, DEEPL_KEY, (batch, size) =>
      console.log(`  batch ${batch}: ${size} strings`),
    );
    // Hand each job back exactly the slice it contributed.
    let cursor = 0;
    for (const job of jobs) {
      job.translated = out.slice(cursor, cursor + job.strings.length);
      cursor += job.strings.length;
    }
    if (cursor !== out.length) throw new Error("translation slice mismatch");
  }

  for (const { row, jobs } of planned) {
    const patch = {};
    const isMultiDay = (job) => job.label.startsWith("multi_day.");

    // Top-level columns are independent, so each job's patch can be merged.
    for (const job of jobs.filter((j) => !isMultiDay(j))) {
      Object.assign(patch, job.apply(job.handler.rebuild(job.source, job.translated)));
    }

    // multi_day jobs all live inside one jsonb blob: applied independently they
    // would each rebuild from the original and clobber the others, so fold them
    // into a single value.
    const mdJobs = jobs.filter(isMultiDay);
    if (mdJobs.length > 0) {
      patch.multi_day = mdJobs.reduce((md, job) => {
        const key = job.label.slice("multi_day.".length);
        return { ...md, [key]: { ...md[key], de: job.handler.rebuild(job.source, job.translated) } };
      }, row.multi_day);
    }

    console.log(`\n${row.slug}: ${jobs.map((j) => j.label).join(", ")}`);
    if (DRY_RUN) {
      const sample = jobs[0];
      console.log(`  e.g. ${sample.label}: ${JSON.stringify(sample.translated[0])}`);
      continue;
    }
    await patchTour(row.id, patch);
    console.log("  updated");
  }

  const after = await usage(DEEPL_KEY);
  console.log(
    `\nDeepL usage after: ${after.character_count} / ${after.character_limit} (+${after.character_count - before.character_count})`,
  );
  if (DRY_RUN) console.log("--dry-run: no rows were written.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
