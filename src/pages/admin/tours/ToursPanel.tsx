import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteTour,
  fetchAllTours,
  importStaticTours,
  saveTour,
  type TourInput,
  type TourRow,
} from "@/hooks/useTours";
import { useConfirm } from "@/hooks/useConfirm";
import {
  type AdminPanelProps,
  AdminCollapsible,
  AdminEmptyState,
  AdminSurface,
} from "../admin-ui";
import { TourForm } from "./TourForm";

export default function ToursPanel({ infoSlot }: AdminPanelProps) {
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState<TourRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<TourRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchAllTours());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (input: TourInput, id?: string) => {
    setSubmitting(true);
    try {
      await saveTour(input, id);
      toast.success(id ? "Tur güncellendi." : "Tur kaydedildi.");
      setEditRow(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      toast.error("Tur kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: TourRow) => {
    setEditRow(row);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row: TourRow) => {
    const ok = await confirm({
      title: `"${row.title.tr}" silinsin mi?`,
      description:
        "Bu işlem geri alınamaz. Turu geçici olarak gizlemek için silmek yerine 'Yayınla' işaretini kaldırabilirsiniz.",
      confirmLabel: "Sil",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(row.id);
    try {
      await deleteTour(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (editRow?.id === row.id) setEditRow(null);
      toast.success("Tur silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      toast.error("Tur silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const handleImport = async () => {
    const ok = await confirm({
      title: "Statik turlar içe aktarılsın mı?",
      description:
        "Koddaki hazır turlardan panelde olmayanlar (slug'a göre) eklenir; mevcut kayıtlara dokunulmaz.",
      confirmLabel: "İçe aktar",
    });
    if (!ok) return;
    setImporting(true);
    try {
      const added = await importStaticTours();
      toast.success(added > 0 ? `${added} tur içe aktarıldı.` : "Tüm turlar zaten panelde.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "İçe aktarılamadı");
      toast.error("Turlar içe aktarılamadı.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {dialog}

      <AdminCollapsible
        title={editRow ? `Turu düzenle: ${editRow.title.tr}` : "Yeni tur"}
        description="Tek günlük turlar ve çok günlü ekspedisyonlar aynı formdan yönetilir."
        forceOpenSignal={editRow}
      >
        <TourForm
          key={editRow?.id ?? "new"}
          editRow={editRow}
          submitting={submitting}
          onSave={handleSave}
          onCancelEdit={() => setEditRow(null)}
        />
      </AdminCollapsible>

      {infoSlot}

      <AdminSurface
        title="Turlar"
        description="Sitede görünen sıra, her bölüm içinde 'Sıra' değerine göredir."
        actions={
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={importing}
            className="rounded-full border border-orange/30 bg-orange/5 px-4 py-2 text-[13px] font-semibold text-orange transition-colors hover:bg-orange/10 disabled:opacity-50"
          >
            {importing ? "Aktarılıyor..." : "Statik turları içe aktar"}
          </button>
        }
      >
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-teal/50">Yükleniyor...</p>}
        {!loading && rows.length === 0 && (
          <AdminEmptyState
            title="Panelde henüz tur yok"
            description="Site şu anda koddaki hazır turları gösteriyor. 'Statik turları içe aktar' ile hepsini panele taşıyıp buradan yönetmeye başlayabilirsiniz."
          />
        )}
        {rows.length > 0 && (
          <ul className="divide-y divide-teal/8">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-3 py-3">
                {row.hero_image && (
                  <img
                    src={row.hero_image}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-teal-deep">{row.title.tr}</span>
                    <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-semibold text-teal">
                      {row.is_multi_day ? "Çok günlü" : "Günübirlik"}
                    </span>
                    {!row.published && (
                      <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[11px] font-semibold text-orange">
                        Yayında değil
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-teal/55">
                    {row.slug} · Sıra: {row.sort_order}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-lg border border-teal/15 px-3 py-1.5 text-[13px] font-semibold text-teal-deep transition-colors hover:bg-foam"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row)}
                    disabled={busyId === row.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSurface>
    </div>
  );
}
