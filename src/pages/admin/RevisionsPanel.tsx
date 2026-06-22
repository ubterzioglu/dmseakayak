import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchRevisions,
  createRevision,
  updateRevisionStatus,
  deleteRevision,
  type RevisionRow,
  type RevisionStatus,
} from "@/hooks/useAdminContent";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminCollapsible, AdminEmptyState, AdminSurface } from "./admin-ui";

const STATUS_LABELS: Record<RevisionStatus, string> = {
  open: "Açık",
  progress: "Devam Ediyor",
  done: "Tamamlandı",
};

const STATUS_COLORS: Record<RevisionStatus, string> = {
  open: "bg-orange/15 text-orange",
  progress: "bg-teal-light/15 text-teal-light",
  done: "bg-teal/15 text-teal",
};

const STATUSES = Object.keys(STATUS_LABELS) as RevisionStatus[];

function urgencyColor(u: number): string {
  if (u >= 8) return "bg-red-100 text-red-600";
  if (u >= 4) return "bg-orange/15 text-orange";
  return "bg-teal/15 text-teal";
}

export default function RevisionsPanel() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form state
  const [requester, setRequester] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState(5);
  const [status, setStatus] = useState<RevisionStatus>("open");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchRevisions());
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
    if (!requester.trim() || !body.trim()) return;
    if (urgency < 1 || urgency > 10) {
      setError("Aciliyet 1-10 arasında olmalı.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createRevision({ requester: requester.trim(), body: body.trim(), urgency, status });
      toast.success("Revizyon isteği eklendi.");
      setRequester("");
      setBody("");
      setUrgency(5);
      setStatus("open");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      toast.error("İstek kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, s: RevisionStatus) => {
    setBusyId(id);
    try {
      await updateRevisionStatus(id, s);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: s } : r)));
      toast.success(`Durum güncellendi: ${STATUS_LABELS[s]}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi");
      toast.error("Durum güncellenemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Bu istek silinsin mi?",
      description: "Bu işlem geri alınamaz.",
      confirmLabel: "Sil",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteRevision(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success("İstek silindi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      toast.error("İstek silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <AdminCollapsible
          title="Yeni revizyon isteği"
          description="Ekibin görmek istediği değişikliği kısa, net ve öncelikli biçimde girin."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">Kimsin?</label>
              <input
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                required
                placeholder="Adınız (örn: Elif)"
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep">
                Revizyon isteğin nedir?
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                placeholder="Hangi değişiklik isteniyor?"
                className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-teal-deep">
                  Aciliyet (1-10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={urgency}
                  onChange={(e) => setUrgency(Number(e.target.value))}
                  className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-teal-deep">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RevisionStatus)}
                  className="w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 outline-none focus:border-orange"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
            >
              {submitting ? "Ekleniyor..." : "İsteği Kaydet"}
            </button>
          </form>
        </AdminCollapsible>

        <AdminSurface
          title={`${items.length} revizyon isteği`}
          description="Durum güncellemeleri ve silme işlemleri kartlar üzerinden yapılır."
          actions={
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full border border-teal/15 bg-white px-4 py-2 text-sm font-semibold text-teal-deep hover:bg-foam disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>
          }
          contentClassName="space-y-3"
        >
          {!loading && items.length === 0 && (
            <AdminEmptyState
              title="Henüz revizyon isteği yok"
              description="Yeni talepler kaydedildiğinde burada önceliklendirilmiş kartlar olarak listelenecek."
            />
          )}

          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-[24px] border border-teal/10 border-l-4 border-l-orange bg-[#fcfbf8] p-5 shadow-[0_12px_34px_rgba(4,43,37,0.05)]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-teal-deep">{r.requester}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${urgencyColor(r.urgency)}`}>
                  Aciliyet {r.urgency}/10
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-teal/35">
                  {new Date(r.created_at).toLocaleString("tr-TR")}
                </span>
              </div>
              <p className="mb-4 text-sm leading-7 text-teal/80">{r.body}</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={busyId === r.id || r.status === s}
                    onClick={() => void handleStatus(r.id, s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                      r.status === s ? "bg-teal text-white" : "border border-teal/20 text-teal hover:bg-foam"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
                <button
                  disabled={busyId === r.id}
                  onClick={() => void handleDelete(r.id)}
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
