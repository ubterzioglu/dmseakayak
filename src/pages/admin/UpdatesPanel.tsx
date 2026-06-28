/**
 * Static "Yapılanlar / Güncellemeler" changelog shown inside /admin so the
 * client can follow everything that has been built. Update the ENTRIES array
 * as new work ships.
 */
import { type AdminPanelProps, AdminSurface } from "./admin-ui";

interface UpdateGroup {
  date: string;
  title: string;
  items: string[];
}

const ENTRIES: UpdateGroup[] = [
  {
    date: "28 Haziran 2026",
    title: "Küçük metin düzeltmeleri (Kekova tur adı ve Hakkımızda başlığı)",
    items: [
      "Kekova turunun Türkçe adı 'Kekova Classic' yerine 'Kekova Klasik' olarak düzeltildi (diğer dillerde 'Classic' olarak kaldı).",
      "Hakkımızda sayfasındaki 'Kim Biz?' başlığı, doğru Türkçe kullanımı olan 'Biz Kimiz?' şeklinde güncellendi.",
    ],
  },
  {
    date: "24 Haziran 2026",
    title: "Fotoğraflar, Hakkımızda, 404 sayfası ve revizyon yorumları",
    items: [
      "Tüm tur fotoğrafları siteye yüklendi: Kekova Classic, Doğu, Batı ve TRAK için toplam 67 fotoğraf — web için küçültülüp hızlandırıldı.",
      "Her tur detay sayfasına fotoğraf galerisi eklendi; fotoğrafa tıklayınca tam ekran büyüyor.",
      "Galeri sayfası bu yeni fotoğraflarla yenilendi; eski örnek görseller kaldırıldı. Fotoğraflar yine panelden (Galeri sekmesi) yönetilebiliyor.",
      "Hakkımızda sayfasına yeni tanıtım metni eklendi; yazılar iki yana yaslı ve daha derli toplu, yanına ofis fotoğrafı kondu.",
      "Admin giriş ekranındaki ve yan paneldeki maskot logo büyütülüp netleştirildi; oturum/şifre/çıkış butonları sağ üste taşındı.",
      "WhatsApp iletişim numarası doğru numarayla güncellendi (0533 290 1463).",
      "İletişim e-postası info@dragoman-turkey.com olarak güncellendi.",
      "Revizyonlar bölümüne durum filtresi eklendi; tamamlanan istekler ayrı, kapalı bir kartta toplanıyor.",
      "Revizyon isteklerinin altına yorum yazma özelliği eklendi — ekip her istek için not/yorum bırakabiliyor.",
      "Kur çevirici, Turlar sayfasının en altına alındı ve daha kompakt hâle getirildi.",
      "Yeni, markaya uygun 'Sayfa bulunamadı' (404) ekranı: hatalı bir adrese girildiğinde ana sayfa, turlar ve popüler sayfalara hızlı bağlantılar gösteriyor.",
      "Arama motorları için ek iyileştirmeler: tur sayfalarına zengin veri (fiyat, konum, işletme bilgisi) ve site genelinde SEO/konum (GEO) güncellemeleri.",
    ],
  },
  {
    date: "24 Haziran 2026",
    title: "Yönetim panelinde formlar varsayılan kapalı (akordeon) hâle getirildi",
    items: [
      "Blog, Galeri ve Revizyon bölümlerindeki ekleme formları artık varsayılan olarak kapalı açılıyor; bölüm ilk bakışta daha sade ve okunaklı.",
      "Bir kaydı düzenlemeye başlayınca ilgili form otomatik açılıyor (Blog ve Galeri); yeni kayıtta kapalı kalıyor.",
      "Form açıldıktan sonra istenirse elle tekrar kapatılabiliyor.",
      "Panele admin maskot logosu eklendi.",
    ],
  },
  {
    date: "23 Haziran 2026",
    title: "Çok günlü tur (expedition) kartları ve tur sayfası genişletmesi",
    items: [
      "Çok günlü turlar eklendi: 7 Günlük Akdeniz Macerası, Coast of Light (4 gün), Kekova Sound (2 gün), Lycian Kayak & Comfort Escape (7 gün), Carian Shore (1 hafta) ve TRAK Signature Experience.",
      "Tur kartları çok günlü turları otomatik tanıyor: süre (örn. '7 gün / 6 gece') ve kişi başı paket fiyatı gösteriliyor; günlük turların görünümü değişmedi.",
      "Fiyatı netleşmemiş turlarda 'Talep üzerine' yazıyor; iç maliyet rakamları hiçbir zaman gösterilmiyor.",
      "Taslak turlarda 'Taslak', TRAK'ta 'Özel' rozeti; içeriği henüz hazır olmayan turda 'Program yakında' notu.",
      "Tur detay sayfası çok günlü turlar için gün-gün program, tarihler, dahil olanlar ve dahil OLMAYANLAR bölümleriyle genişletildi.",
      "Çok günlü turlar hem Turlar sayfasında hem ana sayfada ayrı bir bölümde listeleniyor; TRAK kartı kendi sayfasına yönlendiriyor.",
      "Tüm yeni tur içerikleri ve etiketleri 4 dilde (TR / EN / FR / RU) hazırlandı.",
    ],
  },
  {
    date: "22 Haziran 2026",
    title: "TRAK Experience, kur çevirici, Coming Soon ve yorum çevirisi",
    items: [
      "TRAK Experience sayfası eklendi (menü ve footer linkiyle).",
      "Turlar sayfasına kur çevirici eklendi (EUR / TRY / USD / GBP / RUB).",
      "Lansman öncesi için sinematik animasyonlu 'Coming Soon' (Çok Yakında) ekranı: marka logosu, kürekçi animasyonu ve geri sayım; site geçici olarak /mvp altında sahnelendi.",
      "Google yorumları için otomatik çekme betiği ve yorumların 4 dile otomatik çevirisi (Supabase Edge Function) altyapısı.",
      "Yenilenen marka logosu tüm sayfalarda; eski logonun önbellekten gelmesi sorunu giderildi (cache-bust).",
      "Galeri açıklamaları (caption) çok dilli hale getirildi.",
    ],
  },
  {
    date: "22 Haziran 2026",
    title: "Yönetim paneli kullanım kolaylığı iyileştirmeleri",
    items: [
      "Giriş ekranına 'Şifremi unuttum' eklendi — yetkili e-postaya sıfırlama bağlantısı gönderilir.",
      "Şifre alanlarına göster/gizle (göz) düğmesi geldi; yazarken kontrol edebilirsiniz.",
      "Hata mesajları artık anlaşılır Türkçe (örn. 'E-posta veya şifre hatalı') — teknik İngilizce yazılar kaldırıldı.",
      "Panel açılırken bir an görünen giriş ekranı 'yanıp sönmesi' giderildi; yükleniyor göstergesi eklendi.",
      "Tablet ve küçük dizüstü ekranlarda 'Bölümler' menüsünün açılmadığı sorun düzeltildi.",
      "Silme işlemlerinde tarayıcının kaba uyarısı yerine panele uygun şık bir onay kutusu çıkıyor.",
      "Kaydetme, silme ve durum değiştirme sonrası ekranda anlık bilgi balonu (bildirim) gösteriliyor.",
      "Blogda yazı yazarken kaydetmeden başka yere geçilirse uyarı verilir — yazı kazara kaybolmaz.",
      "Rezervasyonlarda üstteki sayaç kartlarına tıklayarak duruma göre filtreleme (örn. sadece 'Yeni').",
      "Rezervasyon kartındaki telefon artık tıklanabilir: doğrudan arama veya WhatsApp ile yazma.",
      "Panel genelinde dil tutarlı hale getirildi (kalan İngilizce etiketler Türkçeleştirildi).",
      "Yetkili artık panel içinden kendi şifresini değiştirebiliyor.",
      "Hızlı bağlantılar üst bara taşındı, her bölüme yardım kartı eklendi, başlık küçültüldü.",
      "Yeni 'Durum Raporu' paneli: bitenler / sırada bekleyenler tek bakışta.",
      "Yeni 'Rehber' paneli: paneli kullananlar için adım adım kullanım kılavuzu.",
    ],
  },
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
  "⚠️ ÖNEMLİ — Şifre sıfırlama / sistem e-postaları için özel SMTP (örn. Resend) kurulumu: kendi domain'imizden gönderim + Türkçe markalı mail şablonu. Şu an Supabase'in ücretsiz paylaşımlı maili kullanılıyor (limitli ve şablon değiştirilemiyor).",
  "Drone videosu (içerik Drive'dan gelince yüklenecek).",
  "TRAK Experience sayfasının gerçek metni (şu an placeholder; fotoğrafı eklendi).",
  "Kur çeviriciyi canlı döviz kuruna bağlama (şu an yaklaşık placeholder kurlar).",
  "Yorumların gerçek Google içerikleriyle doldurulması (admin > Yorumlar > Toplu Ekle).",
  "Google Haritalar işletme linki.",
];

export default function UpdatesPanel({ infoSlot }: AdminPanelProps) {
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

      {infoSlot}

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
