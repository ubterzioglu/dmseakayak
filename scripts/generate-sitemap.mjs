// Generates public/sitemap.xml for all localized routes + tour detail pages,
// each with hreflang alternates.
//
// NOTE: While the site is staged under BASE_PATH (/mvp) and robots.txt blocks
// /mvp, this writes the LIVE url set (root-based). Re-run at launch once
// BASE_PATH is "" so the on-site links and sitemap agree.
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
  gallery: "galeri",
  reviews: "yorumlar",
  contact: "iletisim",
  faq: "sss",
};

/** Pull tour slugs from the content files (slug: "...") excluding ones with externalDetailPath. */
function tourSlugs() {
  const files = ["src/content/tours.ts", "src/content/multiDayTours.ts"];
  const slugs = [];
  for (const f of files) {
    const txt = readFileSync(resolve(ROOT, f), "utf8");
    for (const m of txt.matchAll(/slug:\s*"([^"]+)"/g)) slugs.push(m[1]);
  }
  return slugs;
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

function main() {
  const slugs = tourSlugs();
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

main();
