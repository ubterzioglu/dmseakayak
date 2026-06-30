import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, MessageSquare } from "lucide-react";
import {
  fetchReportComments,
  addReportComment,
  deleteReportComment,
  type ReportCommentRow,
} from "@/hooks/useAdminContent";

/**
 * Static "Genel Durum Raporu" shown as a collapsible card inside the Revizyonlar
 * panel. Mirrors docs/bekledigimiz-seyler.md so Osi & Elif can see — at a glance,
 * inside the admin panel — what is still waiting on them. Each item carries a
 * stable `topic` key so admins can thread comments under it (report_comments
 * table, migration 0007). Update this component (and the source markdown)
 * together when the outstanding list changes; never reuse a retired topic key.
 */

interface WaitingItem {
  /** Stable key used to attach comments. Never change once shipped. */
  topic: string;
  title: string;
  body: React.ReactNode;
}

const OSI_ITEMS: WaitingItem[] = [
  {
    topic: "osi-1",
    title: '"Neden Bizi Seçmelisiniz" bölümünün yeni metni',
    body: (
      <>
        Bu bölümün yazısını yeniden yazmak istiyordun — bize <strong>yazılı olarak</strong>{" "}
        gönderir misin? İçinde şunlar olsun demiştin:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Rehberlerin kaç yıldır çalıştığı</li>
          <li>Yemeklerin porsiyonu ve çeşitliliği</li>
          <li>Grupların küçük olması</li>
          <li>İkinci rehber aldığımız</li>
        </ul>
        <p className="mt-2">
          Sen metni at, biz siteye girelim. (Hiç uğraşma, metni gönder yeter, gerisi
          bizde.)
        </p>
      </>
    ),
  },
  {
    topic: "osi-2",
    title: "Kekova Klasik için 3 fotoğraf",
    body: (
      <>
        "Fotoları ben seçerim" demiştin. Tur detay sayfasında öne çıkacak{" "}
        <strong>3 fotoğrafı</strong> seç ve gönder. Şu an tüm galeri (41 foto) sayfanın en
        altında duruyor; senin seçtiğin 3 tanesini yukarı, göze çarpan yere koyacağız.
      </>
    ),
  },
  {
    topic: "osi-3",
    title: "Kekova Gulet turunun fotoğrafları",
    body: (
      <>
        Yeni "Kekova Sea Kayak &amp; Gulet" turunun yazısını ekledik ✅ (4 dilde de hazır).
        Ama <strong>fotoğrafları</strong> bekliyoruz — içerik klasörüne atacağını
        söylemiştin. Şu an geçici olarak başka bir Kekova fotosu kapak yaptık.
        <p className="mt-2">
          Bir de: turun <strong>kaç gün / kaç gece</strong> olduğunu kesinleştirir misin?
          Şimdilik 7 gün / 6 gece yazdık ama bu tahmini.
        </p>
      </>
    ),
  },
];

const ELIF_ITEMS: WaitingItem[] = [
  {
    topic: "elif-1",
    title: "Google işletme hesabı erişimi (yorumlar için)",
    body: (
      <>
        Yorumlar konusunu çözmek için Dragoman'ın <strong>Google işletme hesabına erişim</strong>{" "}
        lazım. Bu olunca:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Tüm Google yorumlarını düzgün çekeceğiz</li>
          <li>Dalışla ilgili olanları ayıklayacağız (onları siz sileceksiniz)</li>
          <li>Yorumlara tıklayınca Google Reviews'e gidecek</li>
        </ul>
        <p className="mt-2">
          Sende bu hesap var mı? Varsa bir ara konuşalım.
        </p>
      </>
    ),
  },
];

const SUMMARY: { who: string; what: string }[] = [
  { who: "Osi", what: '"Neden Bizi Seçmelisiniz" yeni metni' },
  { who: "Osi", what: "Kekova Klasik için 3 fotoğraf" },
  { who: "Osi", what: "Kekova Gulet turu fotoğrafları + kaç gün/gece bilgisi" },
  { who: "Elif", what: "Google işletme hesabı erişimi (yorumlar için)" },
];

/** Threaded comments under a single report item, keyed by a stable `topic`.
 *  Mirrors RevisionComments but reads/writes the report_comments table. */
function ReportComments({ topic }: { topic: string }) {
  const [comments, setComments] = useState<ReportCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setComments(await fetchReportComments([topic]));
    } catch {
      // Surface nothing here; failures are non-blocking for a static report.
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const created = await addReportComment(topic, author.trim(), body.trim());
      setComments((prev) => [...prev, created]);
      setBody("");
      toast.success("Yorum eklendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yorum eklenemedi.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteReportComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yorum silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-4 border-t border-teal/10 pt-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-teal/45">
        <MessageSquare className="h-3.5 w-3.5" />
        Yorumlar{comments.length > 0 ? ` (${comments.length})` : ""}
      </div>

      {loading ? (
        <p className="text-xs text-teal/40">Yükleniyor…</p>
      ) : (
        comments.length > 0 && (
          <ul className="mb-3 space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="group rounded-xl border border-teal/10 bg-white px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-teal-deep">{c.author}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-teal/35">
                    {new Date(c.created_at).toLocaleString("tr-TR")}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-teal/80">
                  {c.body}
                </p>
                <button
                  type="button"
                  disabled={busyId === c.id}
                  onClick={() => void handleDelete(c.id)}
                  className="mt-1 text-[10px] font-semibold text-red-500/70 opacity-0 transition hover:text-red-600 group-hover:opacity-100 disabled:opacity-40"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-start gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Adınız"
          className="w-28 rounded-lg border border-teal/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Yorum yazın…"
          rows={1}
          className="min-w-0 flex-1 resize-y rounded-lg border border-teal/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange"
        />
        <button
          type="submit"
          disabled={posting || !author.trim() || !body.trim()}
          className="rounded-lg bg-teal-deep px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal disabled:opacity-40"
        >
          {posting ? "…" : "Ekle"}
        </button>
      </form>
    </div>
  );
}

function WaitingSection({
  heading,
  accentClassName,
  items,
}: {
  heading: string;
  accentClassName: string;
  items: WaitingItem[];
}) {
  return (
    <div>
      <h4 className={`mb-3 text-sm font-bold uppercase tracking-[0.14em] ${accentClassName}`}>
        {heading}
      </h4>
      <ol className="space-y-4">
        {items.map((it, i) => (
          <li
            key={it.topic}
            className="rounded-2xl border border-teal/10 bg-white p-4 shadow-[0_8px_24px_rgba(4,43,37,0.04)]"
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-sm font-bold text-orange">{i + 1}.</span>
              <span className="text-sm font-bold text-teal-deep">{it.title}</span>
            </div>
            <div className="text-[13px] leading-6 text-teal/80">{it.body}</div>
            <ReportComments topic={it.topic} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GeneralStatusReport() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-teal/10 bg-foam/50 p-4 text-[13px] leading-6 text-teal/80">
        <p className="font-semibold text-teal-deep">Selam Osi &amp; Elif! 🙏</p>
        <p className="mt-2 inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
          Sitedeki revizyonların çoğu bitti (29 istekten 23'ü tamam). Geri kalan birkaç şey bizde değil, sizde takılı — siz şunları gönderince / onaylayınca biz hemen bitiriyoruz.
        </p>
      </div>

      <WaitingSection
        heading="🟠 Osi'den beklediklerimiz"
        accentClassName="text-orange"
        items={OSI_ITEMS}
      />

      <WaitingSection
        heading="🟢 Elif'ten beklediğimiz"
        accentClassName="text-teal"
        items={ELIF_ITEMS}
      />

      {/* Summary table */}
      <div>
        <h4 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-teal-deep">
          <Clock className="h-4 w-4" />
          Özet — kim ne gönderecek?
        </h4>
        <div className="overflow-hidden rounded-2xl border border-teal/10">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-foam/60 text-left text-teal-deep">
                <th className="w-20 px-4 py-2 font-bold">Kim</th>
                <th className="px-4 py-2 font-bold">Ne gönderecek / onaylayacak</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY.map((row, i) => (
                <tr key={i} className="border-t border-teal/8">
                  <td className="px-4 py-2 font-semibold text-teal-deep">{row.who}</td>
                  <td className="px-4 py-2 text-teal/80">{row.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-6 text-teal/70">
          Bunlar gelince geri kalan her şeyi kapatıyoruz. Eline ne zaman geçerse, acele
          yok 🙂 Teşekkürler!
        </p>
      </div>
    </div>
  );
}
