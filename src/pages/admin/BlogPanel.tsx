import { useState, useEffect, useCallback, useRef } from "react";
import Quill from "quill";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import "quill/dist/quill.snow.css";
import {
  fetchBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  uploadBlogImage,
  slugify,
  type BlogPostRow,
} from "@/hooks/useAdminContent";
import { useConfirm } from "@/hooks/useConfirm";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import {
  type AdminPanelProps,
  AdminCollapsible,
  AdminEmptyState,
  AdminSurface,
} from "./admin-ui";

export default function BlogPanel({ infoSlot }: AdminPanelProps) {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form state
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const editorHost = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  // Quill init (once)
  useEffect(() => {
    if (quillRef.current || !editorHost.current) return;
    const q = new Quill(editorHost.current, {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link", "image"],
            ["clean"],
          ],
          handlers: {
            image: () => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                try {
                  const url = await uploadBlogImage(file);
                  const range = q.getSelection(true);
                  q.insertEmbed(range.index, "image", url, "user");
                  q.setSelection(range.index + 1, 0);
                } catch (e) {
                  toast.error(
                    "Görsel yüklenemedi: " + (e instanceof Error ? e.message : "bilinmeyen hata"),
                  );
                }
              };
              input.click();
            },
          },
        },
      },
    });
    quillRef.current = q;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchBlogPosts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const doResetForm = () => {
    setEditId(undefined);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setExcerpt("");
    setPublished(false);
    setCoverFile(null);
    setCoverUrl(null);
    if (quillRef.current) quillRef.current.root.innerHTML = "";
  };

  /** True when the form holds work that would be lost on reset. */
  const isDirty = () => {
    const hasText = (quillRef.current?.getText().trim().length ?? 0) > 0;
    return title.trim().length > 0 || hasText || !!coverFile;
  };

  const resetForm = async () => {
    if (
      isDirty() &&
      !(await confirm({
        title: "Form temizlensin mi?",
        description: "Kaydedilmemiş değişiklikler kaybolacak.",
        confirmLabel: "Temizle",
        destructive: true,
      }))
    ) {
      return;
    }
    doResetForm();
  };

  const handleEdit = async (p: BlogPostRow) => {
    if (editId !== p.id && isDirty()) {
      const ok = await confirm({
        title: "Başka yazıya geçilsin mi?",
        description: "Bu formdaki kaydedilmemiş değişiklikler kaybolacak.",
        confirmLabel: "Devam et",
        destructive: true,
      });
      if (!ok) return;
    }
    setEditId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setSlugTouched(true);
    setExcerpt(p.excerpt ?? "");
    setPublished(p.published);
    setCoverFile(null);
    setCoverUrl(p.cover_image_url);
    if (quillRef.current) quillRef.current.root.innerHTML = p.content_html || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = quillRef.current;
    if (!title.trim()) return setError("Başlık gerekli.");
    if (!q || q.getText().trim().length === 0) return setError("İçerik boş olamaz.");

    setSubmitting(true);
    try {
      let finalCover = coverUrl;
      if (coverFile) finalCover = await uploadBlogImage(coverFile);
      const contentHtml = DOMPurify.sanitize(q.root.innerHTML);
      await saveBlogPost(
        {
          slug: slug.trim() || slugify(title),
          title: title.trim(),
          content_html: contentHtml,
          cover_image_url: finalCover,
          excerpt: excerpt.trim() || null,
          published,
        },
        editId,
      );
      toast.success(editId ? "Yazı güncellendi." : "Yazı kaydedildi.");
      doResetForm();
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kaydedilemedi";
      setError(msg);
      toast.error("Yazı kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Bu yazı silinsin mi?",
      description: "Bu işlem geri alınamaz.",
      confirmLabel: "Sil",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteBlogPost(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Yazı silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      toast.error("Yazı silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const coverPreview = useObjectUrl(coverFile, coverUrl);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <AdminCollapsible
          defaultOpen={false}
          forceOpenSignal={editId}
          title={editId ? "Yazıyı düzenle" : "Yeni yazı"}
          description="Kapak görseli, özet ve zengin metin içeriğini tek alandan hazırlayın."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Başlık</label>
              <input
                value={title}
                onChange={(e) => handleTitle(e.target.value)}
                required
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <label className="mb-1 block text-sm font-semibold text-teal-deep">
                  Slug (URL) — başlıktan otomatik
                </label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-teal-deep">
                  Kapak Görseli
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Özet (liste/SEO)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
              />
            </div>
            {coverPreview && (
              <img src={coverPreview} alt="kapak" className="h-56 w-full rounded-[24px] object-cover" />
            )}
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-deep">İçerik</label>
              <div className="overflow-hidden rounded-[24px] border border-teal/10 bg-[#fcfbf8]">
                <div ref={editorHost} className="min-h-64 bg-[#fcfbf8]" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-teal-deep">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Yayınla (işaretsiz = taslak)
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
                onClick={() => void resetForm()}
                className="rounded-full border border-teal/20 px-6 py-3 font-semibold text-teal hover:bg-foam"
              >
                Temizle / Yeni
              </button>
            </div>
          </form>
        </AdminCollapsible>

        {infoSlot}

        <AdminSurface
          title={`${items.length} yazı`}
          description="Taslak ve yayındaki içerikleri burada hızlıca yönetin."
          actions={
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full border border-teal/20 px-4 py-2 text-sm font-semibold text-teal hover:bg-foam disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>
          }
          contentClassName="space-y-3"
        >
          {!loading && items.length === 0 && (
            <AdminEmptyState
              title="Henüz yazı yok"
              description="İlk blog yazısı kaydedildiğinde burada slug, tarih ve yayın durumu ile listelenecek."
            />
          )}

          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-[24px] border border-teal/10 bg-[#fcfbf8] p-4 shadow-[0_12px_34px_rgba(4,43,37,0.05)]"
            >
              <div className="flex flex-wrap items-center gap-3">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt="" className="h-16 w-24 rounded-xl object-cover" />
                )}
                <div className="min-w-44 flex-1">
                  <div className="font-semibold text-teal-deep">{p.title}</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-teal/45">
                    /{p.slug} · {new Date(p.created_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    p.published ? "bg-teal/15 text-teal" : "bg-orange/15 text-orange"
                  }`}
                >
                  {p.published ? "Yayında" : "Taslak"}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => void handleEdit(p)}
                  className="rounded-full border border-teal/20 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-foam"
                >
                  Düzenle
                </button>
                <button
                  disabled={busyId === p.id}
                  onClick={() => void handleDelete(p.id)}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </AdminSurface>
      </div>
      {dialog}
    </div>
  );
}
