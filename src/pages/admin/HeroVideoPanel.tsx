import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchHeroVideo,
  uploadHeroVideo,
  saveHeroVideo,
  deleteHeroVideoFile,
  HERO_VIDEO_MAX_BYTES,
  type HeroVideoRow,
} from "@/hooks/useAdminContent";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { type AdminPanelProps, AdminSurface } from "./admin-ui";

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function HeroVideoPanel({ infoSlot }: AdminPanelProps) {
  const [current, setCurrent] = useState<HeroVideoRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCurrent(await fetchHeroVideo());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setError("");
    if (picked && picked.size > HERO_VIDEO_MAX_BYTES) {
      setError(
        `Video ${formatMb(HERO_VIDEO_MAX_BYTES)} MB sınırını aşıyor (seçilen dosya ${formatMb(picked.size)} MB) — lütfen sıkıştırılmış/optimize edilmiş bir dosya seçin.`,
      );
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) return setError("Bir video seçin.");
    if (file.size > HERO_VIDEO_MAX_BYTES) {
      return setError(`Video ${formatMb(HERO_VIDEO_MAX_BYTES)} MB sınırını aşıyor.`);
    }

    setSubmitting(true);
    try {
      const previousUrl = current?.video_url;
      const newUrl = await uploadHeroVideo(file);
      await saveHeroVideo(newUrl, current?.id);
      if (previousUrl) await deleteHeroVideoFile(previousUrl);
      toast.success("Hero videosu güncellendi.");
      setFile(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      toast.error("Video kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const preview = useObjectUrl(file, current?.video_url ?? null);

  return (
    <div className="space-y-6">
      <AdminSurface
        title="Hero arka plan videosu"
        description="Anasayfanın en üstünde otomatik oynayan arka plan videosunu değiştirin."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange/20 bg-orange/5 p-4 text-[13px] leading-6 text-teal-deep/80">
            Supabase ücretsiz plan sınırları: dosya başına en fazla{" "}
            <strong>{formatMb(HERO_VIDEO_MAX_BYTES)} MB</strong>, toplam depolama{" "}
            <strong>1 GB</strong>, aylık indirme (egress) kotası <strong>5 GB</strong>.
            Video her ziyaretçi sayfayı açtığında yeniden indirilebileceğinden kısa ve
            sıkıştırılmış (düşük/orta bitrate mp4) bir dosya kullanın.
          </div>

          {preview && (
            <video
              key={preview}
              src={preview}
              controls
              muted
              className="h-56 w-full rounded-[24px] bg-black object-cover"
            />
          )}
          {!preview && !loading && (
            <p className="text-sm text-teal/50">Henüz bir hero videosu yüklenmemiş.</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Yeni video seç
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !file}
              className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
            >
              {submitting ? "Yükleniyor..." : "Videoyu değiştir"}
            </button>
          </form>
        </div>
      </AdminSurface>

      {infoSlot}
    </div>
  );
}
