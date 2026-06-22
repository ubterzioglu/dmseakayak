/**
 * "Durum Raporu" — ChatGPT'den çıkan görev listesinin son durumu.
 * Müşteriye/ekibe tek bakışta hangi maddenin bittiğini, hangisinin içerik
 * beklediğini ve hangisinin eksik olduğunu gösteren statik tablo.
 *
 * Yeni iş bittikçe ROWS dizisindeki `status` alanını güncelleyin.
 */
import { type AdminPanelProps, AdminStatCard, AdminSurface } from "./admin-ui";

type Status = "done" | "partial" | "missing";

interface TaskRow {
  task: string;
  status: Status;
  note: string;
}

const STATUS_META: Record<Status, { label: string; dot: string; chip: string }> = {
  done: {
    label: "Tamamlandı",
    dot: "bg-teal",
    chip: "bg-teal/10 text-teal-deep ring-teal/20",
  },
  partial: {
    label: "İçerik Bekliyor",
    dot: "bg-orange",
    chip: "bg-orange/10 text-orange ring-orange/20",
  },
  missing: {
    label: "Eksik",
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-600 ring-red-200",
  },
};

const ROWS: TaskRow[] = [
  // ── Tasarım & Görsel Yön ──────────────────────────────────────────────────
  { task: "Renkli ve canlı tasarım (gri tonlardan kaçınma)", status: "done", note: "Teal / turuncu / foam paleti; gri tonlar kullanılmadı." },
  { task: "Modern ve görsel odaklı tasarım", status: "done", note: "React + Vite + Tailwind, kart bazlı modern arayüz." },
  { task: "Profesyonel ve renkli görünüm", status: "done", note: "Tutarlı marka rengi ve tipografi tüm sayfalarda." },
  { task: "Mobil cihazlar için optimizasyon", status: "done", note: "Tüm bileşenlerde responsive (sm/md/lg) sınıflar." },
  { task: "Site hızı ve performans iyileştirmesi", status: "done", note: "Vite + sayfa bazlı kod bölme (lazy load)." },

  // ── Çok Dillilik ──────────────────────────────────────────────────────────
  { task: "İngilizce dil desteği", status: "done", note: "Tam çeviri (en)." },
  { task: "Fransızca dil desteği", status: "done", note: "Tam çeviri (fr)." },
  { task: "Rusça dil desteği", status: "done", note: "Tam çeviri (ru)." },
  { task: "Tüm sayfalarda tutarlı çok dilli deneyim", status: "done", note: "/:lang/... URL yapısı + 4 dil (tr/en/fr/ru)." },

  // ── Turlar ──────────────────────────────────────────────────────────────────
  { task: "3 ana turu öne çıkar", status: "done", note: "Kekova Classic / West / East ana sayfada vurgulu." },
  { task: "3 ana tur için detaylı açıklamalar", status: "done", note: "Program, dahil olanlar, öne çıkanlar — 4 dilde." },
  { task: "Özel / kişiye özel turları öne çıkar", status: "done", note: "Ayrı 'Özel Turlar' sayfası + menü/footer linki." },
  { task: "Özel turlar için detaylı açıklamalar", status: "done", note: "Özel Turlar sayfasında içerik mevcut." },
  { task: "Günlük turlar için tarih seçimi", status: "done", note: "Rezervasyon formunda tarih seçici." },
  { task: "Tüm tur sayfalarında foto + harita + fiyat + rezervasyon", status: "done", note: "Tur detay sayfası bu öğeleri içerir." },

  // ── Rezervasyon & Fiyat ─────────────────────────────────────────────────────
  { task: "Online rezervasyon sistemi", status: "done", note: "Form → Supabase kaydı + WhatsApp yönlendirme." },
  { task: "Kur çevirici", status: "done", note: "EUR / TRY / USD / GBP / RUB (kurlar şimdilik yaklaşık)." },
  { task: "Tur fiyatlarını karşılaştırılabilir sun", status: "done", note: "Tur kartlarında ve kur çeviricide net fiyatlar." },
  { task: "Rezervasyon dönüşümü için optimizasyon", status: "done", note: "Site genelinde belirgin rezervasyon CTA'ları." },
  { task: "Hızlı fiyat görüntüleme bölümü", status: "missing", note: "Ana sayfada özet fiyat tablosu yok; fiyatlar Turlar sayfasında." },

  // ── İletişim & Sosyal ───────────────────────────────────────────────────────
  { task: "WhatsApp iletişim butonu", status: "done", note: "Sabit (floating) WhatsApp butonu + form yönlendirmesi." },
  { task: "Instagram butonu", status: "done", note: "Footer'da Instagram linki." },
  { task: "E-posta iletişim butonu", status: "done", note: "Footer ve İletişim sayfasında mailto." },
  { task: "Sosyal medya bağlantıları görünür", status: "done", note: "Footer'da Instagram / Facebook / E-posta." },
  { task: "İletişim bilgileri kolay bulunur", status: "done", note: "Footer + İletişim sayfası (telefon / mail / adres)." },
  { task: "Net harekete geçirici mesajlar (CTA)", status: "done", note: "'Hemen Rezervasyon Yap', 'Bize Ulaş' her yerde." },

  // ── İçerik Bölümleri ────────────────────────────────────────────────────────
  { task: "'Hakkımızda' bölümü", status: "done", note: "Hakkımızda sayfası." },
  { task: "'Neden Bizi Seçmelisiniz?' bölümü", status: "done", note: "Ana sayfa bölümü + tur bazında nedenler." },
  { task: "TRAK Experience sayfası", status: "partial", note: "Sayfa ve linkler hazır; gerçek metin/görsel bekleniyor." },
  { task: "Haritalar", status: "done", note: "İletişim sayfasında Google Maps (Üçağız / Kekova)." },

  // ── Yorumlar ─────────────────────────────────────────────────────────────────
  { task: "Müşteri yorumlarını düzenle / öne çıkar", status: "done", note: "Yorumlar sayfası + ana sayfa akan şerit (marquee)." },
  { task: "Yorumları farklı dillerde göster", status: "done", note: "Dil filtresi (FR / EN / DE / TR)." },
  { task: "Yorumları tarihe göre sırala", status: "done", note: "En yeni en üstte sıralama." },
  { task: "Öne çıkan yorumları vurgula", status: "done", note: "'Öne çıkan' rozeti + filtre." },

  // ── SEO ──────────────────────────────────────────────────────────────────────
  { task: "SEO optimizasyonu", status: "done", note: "Meta etiketler, OG/Twitter, JSON-LD, hreflang, sitemap." },

  // ── Medya & Görseller (içerik bekliyor) ─────────────────────────────────────
  { task: "Drone videolu hero (kahraman) bölümü", status: "partial", note: "Kod hazır; gerçek drone videosu (hero.mp4) yüklenecek." },
  { task: "Ana sayfada drone görüntülerini öne çıkar", status: "partial", note: "Hero video altyapısı hazır; gerçek drone içeriği bekleniyor." },
  { task: "Fotoğraf içerikleri (drone çekimleri dahil)", status: "partial", note: "Tur görselleri var; drone foto/videoları bekleniyor." },
  { task: "Fotoğraf galerisi oluştur", status: "done", note: "Galeri sayfası (carousel + lightbox + grid), Supabase'den beslenir." },
  { task: "Güçlü görsel galeri deneyimi", status: "partial", note: "Galeri çalışıyor; şu an örnek görseller, gerçek foto bekleniyor." },
  { task: "Site genelinde yüksek kaliteli fotoğraflar", status: "partial", note: "Gerçek yüksek çözünürlüklü fotoğraflar yüklenecek." },
  { task: "Tanıtım videosu", status: "partial", note: "Hero videosu dışında ayrı tanıtım videosu bölümü yok." },
  { task: "Uygun yerlerde yemek fotoğrafları", status: "partial", note: "İçerikte yemek anlatılıyor; özel yemek fotoğrafları bekleniyor." },

  // ── Güven Öğeleri ────────────────────────────────────────────────────────────
  { task: "Sertifika / ödül / iş ortağı logoları (varsa)", status: "missing", note: "Gerçek sertifika/ödül/partner logosu yok (eldeyse eklenebilir)." },
];

function summarize(rows: TaskRow[]) {
  return rows.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { done: 0, partial: 0, missing: 0 } as Record<Status, number>,
  );
}

export default function StatusReportPanel() {
  const counts = summarize(ROWS);
  const total = ROWS.length;

  return (
    <div className="space-y-6">
      <AdminSurface
        title="Durum Raporu"
        description={`ChatGPT'den çıkan görev listesinin son durumu. Toplam ${total} madde.`}
      >
        <div className="text-sm leading-7 text-teal/65">
          Kod tamamlandı mı, içerik mi bekleniyor, yoksa henüz başlanmadı mı sorusunu tek tabloda
          görmeniz için hazırlanmış bir izleme yüzeyi.
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["done", "partial", "missing"] as Status[]).map((s) => (
          <AdminStatCard
            key={s}
            label={STATUS_META[s].label}
            value={counts[s]}
            tone={s === "done" ? "emerald" : s === "partial" ? "orange" : "rose"}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-teal/10 bg-white shadow-[0_18px_50px_rgba(4,43,37,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-teal/10 bg-foam/60">
                <th className="px-4 py-3 font-semibold text-teal-deep">#</th>
                <th className="px-4 py-3 font-semibold text-teal-deep">Görev</th>
                <th className="px-4 py-3 font-semibold text-teal-deep">Durum</th>
                <th className="px-4 py-3 font-semibold text-teal-deep">Not</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                const meta = STATUS_META[row.status];
                return (
                  <tr
                    key={i}
                    className="border-b border-teal/5 align-top last:border-b-0 hover:bg-foam/40"
                  >
                    <td className="px-4 py-3 text-teal/40">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-teal-deep">{row.task}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.chip}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-teal/70">{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-teal/50">
        <span className="font-semibold">İçerik Bekliyor</span> = kod hazır, gerçek görsel/video/metin
        yüklenince tamamlanacak. <span className="font-semibold">Eksik</span> = henüz yapılmadı veya
        müşteriden bilgi/varlık bekleniyor.
      </p>
    </div>
  );
}
