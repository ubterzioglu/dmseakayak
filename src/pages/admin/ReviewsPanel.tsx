import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchReviews,
  saveReview,
  deleteReview,
  insertReviews,
  fetchReviewTranslations,
  saveReviewTranslation,
  triggerTranslateReviews,
  REVIEW_LANGS,
  type ReviewRow,
  type ReviewStatus,
  type ReviewLang,
  type ReviewTranslationRow,
} from "@/hooks/useAdminContent";
import { parseBulkReviews } from "@/lib/parseReviews";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminEmptyState, AdminSurface } from "./admin-ui";

interface FormState {
  id?: string;
  author: string;
  rating: number;
  body: string;
  source_label: string;
  status: ReviewStatus;
  sort_order: number;
  source_lang: ReviewLang;
}

const EMPTY: FormState = {
  author: "",
  rating: 5,
  body: "",
  source_label: "",
  status: "published",
  sort_order: 0,
  source_lang: "en",
};

const LANG_LABEL: Record<ReviewLang, string> = {
  tr: "Türkçe",
  en: "English",
  fr: "Français",
  ru: "Русский",
};

// ─── Per-review translation editor ─────────────────────────────────────────────

function TranslationEditor({
  review,
  translations,
  onSaved,
  onRetranslate,
  retranslating,
}: {
  review: ReviewRow;
  translations: ReviewTranslationRow[];
  onSaved: () => void;
  onRetranslate: () => void;
  retranslating: boolean;
}) {
  const [active, setActive] = useState<ReviewLang>(review.source_lang);
  const byLang = new Map(translations.map((t) => [t.lang, t]));
  const current = byLang.get(active);
  const [draft, setDraft] = useState(current?.body ?? "");
  const [saving, setSaving] = useState(false);

  // Reset the draft whenever the selected language or its stored body changes.
  useEffect(() => {
    setDraft(byLang.get(active)?.body ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, translations]);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await saveReviewTranslation(review.id, active, draft.trim());
      toast.success(`${LANG_LABEL[active]} çevirisi kaydedildi.`);
      onSaved();
    } catch (e) {
      toast.error("Çeviri kaydedilemedi: " + (e instanceof Error ? e.message : "bilinmeyen hata"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-teal/5 pt-3">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {REVIEW_LANGS.map((lang) => {
          const tr = byLang.get(lang);
          return (
            <button
              key={lang}
              onClick={() => setActive(lang)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                active === lang
                  ? "bg-teal text-white"
                  : tr
                    ? "border border-teal/20 text-teal hover:bg-foam"
                    : "border border-dashed border-teal/20 text-teal/40"
              }`}
              title={tr ? (tr.is_machine ? "Makine çevirisi" : "Elle düzenlendi") : "Çeviri yok"}
            >
              {lang.toUpperCase()}
              {lang === review.source_lang ? " ★" : ""}
              {tr && !tr.is_machine ? " ✎" : ""}
            </button>
          );
        })}
        <button
          onClick={onRetranslate}
          disabled={retranslating}
          className="ml-auto rounded-full border border-orange/30 px-3 py-1 text-xs font-semibold text-orange hover:bg-orange/5 disabled:opacity-50"
        >
          {retranslating ? "Çevriliyor..." : "Yeniden Çevir"}
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder={`${LANG_LABEL[active]} çevirisi henüz yok — yazıp kaydedin veya "Yeniden Çevir"e basın.`}
        className="w-full rounded-xl border border-teal/15 p-2.5 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
      />
      <button
        onClick={() => void handleSave()}
        disabled={saving || !draft.trim()}
        className="mt-2 rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-light disabled:opacity-50"
      >
        {saving ? "Kaydediliyor..." : `${LANG_LABEL[active]} kaydet`}
      </button>
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export default function ReviewsPanel() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [translations, setTranslations] = useState<ReviewTranslationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulk, setBulk] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [translateAllBusy, setTranslateAllBusy] = useState(false);
  const [translateMsg, setTranslateMsg] = useState("");
  const [retranslateId, setRetranslateId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchReviews();
      setItems(rows);
      setTranslations(await fetchReviewTranslations(rows.map((r) => r.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await saveReview(
        {
          author: form.author.trim(),
          rating: form.rating,
          body: form.body.trim(),
          source_label: form.source_label.trim() || null,
          status: form.status,
          sort_order: form.sort_order,
          source_lang: form.source_lang,
        },
        form.id,
      );
      toast.success(form.id ? "Yorum güncellendi." : "Yorum kaydedildi.");
      setForm(EMPTY);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      toast.error("Yorum kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r: ReviewRow) => {
    setForm({
      id: r.id,
      author: r.author,
      rating: r.rating,
      body: r.body,
      source_label: r.source_label ?? "",
      status: r.status,
      sort_order: r.sort_order,
      source_lang: r.source_lang,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Bu yorum silinsin mi?",
      description: "Yorum ve çevirileri kalıcı olarak silinecek.",
      confirmLabel: "Sil",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteReview(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success("Yorum silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      toast.error("Yorum silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const handleBulkAdd = async () => {
    setBulkMsg("");
    const { rows, errors } = parseBulkReviews(bulk);
    if (!rows.length) {
      setBulkMsg("Eklenecek geçerli yorum yok. " + errors.join(" "));
      return;
    }
    setBulkBusy(true);
    try {
      await insertReviews(rows);
      setBulkMsg(
        `${rows.length} yorum eklendi (çeviri arka planda başlıyor).` +
          (errors.length ? ` (${errors.length} atlandı)` : ""),
      );
      setBulk("");
      await load();
    } catch (e) {
      setBulkMsg("Kaydedilemedi: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleTranslateAll = async () => {
    setTranslateMsg("");
    setTranslateAllBusy(true);
    try {
      const res = await triggerTranslateReviews();
      setTranslateMsg(
        `Tamamlandı: ${res.reviews} yorum, ${res.written} çeviri yazıldı, ${res.skipped} atlandı, ${res.failed} başarısız.`,
      );
      await load();
    } catch (e) {
      setTranslateMsg("Çeviri başarısız: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setTranslateAllBusy(false);
    }
  };

  const handleRetranslate = async (id: string) => {
    setRetranslateId(id);
    try {
      await triggerTranslateReviews([id]);
      setTranslations(await fetchReviewTranslations(items.map((r) => r.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çevrilemedi");
    } finally {
      setRetranslateId(null);
    }
  };

  const refreshTranslations = async () => {
    setTranslations(await fetchReviewTranslations(items.map((r) => r.id)));
  };

  const transFor = (reviewId: string) => translations.filter((t) => t.review_id === reviewId);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <AdminSurface
            title="Otomatik çeviri"
            description="Eksik dilleri topluca tamamlar; elle düzenlenen çeviriler korunur."
          >
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void handleTranslateAll()}
                disabled={translateAllBusy}
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
              >
                {translateAllBusy ? "Çevriliyor..." : "Tümünü Çevir"}
              </button>
              {translateMsg && <div className="text-sm leading-6 text-teal/70">{translateMsg}</div>}
            </div>
          </AdminSurface>

          <AdminSurface
            title="Toplu ekle"
            description="JSON dizisi ya da satır tabanlı format ile yorumları toplu içe aktarın."
          >
            <p className="mb-3 text-xs leading-6 text-teal/60">
              Google Maps kazıyıcısının ürettiği JSON dizisini (
              <code>scripts/output/reviews.json</code>) buraya yapıştırın. Satır biçimi de desteklenir:
              ilk satır <code>Ad | 5</code>, sonraki satır(lar) yorum metni, yorumlar arası <code>---</code>.
            </p>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={7}
              placeholder={`[{ "author": "Sophie M.", "rating": 5, "body": "...", "source_lang": "fr" }]`}
              className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] p-3 font-mono text-sm outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleBulkAdd()}
                disabled={bulkBusy}
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
              >
                {bulkBusy ? "Ekleniyor..." : "Yorumları Ekle"}
              </button>
              {bulkMsg && <span className="text-sm text-teal/70">{bulkMsg}</span>}
            </div>
          </AdminSurface>

          <AdminSurface
            title={form.id ? "Yorumu düzenle" : "Yeni yorum"}
            description="Tekil yorum girişi, sıralama ve kaynak bilgisi."
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">Yazar</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">Puan (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">Orijinal dil</label>
                  <select
                    value={form.source_lang}
                    onChange={(e) => setForm({ ...form, source_lang: e.target.value as ReviewLang })}
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                  >
                    {REVIEW_LANGS.map((l) => (
                      <option key={l} value={l}>
                        {LANG_LABEL[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-teal-deep">
                  Yorum (orijinal dilde)
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">
                    Kaynak (örn: Google, TripAdvisor)
                  </label>
                  <input
                    value={form.source_label}
                    onChange={(e) => setForm({ ...form, source_label: e.target.value })}
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">Sıra</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-teal-deep">Durum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ReviewStatus })}
                    className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                  >
                    <option value="published">Yayında</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(EMPTY)}
                    className="rounded-full border border-teal/20 px-6 py-3 font-semibold text-teal hover:bg-foam"
                  >
                    İptal / Yeni
                  </button>
                )}
              </div>
            </form>
          </AdminSurface>
        </div>

        <AdminSurface
          title={`${items.length} yorum`}
          description="Yorumlar, çeviri kapsamı ve yayın durumu ile birlikte kartlar halinde listelenir."
          actions={
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full border border-teal/20 px-4 py-2 text-sm font-semibold text-teal hover:bg-foam disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>
          }
        >
          {!loading && items.length === 0 && (
            <AdminEmptyState
              title="Henüz yorum yok"
              description="Yeni yorumlar ya da toplu içe aktarılan kayıtlar burada çeviri bilgileriyle birlikte listelenecek."
            />
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((r) => {
              const trs = transFor(r.id);
              const isOpen = expanded === r.id;
              return (
                <div
                  key={r.id}
                  className="rounded-[24px] border border-teal/10 bg-[#fcfbf8] p-5 shadow-[0_12px_34px_rgba(4,43,37,0.05)]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-semibold text-teal-deep">{r.author}</span>
                    <span className="text-sm text-orange">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mb-3 text-sm leading-7 text-teal/80">{r.body}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-teal/50">
                    {r.source_label && <span>{r.source_label}</span>}
                    <span className="rounded-full bg-foam px-2 py-0.5 font-bold text-teal">
                      {(r.source_lang ?? "—").toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-bold ${
                        r.status === "published" ? "bg-teal/15 text-teal" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {r.status === "published" ? "Yayında" : "Arşiv"}
                    </span>
                    <span>{trs.length}/4 dil</span>
                    <span>sıra: {r.sort_order}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      className="rounded-full border border-teal/20 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-foam"
                    >
                      {isOpen ? "Çevirileri gizle" : "Çeviriler"}
                    </button>
                    <button
                      onClick={() => handleEdit(r)}
                      className="rounded-full border border-teal/20 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-foam"
                    >
                      Düzenle
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => void handleDelete(r.id)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      Sil
                    </button>
                  </div>

                  {isOpen && (
                    <TranslationEditor
                      review={r}
                      translations={trs}
                      onSaved={() => void refreshTranslations()}
                      onRetranslate={() => void handleRetranslate(r.id)}
                      retranslating={retranslateId === r.id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </AdminSurface>
      </div>
      {dialog}
    </div>
  );
}
