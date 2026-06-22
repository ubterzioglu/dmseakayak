import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchGalleryImages,
  saveGalleryImage,
  deleteGalleryImage,
  uploadGalleryImage,
  type GalleryRow,
} from "@/hooks/useAdminContent";
import { useConfirm } from "@/hooks/useConfirm";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { AdminEmptyState, AdminSurface } from "./admin-ui";

export default function GalleryPanel() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form state
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");
  const [published, setPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchGalleryImages());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditId(undefined);
    setFile(null);
    setImageUrl(null);
    setCaption("");
    setAlt("");
    setPublished(true);
    setSortOrder(0);
  };

  const handleEdit = (g: GalleryRow) => {
    setEditId(g.id);
    setFile(null);
    setImageUrl(g.image_url);
    setCaption(g.caption ?? "");
    setAlt(g.alt ?? "");
    setPublished(g.published);
    setSortOrder(g.sort_order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file && !imageUrl) return setError("Bir fotoğraf seçin.");

    setSubmitting(true);
    try {
      let finalUrl = imageUrl;
      if (file) finalUrl = await uploadGalleryImage(file);
      if (!finalUrl) throw new Error("Görsel yüklenemedi.");
      await saveGalleryImage(
        {
          image_url: finalUrl,
          caption: caption.trim() || null,
          alt: alt.trim() || caption.trim() || null,
          published,
          sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        },
        editId,
      );
      toast.success(editId ? "Fotoğraf güncellendi." : "Fotoğraf kaydedildi.");
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      toast.error("Fotoğraf kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Bu fotoğraf silinsin mi?",
      description: "Bu işlem geri alınamaz.",
      confirmLabel: "Sil",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteGalleryImage(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Fotoğraf silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      toast.error("Fotoğraf silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const preview = useObjectUrl(file, imageUrl);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <AdminSurface
          title={editId ? "Fotoğrafı düzenle" : "Yeni fotoğraf"}
          description="Görsel yükleyin, metin alanlarını düzenleyin ve yayın görünürlüğünü kontrol edin."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Fotoğraf</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              {preview && (
                <img
                  src={preview}
                  alt="önizleme"
                  className="mt-3 h-48 w-full rounded-[24px] object-cover"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Başlık / Açıklama (foto üzerinde görünür)
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="örn. Kekova Batık Şehir"
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Alt metin (SEO/erişilebilirlik) — boşsa başlık kullanılır
              </label>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Sıra (küçük = önce)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-teal-deep">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Yayınla (işaretsiz = gizli)
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
              >
                {submitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-teal/20 px-6 py-3 font-semibold text-teal hover:bg-foam"
              >
                Temizle / Yeni
              </button>
            </div>
          </form>
        </AdminSurface>

        <AdminSurface
          title={`${items.length} fotoğraf`}
          description="Galeri kartları görünürlük ve sıra bilgisini anında gösterir."
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
              title="Henüz fotoğraf yok"
              description="İlk görsel eklendiğinde burada yayın durumu ve sıralamasıyla birlikte listelenecek."
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((g) => (
              <div
                key={g.id}
                className="overflow-hidden rounded-[24px] border border-teal/10 bg-[#fcfbf8] shadow-[0_12px_34px_rgba(4,43,37,0.05)]"
              >
                <div className="relative">
                  <img src={g.image_url} alt={g.alt ?? ""} className="h-40 w-full object-cover" />
                  {!g.published && (
                    <span className="absolute right-3 top-3 rounded-full bg-orange px-2.5 py-1 text-[10px] font-bold text-white">
                      Gizli
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="truncate text-sm font-semibold text-teal-deep">
                    {g.caption || <span className="text-teal/40">— başlıksız —</span>}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-teal/45">
                    Sıra {g.sort_order}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(g)}
                      className="rounded-full border border-teal/20 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-foam"
                    >
                      Düzenle
                    </button>
                    <button
                      disabled={busyId === g.id}
                      onClick={() => void handleDelete(g.id)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>
      {dialog}
    </div>
  );
}
