import { useState } from "react";
import { uploadTourImage, type TourInput, type TourRow } from "@/hooks/useTours";
import type { Tour, TourStatus } from "@/content/tours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocalizedField } from "./LocalizedFields";
import {
  emptyForm,
  formToInput,
  rowToForm,
  validateForm,
  type TourFormState,
} from "./tour-form-state";

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

  const set = <K extends keyof TourFormState>(key: K, value: TourFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

      {/* 4 dilli içerik */}
      <div className="space-y-5 border-t border-teal/10 pt-5">
        <LocalizedField label="Başlık" value={form.title} onChange={(v) => set("title", v)} hint="Boş bırakılan diller Türkçe metni kullanır." />
        <LocalizedField label="Slogan" value={form.tagline} onChange={(v) => set("tagline", v)} multiline rows={2} />
        <LocalizedField label="Açıklama (uzun tanıtım, ops.)" value={form.description} onChange={(v) => set("description", v)} multiline rows={4} />
        <LocalizedField label="Öne çıkanlar" value={form.highlightsText} onChange={(v) => set("highlightsText", v)} multiline rows={4} hint="Her satır bir madde." />
        <LocalizedField label="Dahil olanlar" value={form.includedText} onChange={(v) => set("includedText", v)} multiline rows={4} hint="Her satır bir madde." />
        <LocalizedField label="Neden bizi seçmelisiniz (ops.)" value={form.whyChooseText} onChange={(v) => set("whyChooseText", v)} multiline rows={4} hint="Her satır bir madde. Ana sayfadaki 'Neden Bizi Seçmelisiniz?' bölümü ilk dolu turdan beslenir." />
        {form.isMultiDay ? (
          <>
            <LocalizedField label="Grup büyüklüğü (ops.)" value={form.groupSize} onChange={(v) => set("groupSize", v)} hint='Örn. "min 6, max 12 kişi".' />
            <LocalizedField label="Dahil olmayanlar (ops.)" value={form.notIncludedText} onChange={(v) => set("notIncludedText", v)} multiline rows={4} hint="Her satır bir madde." />
            <LocalizedField label="Gün gün program (ops.)" value={form.dayByDayText} onChange={(v) => set("dayByDayText", v)} multiline rows={6} hint='Her satır bir gün: "gün | başlık | açıklama | mesafe". Mesafe isteğe bağlıdır.' />
          </>
        ) : (
          <LocalizedField label="Tur programı (ops.)" value={form.itineraryText} onChange={(v) => set("itineraryText", v)} multiline rows={6} hint='Her satır bir adım: "ikon | başlık | açıklama". İkon için emoji kullanın (örn. 🛶).' />
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
