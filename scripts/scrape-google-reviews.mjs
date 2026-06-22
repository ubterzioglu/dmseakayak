// One-time Google Maps review scraper (free, runs locally with Playwright).
//
// Opens the business Maps page, switches to the Reviews tab, scrolls until all
// reviews are loaded, and writes them to scripts/output/reviews.json in the
// exact JSON-array shape the admin "Toplu Ekle" box accepts (see
// src/lib/parseReviews.ts) — plus extra fields the 0004 migration added.
//
// Usage:
//   npm i -D playwright
//   npx playwright install chromium
//   npm run scrape:reviews                       # uses the default URL below
//   node scripts/scrape-google-reviews.mjs "https://maps.app.goo.gl/..."
//
// NOTE: Google's DOM changes occasionally. This is a one-time / monthly tool;
// if selectors break, run with HEADFUL=1 to watch and adjust the selectors.

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_URL = "https://maps.app.goo.gl/pDn4HTyraEKg5Buh8";
const OUT = resolve(__dirname, "output", "reviews.json");

const SUPPORTED = ["tr", "en", "fr", "ru"];

/** Map Google's star aria-label (e.g. "5 yıldız" / "5 stars") to a number. */
function parseRating(label) {
  const m = (label || "").match(/\d+/);
  const n = m ? Number(m[0]) : 5;
  return Math.min(5, Math.max(1, n));
}

/**
 * Crude language guess for source_lang. Only tr/en/fr/ru are valid DB values,
 * so non-supported languages (e.g. German) fall back to "en" — the translator
 * will still render the body into all 4 target languages from there. Admin can
 * fix source_lang in the panel if needed.
 */
function guessLang(text) {
  const t = (text || "").toLowerCase();
  if (/[ğş]|ı\b/.test(t) || /\b(çok|harika|tekne|rehber|deneyim|teşekkür|gezi)\b/.test(t)) return "tr";
  if (/[а-яё]/.test(t)) return "ru";
  if (/\b(très|était|nous avons|magnifique|expérience|génial|merci)\b/.test(t)) return "fr";
  return "en"; // English + any unsupported language (de, it, es, ...) → en
}

async function clickReviewsTab(page) {
  // Try several known labels across locales (de = Rezensionen).
  const labels = ["Reviews", "Yorumlar", "Rezensionen", "Avis", "Отзывы"];
  for (const label of labels) {
    const btn = page.getByRole("tab", { name: new RegExp(label, "i") }).first();
    if (await btn.count().catch(() => 0)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(1500);
      return true;
    }
  }
  // Fallback: a button containing the word "review".
  const fallback = page.locator('button:has-text("review"), button:has-text("yorum")').first();
  if (await fallback.count().catch(() => 0)) {
    await fallback.click().catch(() => {});
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

async function getScrollable(page) {
  // Static candidates first (fast path).
  for (const sel of ['div[role="feed"]', 'div.m6QErb[tabindex="-1"]', "div.DxyBCb"]) {
    const el = page.locator(sel).first();
    if ((await el.count().catch(() => 0)) && (await el.evaluate((e) => e.scrollHeight > e.clientHeight + 50).catch(() => false))) {
      return el;
    }
  }
  // Dynamic: walk up from a review card to its nearest scrollable ancestor and
  // tag it so we can target it with a locator afterwards.
  const tagged = await page.evaluate(() => {
    const card = document.querySelector("div[data-review-id], div.jftiEf");
    let el = card?.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 50) {
        el.setAttribute("data-scrape-scroll", "1");
        return true;
      }
      el = el.parentElement;
    }
    return false;
  });
  if (tagged) return page.locator('[data-scrape-scroll="1"]').first();
  return null;
}

async function expandMoreButtons(page) {
  // Reveal truncated bodies. Covers en/tr/de/fr/ru "More" labels. Google uses a
  // generic button with these texts inside each long review.
  const more = page.locator(
    [
      'button[aria-label*="More"]',
      'button[aria-label*="Daha fazla"]',
      'button:has-text("More")',
      'button:has-text("Daha fazla")',
      'button:has-text("Mehr anzeigen")',
      'button:has-text("Mehr")',
      'button:has-text("Plus")',
      'button:has-text("Ещё")',
    ].join(", "),
  );
  const count = await more.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    await more.nth(i).click().catch(() => {});
  }
}

async function extractReviews(page) {
  return page.$$eval('div[data-review-id], div.jftiEf', (nodes) => {
    const seen = new Set();
    const out = [];
    for (const node of nodes) {
      const id =
        node.getAttribute("data-review-id") ||
        node.querySelector("[data-review-id]")?.getAttribute("data-review-id") ||
        "";
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);

      const author =
        node.querySelector(".d4r55, .TSUbDb, [class*='fontTitleSmall']")?.textContent?.trim() || "";
      const ratingLabel =
        node.querySelector('[role="img"][aria-label]')?.getAttribute("aria-label") ||
        node.querySelector("span.kvMYJc")?.getAttribute("aria-label") ||
        "";
      const body =
        node.querySelector(".wiI7pd, .MyEned, [class*='fontBodyMedium']")?.textContent?.trim() || "";
      const dateText =
        node.querySelector(".rsqaWe, .DU9Pgb")?.textContent?.trim() || "";

      if (!author || !body) continue;
      out.push({ external_id: id || null, author, ratingLabel, body, dateText });
    }
    return out;
  });
}

/** Force the Google UI into English (hl=en) so tab/button labels are stable. */
function withEnglish(url) {
  try {
    const u = new URL(url);
    u.searchParams.set("hl", "en");
    return u.toString();
  } catch {
    return url;
  }
}

async function main() {
  const url = withEnglish(process.argv[2] || DEFAULT_URL);
  const headful = process.env.HEADFUL === "1";
  console.log(`Opening: ${url}`);

  const browser = await chromium.launch({ headless: !headful });
  const page = await browser.newPage({
    locale: "en-US",
    viewport: { width: 1280, height: 900 },
  });

  // Short-link (maps.app.goo.gl) redirects; after it settles, hl may be lost —
  // re-assert English once we're on the final maps URL.
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Consent screens (EU). Google sometimes renders these inside a nested
  // iframe, so check every frame, not just the main page. de = "Alle akzeptieren".
  const consentLabels = [
    "Accept all",
    "Alle akzeptieren",
    "Tümünü kabul et",
    "Tout accepter",
    "Принять все",
    "Reject all",
    "Alle ablehnen",
  ];
  for (const frame of page.frames()) {
    for (const name of consentLabels) {
      const b = frame.getByRole("button", { name: new RegExp(name, "i") }).first();
      if (await b.count().catch(() => 0)) {
        await b.click().catch(() => {});
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  await clickReviewsTab(page);
  await page.waitForTimeout(2000);

  let scrollable = await getScrollable(page);
  if (!scrollable) {
    console.warn("Could not find the reviews scroll pane. Run with HEADFUL=1 to inspect.");
  }

  // Scroll until the count stops growing.
  let stable = 0;
  let lastCount = 0;
  for (let i = 0; i < 400 && stable < 8; i++) {
    // The scroll pane only materializes once reviews render; retry to find it.
    if (!scrollable) scrollable = await getScrollable(page);

    if (scrollable) {
      await scrollable
        .evaluate((el) => el.scrollBy(0, el.scrollHeight))
        .catch(() => {});
    } else {
      // Fallback: hover a card so the wheel scrolls the list, not the map.
      const card = page.locator("div[data-review-id], div.jftiEf").last();
      await card.hover().catch(() => {});
      await page.mouse.wheel(0, 5000);
    }
    await page.waitForTimeout(900);

    // Periodically expand truncated bodies as they load.
    if (i % 5 === 0) await expandMoreButtons(page);

    const current = await page.locator("div[data-review-id], div.jftiEf").count().catch(() => 0);
    if (current === lastCount) stable++;
    else stable = 0;
    lastCount = current;
    if (i % 5 === 0) console.log(`  ...loaded ~${current} reviews`);
  }

  await expandMoreButtons(page);
  await page.waitForTimeout(800);

  const raw = await extractReviews(page);
  console.log(`Extracted ${raw.length} reviews.`);

  const reviews = raw.map((r) => ({
    external_id: r.external_id,
    author: r.author,
    rating: parseRating(r.ratingLabel),
    body: r.body,
    source_label: "Google",
    source_lang: guessLang(r.body),
    // date left null; Google shows relative dates ("2 months ago") that are
    // not reliably parseable. Admin can ignore or set later.
    review_date: null,
  }));

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(reviews, null, 2), "utf8");
  console.log(`Wrote ${reviews.length} reviews → ${OUT}`);
  console.log("Next: paste this JSON into Admin → Yorumlar → Toplu Ekle.");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
