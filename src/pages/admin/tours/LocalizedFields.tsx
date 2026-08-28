import { useState } from "react";
import type { Localized } from "@/content/tours";
import { LOCALES } from "@/lib/site";
import { TRANSLATION_TARGETS } from "@/lib/localized";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { translateTexts, type TourLang } from "@/hooks/useTours";

interface LocalizedFieldProps {
  label: string;
  value: Localized<string>;
  onChange: (next: Localized<string>) => void;
  multiline?: boolean;
  rows?: number;
  /** Format hint shown under the label (e.g. "Her satır bir madde"). */
  hint?: string;
  /** Indices of "|"-separated segments to translate per line (e.g. itinerary
   * lines "icon | title | body" → [1, 2] keeps the icon untouched). When
   * unset, each full line is translated as-is. */
  pipeSegments?: number[];
}

const TARGET_LOCALES = TRANSLATION_TARGETS as TourLang[];

/** Translates Turkish text into every other site language. Multiline values
 * are split into lines so list-style fields (one item per line) keep their
 * line structure after translation. When `pipeSegments` is given, each line
 * is treated as "a | b | c" and only the listed segment indices are sent for
 * translation — other segments (icons, day numbers, distances) pass through
 * untouched. Returns null on total failure. */
export async function translateFromTurkish(
  trText: string,
  multiline: boolean,
  pipeSegments?: number[],
): Promise<Partial<Localized<string>> | null> {
  const trimmed = trText.trim();
  if (!trimmed) return null;
  const lines = multiline ? trimmed.split("\n").map((l) => l.trim()).filter(Boolean) : [trimmed];
  if (lines.length === 0) return null;

  const rows = lines.map((line) => (pipeSegments ? line.split("|").map((p) => p.trim()) : [line]));
  const translateIdx = pipeSegments ?? [0];

  try {
    const results: Partial<Localized<string>> = {};
    for (const to of TARGET_LOCALES) {
      const items = rows.flatMap((parts) =>
        translateIdx.map((i) => ({ text: parts[i] ?? "", from: "tr" as TourLang, to })),
      );
      const translated = await translateTexts(items);
      if (items.some((it, i) => it.text && translated[i] == null)) continue;

      const perCol = translateIdx.length;
      const outLines = rows.map((parts, rowIdx) => {
        const newParts = [...parts];
        translateIdx.forEach((colIdx, j) => {
          const t = translated[rowIdx * perCol + j];
          if (t != null) newParts[colIdx] = t;
        });
        return pipeSegments ? newParts.join(" | ") : newParts[0];
      });
      results[to] = outLines.join(multiline ? "\n" : " ");
    }
    return Object.keys(results).length > 0 ? results : null;
  } catch {
    return null;
  }
}

/** One field edited in every site language; empty languages fall back to
 * Turkish when the form is saved (see tour-form-state.ts). */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
  pipeSegments,
}: LocalizedFieldProps) {
  const [translating, setTranslating] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleTranslate = async () => {
    if (!value.tr.trim() || translating) return;
    setTranslating(true);
    setFailed(false);
    try {
      const result = await translateFromTurkish(value.tr, multiline, pipeSegments);
      if (result) onChange({ ...value, ...result });
      else setFailed(true);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-teal-deep">{label}</div>
        <button
          type="button"
          onClick={() => void handleTranslate()}
          disabled={!value.tr.trim() || translating}
          title="Türkçe metni diğer dillere otomatik çevirir (elle yazdığınız metnin üzerine yazar)."
          className="shrink-0 rounded-full border border-orange/30 px-2.5 py-1 text-[11px] font-semibold text-orange transition-colors hover:bg-orange/5 disabled:opacity-40"
        >
          {translating ? "Çevriliyor..." : "TR'den çevir"}
        </button>
      </div>
      {hint && <p className="mt-0.5 text-xs leading-5 text-teal/55">{hint}</p>}
      {failed && (
        <p className="mt-0.5 text-xs leading-5 text-red-600">
          Çeviri başarısız oldu. Biraz sonra tekrar deneyin. Sorun devam ederse bunu bildirin —
          çeviri servisinin aylık kotası dolmuş veya servis geçici olarak erişilemez durumda
          olabilir.
        </p>
      )}
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {LOCALES.map((locale) => (
          <div key={locale}>
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal/40">
              {locale}
            </div>
            {multiline ? (
              <Textarea
                rows={rows}
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              />
            ) : (
              <Input
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
