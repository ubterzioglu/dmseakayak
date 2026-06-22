// Geçici tanılama: gerçek Maps DOM yapısını inceler (selector tespiti için).
import { chromium } from "playwright";

const URL = process.argv[2] || "https://maps.app.goo.gl/pDn4HTyraEKg5Buh8";
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ locale: "en-US", viewport: { width: 1280, height: 900 } });
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);

for (const name of ["Accept all", "Tümünü kabul et", "Alle akzeptieren", "Tout accepter"]) {
  const b = page.getByRole("button", { name: new RegExp(name, "i") }).first();
  if (await b.count().catch(() => 0)) { await b.click().catch(() => {}); await page.waitForTimeout(1500); break; }
}

// Yorumlar sekmesi: tüm tab/buton etiketlerini dök.
const tabs = await page.$$eval('button[role="tab"], [role="tab"]', (els) =>
  els.map((e) => e.getAttribute("aria-label") || e.textContent?.trim()).filter(Boolean));
console.log("TABS:", JSON.stringify(tabs));

// Yorumlar sekmesine geç.
for (const label of ["Reviews", "Yorumlar", "Rezensionen", "Avis"]) {
  const btn = page.getByRole("tab", { name: new RegExp(label, "i") }).first();
  if (await btn.count().catch(() => 0)) { await btn.click().catch(() => {}); await page.waitForTimeout(2500); break; }
}

// Scroll edilebilir aday panelleri: aria-label + ilk class.
const panes = await page.$$eval('div[role="feed"], div[tabindex], div.m6QErb', (els) =>
  els.slice(0, 12).map((e) => ({
    cls: e.className?.toString().slice(0, 60),
    role: e.getAttribute("role"),
    aria: (e.getAttribute("aria-label") || "").slice(0, 40),
    scrollH: e.scrollHeight, clientH: e.clientHeight,
    scrollable: e.scrollHeight > e.clientHeight + 50,
  })));
console.log("PANES:", JSON.stringify(panes, null, 2));

// Yorum kartı adayları: data-review-id taşıyan veya jftiEf class'lı kaç düğüm var.
const cardCounts = {};
for (const sel of ["div[data-review-id]", "div.jftiEf", "div.GHT2ce", "[data-review-id]"]) {
  cardCounts[sel] = await page.locator(sel).count().catch(() => 0);
}
console.log("CARD_COUNTS:", JSON.stringify(cardCounts));

// "Daha fazla / More" buton etiketleri.
const moreLabels = await page.$$eval("button", (els) =>
  [...new Set(els.map((e) => e.getAttribute("aria-label") || e.textContent?.trim()).filter(Boolean))]
    .filter((t) => /more|mehr|daha|plus|ещё|еще/i.test(t)).slice(0, 10));
console.log("MORE_LABELS:", JSON.stringify(moreLabels));

await page.waitForTimeout(1500);
await browser.close();
