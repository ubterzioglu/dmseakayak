/**
 * Parses bulk-pasted reviews from the admin panel into structured rows.
 * Supports two input formats and never throws — returns { rows, errors }.
 */

export interface ParsedReview {
  author: string;
  rating: number;
  body: string;
  source_label: string;
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/**
 * Two accepted formats:
 *
 * 1) JSON array:
 *    [{ "author": "Ad", "rating": 5, "body": "metin", "source_label": "Google" }, ...]
 *
 * 2) Line blocks separated by "---", first line "Ad | 5", remaining lines the body:
 *    Sophie M. | 5
 *    Harika bir deneyimdi...
 *    ---
 *    James R. | 4
 *    Çok iyiydi...
 *
 * Missing rating defaults to 5. Rows without author/body are skipped with an error note.
 */
export function parseBulkReviews(raw: string): { rows: ParsedReview[]; errors: string[] } {
  const errors: string[] = [];
  const text = raw.trim();
  if (!text) return { rows: [], errors: ["Girdi boş."] };

  // --- JSON attempt ---
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const rows: ParsedReview[] = [];
      arr.forEach((raw, i) => {
        const item = (raw ?? {}) as Record<string, unknown>;
        const author = String(item.author ?? "").trim();
        const body = String(item.body ?? item.text ?? "").trim();
        const rating = clampRating(Number(item.rating ?? 5));
        if (!author || !body) {
          errors.push(`#${i + 1}: author veya body eksik, atlandı.`);
          return;
        }
        rows.push({
          author,
          body,
          rating,
          source_label: String(item.source_label ?? "Google").trim() || "Google",
        });
      });
      return { rows, errors };
    } catch (e) {
      errors.push("JSON ayrıştırılamadı: " + (e instanceof Error ? e.message : String(e)));
      return { rows: [], errors };
    }
  }

  // --- Line-block format ---
  const blocks = text
    .split(/^\s*---\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean);
  const rows: ParsedReview[] = [];
  blocks.forEach((block, i) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    const [head, ...rest] = lines;
    const [authorPart, ratingPart] = head.split("|").map((s) => s.trim());
    const author = authorPart ?? "";
    const rating = clampRating(Number(ratingPart ?? 5));
    const body = rest.join(" ").trim();
    if (!author || !body) {
      errors.push(`Blok #${i + 1}: ad veya metin eksik, atlandı.`);
      return;
    }
    rows.push({ author, body, rating, source_label: "Google" });
  });
  if (!rows.length) errors.push("Hiç geçerli yorum bulunamadı.");
  return { rows, errors };
}
