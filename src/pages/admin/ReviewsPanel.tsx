import { useState, useEffect, useCallback } from "react";
import {
  fetchReviews,
  saveReview,
  deleteReview,
  insertReviews,
  type ReviewRow,
  type ReviewStatus,
} from "@/hooks/useAdminContent";
import { parseBulkReviews } from "@/lib/parseReviews";

interface FormState {
  id?: string;
  author: string;
  rating: number;
  body: string;
  source_label: string;
  status: ReviewStatus;
  sort_order: number;
}

const EMPTY: FormState = {
  author: "",
  rating: 5,
  body: "",
  source_label: "",
  status: "published",
  sort_order: 0,
};

export default function ReviewsPanel() {
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulk, setBulk] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchReviews());
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
        },
        form.id,
      );
      setForm(EMPTY);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu sil?")) return;
    setBusyId(id);
    try {
      await deleteReview(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
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
        `${rows.length} yorum eklendi.` + (errors.length ? ` (${errors.length} atlandı)` : ""),
      );
      setBulk("");
      await load();
    } catch (e) {
      setBulkMsg("Kaydedilemedi: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toplu ekle */}
      <div className="rounded-2xl border border-teal/10 bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-bold text-teal-deep">Toplu Ekle</h3>
        <p className="mb-2 text-xs text-teal/60">
          JSON dizi <code>{`[{ "author": "Ad", "rating": 5, "body": "..." }]`}</code> ya da satır
          biçimi: ilk satır <code>Ad | 5</code>, sonraki satır(lar) yorum metni, yorumlar arası{" "}
          <code>---</code>.
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={6}
          placeholder={`Sophie M. | 5\nHarika bir deneyimdi, kesinlikle tavsiye ederim.\n---\nJames R. | 4\nÇok keyifliydi, rehberler profesyoneldi.`}
          className="w-full rounded-xl border border-teal/15 p-3 font-mono text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleBulkAdd()}
            disabled={bulkBusy}
            className="rounded-full bg-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
          >
            {bulkBusy ? "Ekleniyor..." : "Yorumları Ekle"}
          </button>
          {bulkMsg && <span className="text-sm text-teal/70">{bulkMsg}</span>}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-teal/10 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-teal-deep">{form.id ? "Yorumu Düzenle" : "Yeni Yorum"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Yazar</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
                className="w-full rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
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
                className="w-24 rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-teal-deep">Yorum</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
              rows={3}
              className="w-full rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Kaynak (örn: Google, TripAdvisor)
              </label>
              <input
                value={form.source_label}
                onChange={(e) => setForm({ ...form, source_label: e.target.value })}
                className="w-full rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Sıra</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-24 rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Durum</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ReviewStatus })}
                className="rounded-xl border border-teal/15 px-4 py-2.5 outline-none focus:border-orange"
              >
                <option value="published">Yayında</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-orange px-6 py-2.5 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY)}
                className="rounded-full border border-teal/20 px-6 py-2.5 font-semibold text-teal hover:bg-foam"
              >
                İptal / Yeni
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-teal-deep">{items.length} yorum</h3>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-full border border-teal/20 px-4 py-1.5 text-sm font-semibold text-teal hover:bg-foam disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yenile"}
        </button>
      </div>

      {!loading && items.length === 0 && (
        <p className="py-12 text-center text-teal/50">Henüz yorum yok.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((r) => (
          <div key={r.id} className="rounded-2xl border border-teal/10 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-bold text-teal-deep">{r.author}</span>
              <span className="text-sm text-orange">{"★".repeat(r.rating)}</span>
            </div>
            <p className="mb-3 text-sm text-teal/80">{r.body}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal/50">
              {r.source_label && <span>{r.source_label}</span>}
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${
                  r.status === "published" ? "bg-teal/15 text-teal" : "bg-gray-200 text-gray-500"
                }`}
              >
                {r.status === "published" ? "Yayında" : "Arşiv"}
              </span>
              <span>sıra: {r.sort_order}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleEdit(r)}
                className="rounded-full border border-teal/20 px-3 py-1 text-xs font-semibold text-teal hover:bg-foam"
              >
                Düzenle
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => void handleDelete(r.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
