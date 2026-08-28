import { useState } from "react";
import { uploadTourImage, type TourInput, type TourRow } from "@/hooks/useTours";
import type { Localized, Tour, TourStatus } from "@/content/tours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocalizedField, translateFromTurkish } from "./LocalizedFields";
import { TRANSLATION_TARGETS_LABEL } from "@/lib/localized";
import {
  emptyForm,
  formToInput,
  rowToForm,
  validateForm,
  type TourFormState,
} from "./tour-form-state";

/** Localized<string> fields on TourFormState, paired with whether they hold
 * multiline list-style text (one item per line) and, for "a | b | c" lines,
 * which segment indices hold translatable text (icons/day numbers/distances
 * pass through untouched). */
const LOCALIZED_FIELDS: { key: keyof TourFormState; multiline: boolean; pipeSegments?: number[] }[] = [
  { key: "title", multiline: false },
  { key: "tagline", multiline: true },
  { key: "description", multiline: true },
  { key: "highlightsText", multiline: true },
  { key: "includedText", multiline: true },
  { key: "whyChooseText", multiline: true },
  { key: "itineraryText", multiline: true, pipeSegments: [1, 2] }, // ikon | başlık | açıklama
  { key: "groupSize", multiline: false },
  { key: "notIncludedText", multiline: true },
  { key: "dayByDayText", multiline: true, pipeSegments: [1, 2] }, // gün | başlık | açıklama | mesafe
];

interface TourFormProps {
  /** Row being edited; null = create form. Remount (key) on change. */
  editRow: TourRow | null;
  submitting: boolean;
  onSave: (input: TourInput, id?: string) => Promise<void>;
  onCancelEdit: () => void;
}

const SELECT_CLASS =
  "w-full rounded-xl border border-teal/15 bg-white px-4 py-2.5 text-base outline-none focus:border-orange focus:ring-2 focus:ring-orange/20";

export function TourForm({ editRow, submitting, onSave, onCancelEdit }: TourFormProps) {
  const [form, setForm] = useState<TourFormState>(() =>
    editRow ? rowToForm(editRow) : emptyForm(),
  );
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [translatingAll, setTranslatingAll] = useState(false);

  const set = <K extends keyof TourFormState>(key: K, value: TourFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Fills every localized field's non-Turkish languages from its Turkish
   * text, skipping fields left empty in Turkish. Overwrites any existing
   * translations. The target set follows LOCALES — see TARGET_LOCALES in
   * LocalizedFields.tsx. */
  const handleTranslateAll = async () => {
    if (translatingAll) return;
    setTranslatingAll(true);
    setError("");
    try {
      let updated = form;
      let failures = 0;
      for (const { key, multiline, pipeSegments } of LOCALIZED_FIELDS) {
        const current = updated[key] as Localized<string>;
        if (!current.tr.trim()) continue;
        const result = await translateFromTurkish(current.tr, multiline, pipeSegments);
        if (!result) {
          failures++;
          continue;
        }
        updated = { ...updated, [key]: { ...current, ...result } };
      }
      setForm(updated);
      if (failures > 0) {
        setError(
          `${failures} alan çevrilemedi. Diğerleri güncellendi. Biraz sonra tekrar deneyin; ` +
            `sorun sürerse bize bildirin — çeviri servisinin aylık kotası dolmuş olabilir.`,
        );
      }
    } finally {
      setTranslatingAll(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "hero" | "gallery",
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadTourImage(file);
      if (target === "hero") {
        set("heroImage", url);
      } else {
        set("galleryText", form.galleryText ? `${form.galleryText}\n${url}` : url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    await onSave(formToInput(form), editRow?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel bilgiler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="tour-slug">Slug (web adresi)</Label>
          <Input
            id="tour-slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="kekova-classic"
          />
        </div>
        <div>
          <Label htmlFor="tour-level">Seviye</Label>
          <select
            id="tour-level"
            className={SELECT_CLASS}
            value={form.level}
            onChange={(e) => set("level", e.target.value as Tour["level"])}
          >
            <option value="beginner">Başlangıç dostu</option>
            <option value="intermediate-advanced">Orta / İleri seviye</option>
          </select>
        </div>
        <div>
          <Label htmlFor="tour-sort">Sıra</Label>
          <Input
            id="tour-sort"
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
        </div>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-teal-deep">
            <input
              type="checkbox"
              checked={form.isMultiDay}
              onChange={(e) => set("isMultiDay", e.target.checked)}
            />
            Çok günlü tur
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-teal-deep">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Yayınla
          </label>
        </div>
      </div>

      {/* Fiyat + rota bilgileri */}
      {form.isMultiDay ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="md-days">Gün sayısı</Label>
            <Input id="md-days" type="number" value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="md-nights">Gece sayısı</Label>
            <Input id="md-nights" type="number" value={form.nights} onChange={(e) => set("nights", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="md-price">Kişi başı fiyat (€)</Label>
            <Input id="md-price" value={form.pricePerPersonEur} onChange={(e) => set("pricePerPersonEur", e.target.value)} placeholder="Boş = talep üzerine" />
          </div>
          <div>
            <Label htmlFor="md-supplement">Tek kişi farkı (€)</Label>
            <Input id="md-supplement" value={form.singleSupplementEur} onChange={(e) => set("singleSupplementEur", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="md-status">Durum</Label>
            <select
              id="md-status"
              className={SELECT_CLASS}
              value={form.status}
              onChange={(e) => set("status", e.target.value as TourStatus)}
            >
              <option value="final">Final</option>
              <option value="draft">Taslak rota</option>
              <option value="special">Özel seans</option>
            </select>
          </div>
          <div>
            <Label htmlFor="md-external">Özel detay sayfası (ops.)</Label>
            <Input id="md-external" value={form.externalDetailPath} onChange={(e) => set("externalDetailPath", e.target.value)} placeholder="trak" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="md-dates">Tur tarihleri (her satır bir tarih)</Label>
            <Textarea id="md-dates" rows={3} value={form.datesText} onChange={(e) => set("datesText", e.target.value)} placeholder="22-29 May 2026" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="tour-price">Fiyat / yemek hariç (€)</Label>
            <Input id="tour-price" value={form.priceEur} onChange={(e) => set("priceEur", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tour-price-meal">Yemek dahil fiyat (€)</Label>
            <Input id="tour-price-meal" value={form.priceWithMealEur} onChange={(e) => set("priceWithMealEur", e.target.value)} placeholder="Boş = tek fiyat" />
          </div>
          <div>
            <Label htmlFor="tour-price-kalkan">Kalkan fiyatı (€)</Label>
            <Input id="tour-price-kalkan" value={form.priceFromKalkanEur} onChange={(e) => set("priceFromKalkanEur", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tour-distance">Mesafe (km)</Label>
            <Input id="tour-distance" value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tour-hiking">Yürüyüş (km)</Label>
            <Input id="tour-hiking" value={form.hikingKm} onChange={(e) => set("hikingKm", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tour-departure">Kalkış saati</Label>
            <Input id="tour-departure" value={form.departure} onChange={(e) => set("departure", e.target.value)} placeholder="07:30" />
          </div>
          <div>
            <Label htmlFor="tour-arrival">Dönüş saati</Label>
            <Input id="tour-arrival" value={form.arrival} onChange={(e) => set("arrival", e.target.value)} placeholder="14:30 / 15:00" />
          </div>
          <div>
            <Label htmlFor="tour-route">Rota durakları (satır başına bir)</Label>
            <Textarea id="tour-route" rows={3} value={form.routeStopsText} onChange={(e) => set("routeStopsText", e.target.value)} placeholder={"Üçağız (Theimussa)\nKekova Island"} />
          </div>
        </div>
      )}

      {/* Görseller */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tour-hero">Kapak görseli (URL)</Label>
          <Input id="tour-hero" value={form.heroImage} onChange={(e) => set("heroImage", e.target.value)} placeholder="/images/tours/... veya https://..." />
          <label className="mt-1.5 inline-block text-xs font-semibold text-orange">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageUpload(e, "hero")} />
            {uploading ? "Yükleniyor..." : "Bilgisayardan yükle"}
          </label>
          {form.heroImage && (
            <img src={form.heroImage} alt="Kapak önizleme" className="mt-2 h-24 w-40 rounded-xl object-cover" />
          )}
        </div>
        <div>
          <Label htmlFor="tour-gallery">Galeri görselleri (satır başına bir URL)</Label>
          <Textarea id="tour-gallery" rows={4} value={form.galleryText} onChange={(e) => set("galleryText", e.target.value)} />
          <label className="mt-1.5 inline-block text-xs font-semibold text-orange">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageUpload(e, "gallery")} />
            {uploading ? "Yükleniyor..." : "Bilgisayardan ekle"}
          </label>
        </div>
      </div>

      {/* Çok dilli içerik — dil listesi LOCALES'ten gelir */}
      <div className="space-y-5 border-t border-teal/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange/20 bg-orange/5 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-teal-deep">Otomatik çeviri</div>
            <p className="text-xs leading-5 text-teal/60">
              Türkçe alanları tek tuşla {TRANSLATION_TARGETS_LABEL}'ye çevirir (mevcut çevirilerin üzerine
              yazar). Hata alırsanız biraz sonra tekrar deneyin; sorun sürerse bize bildirin —
              çeviri servisinin aylık kotası dolmuş olabilir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleTranslateAll()}
            disabled={translatingAll || !form.title.tr.trim()}
            className="shrink-0 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
          >
            {translatingAll ? "Çevriliyor..." : "Türkçeden Tümünü Çevir"}
          </button>
        </div>
        <LocalizedField label="Başlık" value={form.title} onChange={(v) => set("title", v)} hint="Boş bırakılan diller Türkçe metni kullanır." />
        <LocalizedField label="Slogan" value={form.tagline} onChange={(v) => set("tagline", v)} multiline rows={2} />
        <LocalizedField label="Açıklama (uzun tanıtım, ops.)" value={form.description} onChange={(v) => set("description", v)} multiline rows={4} />
        <LocalizedField label="Öne çıkanlar" value={form.highlightsText} onChange={(v) => set("highlightsText", v)} multiline rows={4} hint="Her satır bir madde." />
        <LocalizedField label="Dahil olanlar" value={form.includedText} onChange={(v) => set("includedText", v)} multiline rows={4} hint="Her satır bir madde." />
        <LocalizedField label="Neden bizi seçmelisiniz (ops.)" value={form.whyChooseText} onChange={(v) => set("whyChooseText", v)} multiline rows={4} hint="Her satır bir madde. Not: Ana sayfadaki ve Hakkımızda sayfasındaki 'Neden Bizi Seçmelisiniz?' bölümü artık sabit metinden gelir; bu alan şu an sitede gösterilmiyor." />
        {form.isMultiDay ? (
          <>
            <LocalizedField label="Grup büyüklüğü (ops.)" value={form.groupSize} onChange={(v) => set("groupSize", v)} hint='Örn. "min 6, max 12 kişi".' />
            <LocalizedField label="Dahil olmayanlar (ops.)" value={form.notIncludedText} onChange={(v) => set("notIncludedText", v)} multiline rows={4} hint="Her satır bir madde." />
            <LocalizedField label="Gün gün program (ops.)" value={form.dayByDayText} onChange={(v) => set("dayByDayText", v)} multiline rows={6} hint='Her satır bir gün: "gün | başlık | açıklama | mesafe". Mesafe isteğe bağlıdır.' pipeSegments={[1, 2, 3]} />
          </>
        ) : (
          <LocalizedField label="Tur programı (ops.)" value={form.itineraryText} onChange={(v) => set("itineraryText", v)} multiline rows={6} hint='Her satır bir adım: "ikon | başlık | açıklama". İkon için emoji kullanın (örn. 🛶).' pipeSegments={[1, 2]} />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? "Kaydediliyor..." : editRow ? "Turu güncelle" : "Turu kaydet"}
        </Button>
        {editRow && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Vazgeç
          </Button>
        )}
      </div>
    </form>
  );
}
