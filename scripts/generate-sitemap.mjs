// Generates public/sitemap.xml for all localized routes + tour detail pages,
// each with hreflang alternates.
//
// Tour slugs are pulled live from Supabase (public.tours, published=true) —
// the public site reads exclusively from the DB, there's no static fallback.
//
// Usage:
//   node scripts/generate-sitemap.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DOMAIN = "https://dragomanseakayak.com";
const LOCALES = ["tr", "en", "fr", "ru"];

// Path segments (keep in sync with src/lib/routes.ts SEG).
const SEG = {
  tours: "turlar",
  customTours: "ozel-turlar",
  trak: "trak-experience",
  about: "hakkimizda",
  reviews: "yorumlar",
  contact: "iletisim",
  faq: "sss",
};

function loadEnv() {
  const txt = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

/** Fetch published tour slugs from Supabase (anon key — public, read-only data). */
async function tourSlugs() {
  const env = loadEnv();
  const url = (env.SB_PROJECT_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SB_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SB_PROJECT_URL / SB_ANON_KEY in .env.local");
  }
  const res = await fetch(`${url}/rest/v1/tours?select=slug&published=eq.true`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  return rows.map((r) => r.slug);
}

// Static page paths (relative to locale root). "" = index.
const staticPaths = ["", ...Object.values(SEG)];

/** Build the per-path URL entry with hreflang alternates across locales. */
function urlEntry(relPath) {
  const loc = (lang) => `${DOMAIN}/${lang}${relPath ? `/${relPath}` : ""}`;
  const alts = LOCALES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${loc(l)}"/>`,
  ).join("\n");
  // Canonical entry per locale.
  return LOCALES.map(
    (lang) => `  <url>
    <loc>${loc(lang)}</loc>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc(LOCALES[0])}"/>
  </url>`,
  ).join("\n");
}

async function main() {
  const slugs = await tourSlugs();
  const paths = [
    ...staticPaths,
    ...slugs.map((s) => `${SEG.tours}/${s}`),
  ];
  const body = paths.map(urlEntry).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
  const out = resolve(ROOT, "public", "sitemap.xml");
  writeFileSync(out, xml, "utf8");
  console.log(`Wrote ${out}: ${paths.length} paths × ${LOCALES.length} locales = ${paths.length * LOCALES.length} URLs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
