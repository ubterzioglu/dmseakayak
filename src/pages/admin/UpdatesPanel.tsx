/**
 * Static "Yapılanlar / Güncellemeler" changelog shown inside /admin so the
 * client can follow everything that has been built. Update the ENTRIES array
 * as new work ships.
 */
import { AdminSurface } from "./admin-ui";

interface UpdateGroup {
  date: string;
  title: string;
  items: string[];
}

const ENTRIES: UpdateGroup[] = [
  {
    date: "20 Haziran 2026",
    title: "TRAK Experience + kur çevirici + galeri yönetimi",
    items: [
      "TRAK Experience sayfası eklendi (placeholder içerik; menüde ve footer'da link). Gerçek metin/görsel gelince güncellenecek.",
      "Turlar sayfasına kur çevirici eklendi (EUR / TRY / USD / GBP / RUB). Kurlar şimdilik yaklaşık placeholder; ileride canlı kura bağlanabilir.",
      "Galeri admin yönetimi: görsel yükleme/yayınla/sil; site galerisi Supabase'den beslenir (boşsa örnek görseller).",
      "Marka renkli yin-yang favicon ve şeffaf logo tüm sayfalarda.",
      "Admin paneli e-posta allowlist ile korundu (sadece yetkili hesaplar girer).",
    ],
  },
  {
    date: "19 Haziran 2026",
    title: "Çok dilli site + içerik yönetimi + analitik",
    items: [
      "Site tamamen React + Vite + TypeScript + Tailwind teknolojisine taşındı (modern, hızlı SPA).",
      "4 dil desteği: Türkçe, İngilizce, Fransızca ve YENİ Rusça — tüm sayfalar ve tur içerikleri çevrildi.",
      "Ana sayfaya Google yorumları için sağdan-sola akan canlı bir yorum şeridi (marquee) eklendi.",
      "Admin paneline yorum yönetimi: tekli ve TOPLU yorum ekleme, yayınla/arşivle/sil.",
      "Microsoft Clarity ziyaretçi analitiği siteye entegre edildi (ısı haritası, oturum kayıtları).",
      "SEO + GEO iyileştirmeleri: meta etiketler, Open Graph/Twitter kartları, JSON-LD işletme verisi, hreflang (4 dil), Kaş konum bilgisi, sitemap.",
    ],
  },
  {
    date: "18-19 Haziran 2026",
    title: "Pazarlama sitesi ve rezervasyon altyapısı",
    items: [
      "Tam sayfa yapısı: Ana sayfa, Turlar, 3 tur detayı, Özel Turlar, Hakkımızda, Galeri, Yorumlar, İletişim, SSS.",
      "3 ana tur (Kekova Classic / West / East) detaylı açıklamalar, program, dahil olanlar ve fiyatlarla öne çıkarıldı.",
      "Tur kartları: karta basınca yerinde genişleme + 'Detaya git' ile tur sayfasına geçiş.",
      "Rezervasyon talep formu → Supabase kayıt + WhatsApp yönlendirme (tarih seçimi dahil).",
      "Drone videolu hero (kahraman) bölümü, fotoğraf galerisi ve harita (İletişim) altyapısı hazırlandı.",
      "WhatsApp, Instagram ve e-posta iletişim butonları; mobil uyumlu, hızlı (kod bölme).",
    ],
  },
  {
    date: "Yönetim paneli",
    title: "/admin — yönetim özellikleri",
    items: [
      "Güvenli giriş (Supabase Auth — e-posta + şifre).",
      "Rezervasyon talepleri yönetimi (durum: yeni / iletişimde / onaylı / tamam / iptal).",
      "Revizyon istekleri: ekip içi değişiklik talepleri (Kimsin / İstek / Aciliyet 1-10).",
      "Blog: zengin metin editörü + görsel yükleme (Supabase Storage), yayınla/taslak.",
      "Yorumlar ve bu 'Güncellemeler' bölümü.",
      "Google Drive proje klasörüne hızlı erişim.",
    ],
  },
];

const PENDING: string[] = [
  "Gerçek yüksek çözünürlüklü fotoğraflar ve drone videosu (içerik Drive'dan gelince yüklenecek).",
  "TRAK Experience sayfasının gerçek metin ve görselleri (şu an placeholder).",
  "Kur çeviriciyi canlı döviz kuruna bağlama (şu an yaklaşık placeholder kurlar).",
  "Yorumların gerçek Google içerikleriyle doldurulması (admin > Yorumlar > Toplu Ekle).",
  "Gerçek WhatsApp mobil numarası ve Google Haritalar işletme linki.",
];

export default function UpdatesPanel() {
  return (
    <div className="space-y-8">
      <AdminSurface
        title="Yapılanlar"
        description="Sitede tamamlanan tüm geliştirmeler. En yeni kayıt en üstte tutulur."
      >
        <div className="text-sm leading-7 text-teal/65">
          Bu alan yalnızca okunur. Müşteri ve ekip tarafında “neler bitti, neler sırada” sorusuna
          tek bakışta cevap vermesi için sade tutulur.
        </div>
      </AdminSurface>

      {ENTRIES.map((g) => (
        <div
          key={g.title}
          className="rounded-[28px] border border-teal/10 border-l-4 border-l-teal bg-white p-6 shadow-[0_18px_50px_rgba(4,43,37,0.07)]"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold text-teal-deep">{g.title}</h3>
            <span className="text-xs font-semibold text-orange">{g.date}</span>
          </div>
          <ul className="space-y-2">
            {g.items.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm text-teal/80">
                <span className="mt-0.5 flex-shrink-0 text-teal-light">✓</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-[28px] border border-orange/20 bg-orange/5 p-6 shadow-[0_18px_50px_rgba(4,43,37,0.05)]">
        <h3 className="mb-3 font-bold text-teal-deep">Sırada / İçerik Bekleyen</h3>
        <ul className="space-y-2">
          {PENDING.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-teal/80">
              <span className="mt-0.5 flex-shrink-0 text-orange">○</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
