import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ReservationRow } from "@/hooks/useReservations";
import { AdminEmptyState, AdminStatCard, AdminSurface } from "./admin-ui";

/** Strips a phone string down to wa.me-compatible international digits. */
function waDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  // A leading 0 (local TR format) → assume +90.
  if (digits.startsWith("0")) return "90" + digits.slice(1);
  return digits;
}

type ReservationStatus = "new" | "contacted" | "confirmed" | "done" | "cancelled";

interface Reservation extends ReservationRow {
  status: ReservationStatus;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  confirmed: "Onaylandı",
  done: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  done: "bg-teal/10 text-teal",
  cancelled: "bg-red-100 text-red-600",
};

const STATUSES = Object.keys(STATUS_LABELS) as ReservationStatus[];

function isValidStatus(s: string): s is ReservationStatus {
  return (STATUSES as string[]).includes(s);
}

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
  updating: boolean;
}

function ReservationCard({ reservation: r, onStatusChange, updating }: ReservationCardProps) {
  return (
    <div className="rounded-[26px] border border-teal/10 bg-[#fcfbf8] p-5 shadow-[0_16px_36px_rgba(4,43,37,0.05)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-teal-deep">{r.name}</div>
          <div className="mt-1 text-sm text-teal/55">{r.email || "—"}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[r.status]}`}>
          {STATUS_LABELS[r.status]}
        </span>
      </div>

      <div className="mb-5 grid gap-2 text-sm leading-6 text-teal/70">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-teal-deep">Telefon:</span>
          {r.phone ? (
            <>
              <a
                href={`tel:${r.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1 font-medium text-teal underline-offset-2 hover:text-orange hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {r.phone}
              </a>
              <a
                href={`https://wa.me/${waDigits(r.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
        {r.tourSlug && (
          <div>
            <span className="font-semibold text-teal-deep">Tur:</span> {r.tourSlug}
          </div>
        )}
        {r.date && (
          <div>
            <span className="font-semibold text-teal-deep">Tarih:</span> {r.date}
          </div>
        )}
        {r.partySize && (
          <div>
            <span className="font-semibold text-teal-deep">Kişi sayısı:</span> {r.partySize}
          </div>
        )}
        {r.message && (
          <div>
            <span className="font-semibold text-teal-deep">Mesaj:</span> {r.message}
          </div>
        )}
        <div className="pt-1 text-xs uppercase tracking-[0.14em] text-teal/35">
          {new Date(r.created_at).toLocaleString("tr-TR")}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={updating || r.status === s}
            onClick={() => onStatusChange(r.id, s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-40 ${
              r.status === s ? "bg-teal text-white" : "border border-teal/20 text-teal hover:bg-foam"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReservationsPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const fetchReservations = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reservation_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setReservations(
        (data as Reservation[]).map((r) => ({
          ...r,
          status: isValidStatus(r.status) ? r.status : "new",
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    if (!supabase) return;
    setUpdatingId(id);
    const { error } = await supabase.from("reservation_requests").update({ status }).eq("id", id);
    if (!error) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Durum güncellendi: ${STATUS_LABELS[status]}`);
    } else {
      toast.error("Durum güncellenemedi. Lütfen tekrar deneyin.");
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className={`rounded-[24px] text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
            filter === "all" ? "ring-2 ring-teal-deep" : "hover:-translate-y-0.5"
          }`}
        >
          <AdminStatCard
            label="Toplam Talep"
            value={reservations.length}
            detail={filter === "all" ? "Tümü gösteriliyor." : "Tümünü göstermek için tıklayın."}
            tone="teal"
          />
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(filter === s ? "all" : s)}
            aria-pressed={filter === s}
            className={`rounded-[24px] text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
              filter === s ? "ring-2 ring-teal-deep" : "hover:-translate-y-0.5"
            }`}
          >
            <AdminStatCard
              label={STATUS_LABELS[s]}
              value={reservations.filter((r) => r.status === s).length}
              detail={filter === s ? "Filtre aktif." : "Sadece bunları göstermek için tıklayın."}
              tone={
                s === "new"
                  ? "blue"
                  : s === "contacted"
                    ? "orange"
                    : s === "cancelled"
                      ? "rose"
                      : "emerald"
              }
            />
          </button>
        ))}
      </div>

      <AdminSurface
        title="Rezervasyon akışı"
        description="Yeni talepleri gözden geçirin, müşteriyle iletişim durumunu güncelleyin ve ilerlemeyi ekibiniz için görünür tutun."
        actions={
          <button
            onClick={() => void fetchReservations()}
            disabled={loading}
            className="rounded-full border border-teal/15 bg-white px-4 py-2 text-sm font-semibold text-teal-deep transition hover:bg-foam disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Yenile"}
          </button>
        }
        contentClassName="space-y-5"
      >
        {loading && <p className="py-12 text-center text-teal/50">Yükleniyor...</p>}
        {!loading && reservations.length === 0 && (
          <AdminEmptyState
            title="Henüz rezervasyon talebi yok"
            description="Yeni form gönderimleri burada kart görünümüyle listelenecek."
          />
        )}

        {!loading &&
          reservations.length > 0 &&
          (() => {
            const visible =
              filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
            if (visible.length === 0) {
              return (
                <AdminEmptyState
                  title={`"${STATUS_LABELS[filter as ReservationStatus]}" durumunda talep yok`}
                  description="Başka bir durum seçin veya 'Toplam Talep' ile tüm talepleri görün."
                />
              );
            }
            return (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {visible.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    onStatusChange={(id, status) => void handleStatusChange(id, status)}
                    updating={updatingId === r.id}
                  />
                ))}
              </div>
            );
          })()}
      </AdminSurface>
    </div>
  );
}
