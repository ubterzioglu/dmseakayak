/**
 * Rehber içeriği — tek kaynak. Hem "Rehber" sekmesi (GuidePanel) hem de her
 * bölümün üstündeki "Bu bölüm ne işe yarar?" akordeonu buradan okur, böylece
 * akordeon içeriği rehberdeki ilgili bölümün birebir kopyasıdır.
 *
 * Yeni bir panel/özellik eklenince buradaki ilgili bölümü güncellemeniz
 * yeterli — iki yer birden otomatik güncellenir.
 */

export interface GuideSection {
  /** Üst şeritteki sekme adıyla aynı etiket */
  tab: string;
  /** Bölümün ne işe yaradığını anlatan tek cümle */
  summary: string;
  /** Adım adım kullanım talimatları */
  steps: string[];
  /** İsteğe bağlı ipuçları / dikkat edilecekler */
  tips?: string[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    tab: "Rezervasyonlar",
    summary:
      "Siteden gelen rezervasyon taleplerini görür ve her birinin durumunu takip edersiniz.",
    steps: [
      "Müşteri sitedeki formu doldurduğunda talep otomatik buraya düşer — manuel ekleme yoktur.",
      "Üstteki sayaçlar toplam talebi ve her durumdaki talep sayısını gösterir.",
      "Her kartta müşterinin adı, e-postası, telefonu, seçtiği tur, tarih, kişi sayısı ve mesajı yer alır.",
      "Müşteriyle ilgilendikçe kartın altındaki durum butonuna basın: Yeni → İletişime Geçildi → Onaylandı → Tamamlandı (ya da İptal).",
      "Yeni talep gelip gelmediğini görmek için sağ üstteki 'Yenile' butonuna basın.",
    ],
    tips: [
      "Telefon numarasına basıp müşteriyi WhatsApp'tan aramak en hızlı yöntemdir.",
      "Durum yalnızca takip içindir; müşteriye otomatik bildirim gitmez, iletişimi siz kurarsınız.",
    ],
  },
  {
    tab: "Revizyonlar",
    summary:
      "Ekip içi 'şunu değiştirelim' istekleri için bir görev listesidir. Müşteri görmez, sadece yönetim panelindedir.",
    steps: [
      "'Yeni Revizyon İsteği' formunda 'Kimsin?' kısmına adınızı yazın (örn. Elif).",
      "'Revizyon isteğin nedir?' alanına ne değişmesini istediğinizi açıkça yazın.",
      "Aciliyet (1-10) verin: 1-3 düşük, 4-7 orta, 8-10 acil olarak renklenir.",
      "Durumu seçip 'Ekle' deyin. İstek listeye eklenir.",
      "İş ilerledikçe kartın altından durumu güncelleyin: Açık → Devam Ediyor → Tamamlandı.",
      "Artık geçersiz bir istek için 'Sil' butonunu kullanın (onay sorulur).",
    ],
    tips: [
      "Bu liste, geliştirici ekibin (web sitesini yapanlar) ne yapacağını gördüğü yerdir.",
      "Net yazın: 'Ana sayfadaki turuncu butonun yazısı değişsin' gibi.",
    ],
  },
  {
    tab: "Blog",
    summary:
      "Sitedeki blog yazılarını oluşturur, düzenler ve yayınlarsınız.",
    steps: [
      "'Başlık' yazın — Slug (yazının web adresi) otomatik oluşur, isterseniz elle değiştirebilirsiniz.",
      "'Özet' alanına yazının kısa tanımını yazın (liste sayfasında ve Google'da görünür).",
      "'Kapak Görseli' için bilgisayarınızdan bir fotoğraf seçin; küçük bir önizleme çıkar.",
      "Büyük 'İçerik' kutusuna yazınızı yazın. Üstteki araç çubuğuyla kalın/italik yapabilir, başlık, liste, bağlantı ve görsel ekleyebilirsiniz.",
      "Metnin içine görsel eklemek için araç çubuğundaki resim simgesine basıp dosya seçin.",
      "Hazırsa 'Yayınla' kutusunu işaretleyin (işaretsiz bırakırsanız taslak olarak saklanır, sitede görünmez).",
      "'Kaydet'e basın. Yeni bir yazıya başlamak için 'Temizle / Yeni' deyin.",
    ],
    tips: [
      "Listede her yazının yanında 'Yayında' veya 'Taslak' etiketi görünür.",
      "Var olan bir yazıyı değiştirmek için listeden 'Düzenle'ye basın, form yukarıda dolu gelir.",
      "Görseller sunucuda (Supabase) saklanır; aynı görseli tekrar yüklemenize gerek yoktur.",
    ],
  },
  {
    tab: "Turlar",
    summary:
      "Sitedeki tüm turları yönetirsiniz — tur ekler, düzenler, sıralar, yayına alır veya kaldırırsınız.",
    steps: [
      "Yeni tur için formu boş doldurun ya da listedeki bir turda 'Düzenle'ye basın.",
      "'Çok günlü tur' kutusu, turun sitede hangi bölümde görüneceğini belirler: günübirlik turlar mı, Çok Günlü Ekspedisyonlar mı.",
      "Başlık, slogan ve açıklamaları dil sekmeleriyle (TR/EN/FR/RU) ayrı ayrı doldurun.",
      "Liste alanlarında (öne çıkanlar, dahil olanlar vb.) her satır ayrı bir madde olur.",
      "'Sıra' turun kendi bölümündeki yerini belirler (küçük sayı önce gelir).",
      "'Yayınla' işaretli değilse tur sitede görünmez.",
      "'Kaydet'e basın; değişiklik sitede hemen yayına girer.",
    ],
    tips: [
      "Panel boşken site koddaki hazır turları gösterir; 'Statik turları içe aktar' butonu hepsini tek seferde panele taşır.",
      "Bir turu silmek yerine 'Yayınla' işaretini kaldırmak daha güvenlidir — içerik kaybolmaz.",
    ],
  },
  {
    tab: "Yorumlar",
    summary:
      "Sitede gösterilen müşteri yorumlarını yönetirsiniz — tek tek veya toplu ekleyebilirsiniz.",
    steps: [
      "Tek yorum için: 'Yeni Yorum' formunda Yazar, Puan (1-5), Yorum metni ve isteğe bağlı Kaynak (Google, TripAdvisor) girin, 'Kaydet'e basın.",
      "Çok sayıda yorum için 'Toplu Ekle' kutusunu kullanın.",
      "Satır biçimi: ilk satıra 'Ad | 5', alt satıra yorum metni; her yorumu üç çizgi (---) ile ayırın.",
      "'Yorumları Ekle'ye basın; kaç tanesinin eklendiği size bildirilir.",
      "Bir yorumu yayından kaldırmak için 'Düzenle' > Durum'u 'Arşiv' yapın (silmeden gizlenir).",
      "'Sıra' alanı yorumların ana sayfadaki akan şeritte hangi sırayla görüneceğini belirler.",
    ],
    tips: [
      "Google yorumlarını kopyalayıp Toplu Ekle ile hızlıca aktarabilirsiniz.",
      "Yanlış girilen yorumu 'Sil' ile tamamen kaldırabilirsiniz (onay sorulur).",
    ],
  },
  {
    tab: "Güncellemeler",
    summary:
      "Sitede bugüne kadar yapılan tüm geliştirmelerin ve sırada bekleyen işlerin listesidir.",
    steps: [
      "Bu sayfa sadece okumak içindir — burada değişiklik yapmazsınız.",
      "En üstte en yeni geliştirmeler, altta tarih sırasıyla eskiler yer alır.",
      "En alttaki turuncu 'Sırada / İçerik Bekleyen' kutusu, sizden içerik beklenen işleri gösterir.",
    ],
    tips: [
      "'Neler yapıldı, ne kaldı?' sorusunun cevabını burada bulursunuz.",
    ],
  },
];

/** Sekme key → rehber bölümü eşlemesi (akordeon bu eşlemeden okur). */
export const GUIDE_BY_TAB: Record<string, GuideSection> = Object.fromEntries(
  GUIDE_SECTIONS.map((s) => [s.tab, s]),
);
