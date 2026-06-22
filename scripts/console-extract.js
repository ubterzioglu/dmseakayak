/* ============================================================================
   GOOGLE MAPS YORUM ÇIKARICI — TARAYICI KONSOLU İÇİN
   ----------------------------------------------------------------------------
   KULLANIM:
   1. Google Maps'te işletme sayfasını aç, "Yorumlar / Rezensionen" sekmesine geç.
   2. Yorum listesini EN ALTA kadar elle kaydır (yeni yorum gelmeyene dek).
   3. Mümkünse her yorumdaki "Daha fazla / Mehr / More" linklerine bas
      (ya da aşağıdaki kod bunu kendi de dener).
   4. F12 > Console. Bu dosyanın TAMAMINI yapıştır, Enter'a bas.
   5. JSON panoya kopyalanır + konsola yazılır. Admin > Yorumlar > Toplu Ekle'ye yapıştır.
   ========================================================================== */
(() => {
  // "Daha fazla" linklerini aç (kesik yorumları tam metne çevir).
  document
    .querySelectorAll(
      'button[aria-label*="More"],button[aria-label*="Mehr"],button[aria-label*="Daha fazla"],' +
        'button[jsaction*="review.expandReview"]',
    )
    .forEach((b) => {
      try { b.click(); } catch {}
    });

  const seen = new Set();
  const out = [];
  const cards = document.querySelectorAll("div[data-review-id], div.jftiEf");

  cards.forEach((node) => {
    const id =
      node.getAttribute("data-review-id") ||
      node.querySelector("[data-review-id]")?.getAttribute("data-review-id") ||
      "";
    if (id && seen.has(id)) return;
    if (id) seen.add(id);

    const author =
      node.querySelector(".d4r55, .TSUbDb, [class*='fontTitleSmall']")?.textContent?.trim() || "";

    const ratingLabel =
      node.querySelector('[role="img"][aria-label]')?.getAttribute("aria-label") ||
      node.querySelector("span.kvMYJc")?.getAttribute("aria-label") ||
      "";
    const ratingMatch = ratingLabel.match(/\d+/);
    const rating = ratingMatch ? Math.min(5, Math.max(1, +ratingMatch[0])) : 5;

    const body =
      node.querySelector(".wiI7pd, .MyEned, [class*='fontBodyMedium']")?.textContent?.trim() || "";

    if (!author || !body) return;

    // Basit dil tahmini (tr/en/fr/ru; desteklenmeyen diller -> en).
    const t = body.toLowerCase();
    let source_lang = "en";
    if (/[ğş]|ı\b/.test(t) || /\b(çok|harika|tekne|rehber|deneyim|teşekkür|gezi)\b/.test(t)) source_lang = "tr";
    else if (/[а-яё]/.test(t)) source_lang = "ru";
    else if (/\b(très|était|nous avons|magnifique|expérience|génial|merci)\b/.test(t)) source_lang = "fr";

    out.push({
      external_id: id || null,
      author,
      rating,
      body,
      source_label: "Google",
      source_lang,
      review_date: null,
    });
  });

  const json = JSON.stringify(out, null, 2);
  console.log(`%c${out.length} yorum çıkarıldı. JSON panoya kopyalanıyor...`, "color:#0a0;font-weight:bold");
  console.log(json);
  try {
    copy(json); // Chrome/Edge konsolunda panoya kopyalar
    console.log("%c✔ Panoya kopyalandı! Admin > Yorumlar > Toplu Ekle'ye yapıştır.", "color:#0a0;font-weight:bold");
  } catch {
    console.log("Panoya kopyalanamadı — yukarıdaki JSON'u elle seçip kopyala.");
  }
  return out.length;
})();
