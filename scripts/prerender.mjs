// Prerenders every localized route to static HTML under dist/, so Googlebot's
// first (non-JS) pass sees real content instead of the empty SPA shell.
//
// Runs after `vite build`: spins up `vite preview` against dist/, visits each
// route with Playwright, waits for client-side render + i18n to settle, and
// writes the resulting DOM as dist/<lang>/<path>/index.html. nginx's
// `try_files $uri $uri/ /index.html` picks these up automatically — no config
// change needed, unprerendered routes still fall back to the SPA shell.
//
// Usage:
//   node scripts/prerender.mjs   (run after `vite build`, before deploy)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Keep in sync with LOCALES in src/lib/site.ts (see the note in
// generate-sitemap.mjs — plain ESM cannot import the TS module).
const LOCALES = ["tr", "en", "fr", "ru", "de"];

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

// .env.local exists for local dev but is deliberately excluded from the
// Docker build context (.dockerignore) — in CI/Docker these come from
// process.env instead (see Dockerfile ARG/ENV).
function loadEnvFile() {
  try {
    const txt = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    const env = {};
    for (const line of txt.split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      env[line.slice(0, i).trim()] = v;
    }
    return env;
  } catch {
    return {};
  }
}

/** Fetch published tour slugs from Supabase (anon key — public, read-only data). */
async function tourSlugs() {
  const fileEnv = loadEnvFile();
  const env = { ...fileEnv, ...process.env };
  const url = (env.SB_PROJECT_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SB_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase URL/anon key: set SB_PROJECT_URL + SB_ANON_KEY (or VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) in .env.local or the environment.",
    );
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

/** Selector that's only present once the real page content has rendered. */
function readySelector(relPath) {
  if (relPath === "") return "h1, h2";
  return "h1, h2, main";
}

async function main() {
  const slugs = await tourSlugs();
  const paths = [...staticPaths, ...slugs.map((s) => `${SEG.tours}/${s}`)];

  console.log(`Prerendering ${paths.length} paths × ${LOCALES.length} locales = ${paths.length * LOCALES.length} pages...`);

  const server = await preview({ root: ROOT, preview: { port: 4173, host: "127.0.0.1" } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");

  const browser = await chromium.launch();
  let done = 0;
  let failed = 0;

  try {
    for (const lang of LOCALES) {
      for (const relPath of paths) {
        const urlPath = `/${lang}${relPath ? `/${relPath}` : ""}`;
        const page = await browser.newPage();
        try {
          await page.goto(`${base}${urlPath}`, { waitUntil: "load", timeout: 30000 });
          await page.waitForSelector(readySelector(relPath), { timeout: 10000 });
          // Let async data (Supabase tour fetch, i18n settle) finish painting.
          await page.waitForTimeout(800);

          // index.html ships a static <title>/<meta description>/<link
          // canonical>/<script type=application/ld+json> for the pre-JS
          // crawl pass. react-helmet-async layers its own per-route versions
          // on top at runtime but never removes the static originals, so
          // both are present in the DOM by now — strip the static leftovers
          // (no data-rh attribute) so crawlers see a single, correct
          // canonical/description/structured-data set per page. Helmet-owned
          // JSON-LD blocks (e.g. TourDetail's [tripLd, breadcrumbLd]) each
          // carry data-rh="true" and are left alone — only the one static,
          // unmanaged block from index.html gets removed.
          await page.evaluate(() => {
            const managed = new Set([
              "title",
              "meta[name=description]",
              "link[rel=canonical]",
              "script[type='application/ld+json']",
            ]);
            for (const sel of managed) {
              const all = Array.from(document.head.querySelectorAll(sel));
              const hasHelmetVersion = all.some((el) => el.hasAttribute("data-rh"));
              if (hasHelmetVersion) all.filter((el) => !el.hasAttribute("data-rh")).forEach((el) => el.remove());
            }
          });

          const html = await page.content();
          const outDir = join(ROOT, "dist", lang, relPath);
          mkdirSync(outDir, { recursive: true });
          writeFileSync(join(outDir, "index.html"), html, "utf8");
          done++;
        } catch (err) {
          failed++;
          console.error(`  FAILED ${urlPath}: ${err.message.split("\n")[0]}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  // The bare domain root must serve real content too: crawlers and GEO audits
  // hit `/` first, and until now it returned the empty SPA shell. Overwrite the
  // shell with the prerendered default-locale index. That copy's canonical and
  // hreflang already point at /<default>/ (Seo.tsx emits x-default there), so
  // serving it at `/` adds content without creating a duplicate-content clash.
  // Done last so `vite preview` kept serving the original shell during the loop.
  const defaultIndex = join(ROOT, "dist", LOCALES[0], "index.html");
  const rootIndex = join(ROOT, "dist", "index.html");
  if (existsSync(defaultIndex)) {
    // `/` is its own URL (nginx never redirects it), so it must be
    // self-canonical: a canonical pointing at /<default> made Google-style
    // audits flag "canonical points elsewhere" on the domain root. Repoint
    // canonical, og:url and the x-default alternate at the root.
    const origin = (readFileSync(defaultIndex, "utf8").match(
      /<link[^>]*rel="canonical"[^>]*href="(https?:\/\/[^/"]+)/,
    ) || [])[1];
    const rootUrl = origin ? `${origin}/` : null;
    let html = readFileSync(defaultIndex, "utf8");
    if (rootUrl) {
      const repoint = (tagRe, attr) => {
        html = html.replace(tagRe, (tag) => tag.replace(new RegExp(`${attr}="[^"]*"`), `${attr}="${rootUrl}"`));
      };
      repoint(/<link[^>]*rel="canonical"[^>]*>/g, "href");
      repoint(/<meta[^>]*property="og:url"[^>]*>/g, "content");
      repoint(/<link[^>]*hreflang="x-default"[^>]*>/gi, "href");
    }
    writeFileSync(rootIndex, html, "utf8");
    console.log(`Wrote prerendered /${LOCALES[0]}/ to dist/index.html${rootUrl ? ` (canonical ${rootUrl})` : ""}.`);
  } else {
    failed++;
    console.error(`  FAILED /: dist/${LOCALES[0]}/index.html missing, root left as SPA shell.`);
  }

  console.log(`Prerendered ${done} pages (${failed} failed).`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
