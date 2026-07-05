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
      "Üstteki sayaçlar toplam talebi ve her durumdaki talep sayısını gösterir; bir sayaca tıklayınca liste o duruma göre filtrelenir.",
      "Her kartta müşterinin adı, e-postası, telefonu, seçtiği tur, tarih, kişi sayısı ve mesajı yer alır.",
      "Müşteriyle ilgilendikçe kartın altındaki durum butonuna basın: Yeni → İletişime Geçildi → Onaylandı → Tamamlandı (ya da İptal).",
      "Yeni talep gelip gelmediğini görmek için sağ üstteki 'Yenile' butonuna basın.",
    ],
    tips: [
      "Telefon numarasına basıp müşteriyi WhatsApp'tan aramak veya doğrudan aramak en hızlı yöntemdir — numara tıklanabilir.",
      "Durum yalnızca sizin takibiniz içindir; müşteriye otomatik bildirim gitmez, iletişimi siz kurarsınız.",
      "Bir talebi yanlışlıkla 'Tamamlandı' yaptıysanız durum butonlarından istediğiniz an geri alabilirsiniz — kalıcı bir kilit yoktur.",
    ],
  },
  {
    tab: "Revizyonlar",
    summary:
      "Ekip içi 'şunu değiştirelim' istekleri için bir görev listesidir. Müşteri görmez, sadece yönetim panelindedir.",
    steps: [
      "'Yeni revizyon isteği' başlığına basıp formu açın.",
      "'Kimsin?' kısmına adınızı yazın (örn. Elif).",
      "'Revizyon isteğin nedir?' alanına ne değişmesini istediğinizi açıkça yazın — sayfa adı, buton adı, tam metin gibi detay verin.",
      "Aciliyet (1-10) verin: 1-3 düşük, 4-7 orta, 8-10 acil olarak renklenir.",
      "Durumu seçip 'İsteği Kaydet' deyin. İstek listeye eklenir.",
      "İş ilerledikçe kartın altından durumu güncelleyin: Açık → Devam Ediyor → Tamamlandı.",
      "Üstteki 'Tümü / Açık / Devam Ediyor' filtresiyle sadece bekleyen işleri görebilirsiniz; tamamlananlar ayrı, kapalı bir kartta birikir.",
      "Bir isteğin altındaki yorum kutusundan ekip içi not bırakabilir, karşılıklı yazışabilirsiniz.",
      "Artık geçersiz bir istek için 'Sil' butonunu kullanın (onay sorulur, geri alınamaz).",
      "'Genel Durum Raporu' kartı, bizim sizden beklediğimiz içerik/onayların canlı özetidir — her madde açıldığında altında da yorum bırakabilirsiniz.",
    ],
    tips: [
      "Bu liste, geliştirici ekibin (web sitesini yapanlar) ne yapacağını gördüğü yerdir.",
      "Net yazın: 'Ana sayfadaki turuncu butonun yazısı değişsin' gibi, sayfa ve öğe adı geçsin.",
      "Silmek yerine durumu değiştirmek çoğu zaman daha güvenlidir; sadece kesin gereksiz istekleri silin.",
    ],
  },
  {
    tab: "Blog",
    summary:
      "Sitedeki blog yazılarını oluşturur, düzenler ve yayınlarsınız.",
    steps: [
      "'Yeni yazı' başlığına basıp formu açın (mevcut yazılardan birini düzenlerken form otomatik açılır).",
      "'Başlık' yazın — Slug (yazının web adresi) otomatik oluşur, isterseniz elle değiştirebilirsiniz.",
      "'Özet' alanına yazının kısa tanımını yazın (liste sayfasında ve Google'da görünür).",
      "'Kapak Görseli' için bilgisayarınızdan bir fotoğraf seçin; küçük bir önizleme çıkar.",
      "Büyük 'İçerik' kutusuna yazınızı yazın. Üstteki araç çubuğuyla kalın/italik yapabilir, başlık, liste, alıntı, bağlantı ve görsel ekleyebilirsiniz.",
      "Metnin içine görsel eklemek için araç çubuğundaki resim simgesine basıp dosya seçin — görsel otomatik yüklenip metne yerleşir.",
      "Hazırsa 'Yayınla' kutusunu işaretleyin (işaretsiz bırakırsanız taslak olarak saklanır, sitede görünmez).",
      "'Kaydet'e basın. Yeni bir yazıya başlamak için 'Temizle / Yeni' deyin.",
    ],
    tips: [
      "Listede her yazının yanında 'Yayında' veya 'Taslak' etiketi görünür.",
      "Var olan bir yazıyı değiştirmek için listeden 'Düzenle'ye basın, form yukarıda dolu gelir.",
      "Görseller sunucuda (Supabase) saklanır; aynı görseli tekrar yüklemenize gerek yoktur.",
      "Formda kaydedilmemiş yazı varken başka bir yazıya geçmeye çalışırsanız uyarı çıkar — içerik kazara kaybolmaz.",
      "Blog şu an tek dilde (Türkçe) çalışır; otomatik çeviri özelliği sadece Turlar formunda vardır.",
    ],
  },
  {
    tab: "Turlar",
    summary:
      "Sitedeki tüm turları yönetirsiniz — tur ekler, düzenler, sıralar, yayına alır, kaldırır ve tek tuşla 4 dile çevirirsiniz.",
    steps: [
      "Yeni tur için formu boş doldurun ya da listedeki bir turda 'Düzenle'ye basın.",
      "'Çok günlü tur' kutusu, turun sitede hangi bölümde görüneceğini belirler: günübirlik turlar mı, Çok Günlü Ekspedisyonlar mı.",
      "Fiyat, mesafe, kalkış/dönüş saati gibi sayısal/pratik bilgileri üstteki alanlara girin (çok günlü turda gün sayısı, gece sayısı ve kişi başı fiyat çıkar).",
      "Kapak görselini ve galeri görsellerini bilgisayarınızdan yükleyin ya da hazır bir görsel adresi (URL) yapıştırın.",
      "4 dilli içerik bölümüne gelin: Başlığı, sloganı ve açıklamayı en azından Türkçe (TR) olarak doldurun.",
      "Sağ üstteki turuncu 'Türkçeden Tümünü Çevir' butonuna basın — Türkçe yazdığınız her şey tek tuşla İngilizce, Fransızca ve Rusça'ya otomatik çevrilir.",
      "İsterseniz her alanın kendi başlığının yanındaki küçük 'TR'den çevir' butonuyla sadece o tek alanı da çevirebilirsiniz.",
      "Otomatik çeviri sonrası EN/FR/RU kutularını gözden geçirin; gerekirse elle düzeltin — çeviri motoru mükemmel değildir, kontrol iyi bir alışkanlıktır.",
      "Liste alanlarında (öne çıkanlar, dahil olanlar vb.) her satır ayrı bir madde olur; çeviri de satır satır, aynı sırada yapılır.",
      "Tur programı / gün gün program gibi alanlarda 'ikon | başlık | açıklama' biçimi kullanılır — otomatik çeviri sadece başlık ve açıklamayı çevirir, ikonu/gün numarasını değiştirmez.",
      "'Sıra' turun kendi bölümündeki yerini belirler (küçük sayı önce gelir).",
      "'Yayınla' işaretli değilse tur sitede görünmez.",
      "'Kaydet'e basın; değişiklik sitede hemen yayına girer.",
    ],
    tips: [
      "Panel boşken site koddaki hazır turları gösterir; 'Statik turları içe aktar' butonu hepsini tek seferde panele taşır.",
      "Bir turu silmek yerine 'Yayınla' işaretini kaldırmak daha güvenlidir — içerik kaybolmaz.",
      "Otomatik çeviri ücretsiz bir dış servis kullanır ve günlük kullanım sınırı vardır. 'Çeviri başarısız' ya da 'kota' ile ilgili bir hata görürseniz bize haber verin — servisin başka bir hesapla yenilenmesi gerekebilir. Bu arada Türkçe metni girip kaydetmeye devam edebilirsiniz, boş bırakılan diller otomatik olarak Türkçe metni gösterir.",
      "Zaten elle düzenlediğiniz bir çeviriniz varsa 'Türkçeden Tümünü Çevir' onun da üzerine yazar — özenle yazdığınız çevirileri kaybetmemek için önce Türkçe metni tamamlayıp en son toplu çeviriyi çalıştırın.",
    ],
  },
  {
    tab: "Yorumlar",
    summary:
      "Sitede gösterilen müşteri yorumlarını yönetirsiniz — tek tek veya toplu ekleyebilir, otomatik çeviriyle 4 dile ulaştırabilirsiniz.",
    steps: [
      "Tek yorum için: 'Yeni Yorum' formunda Yazar, Puan (1-5), Yorum metni (orijinal dilinde), Orijinal dil ve isteğe bağlı Kaynak (Google, TripAdvisor) girin, 'Kaydet'e basın.",
      "Çok sayıda yorum için 'Toplu Ekle' kutusunu kullanın.",
      "Satır biçimi: ilk satıra 'Ad | 5', alt satıra yorum metni; her yorumu üç çizgi (---) ile ayırın. JSON dizisi formatı da desteklenir.",
      "'Yorumları Ekle'ye basın; kaç tanesinin eklendiği size bildirilir — çeviri arka planda otomatik başlar.",
      "Bir yorum kartında 'Çeviriler'e basarak TR/EN/FR/RU sekmelerini görebilir, her dili elle düzenleyip kaydedebilirsiniz.",
      "Elle kaydettiğiniz bir çeviri bir daha otomatik çeviri tarafından üzerine yazılmaz (kalem ✎ işaretiyle gösterilir).",
      "Otomatik çeviri eksik kaldıysa veya sonradan düzelttiyseniz kart üzerindeki 'Yeniden Çevir'e basın.",
      "Üstteki 'Otomatik çeviri' bölümünden 'Tümünü Çevir'e basarak tüm yorumlardaki eksik dilleri toplu tamamlayabilirsiniz.",
      "Bir yorumu yayından kaldırmak için 'Düzenle' > Durum'u 'Arşiv' yapın (silmeden gizlenir).",
      "'Sıra' alanı yorumların ana sayfadaki akan şeritte hangi sırayla görüneceğini belirler.",
    ],
    tips: [
      "Google yorumlarını kopyalayıp Toplu Ekle ile hızlıca aktarabilirsiniz.",
      "Yanlış girilen yorumu 'Sil' ile tamamen kaldırabilirsiniz (onay sorulur).",
      "Arama kutusuyla yazar, metin, kaynak veya dile göre yorumları filtreleyebilirsiniz.",
      "Bu bölümdeki otomatik çeviri de ücretsiz bir dış servisi kullanır; günlük kota dolarsa aynı şekilde bize haber verin.",
    ],
  },
  {
    tab: "Güncellemeler",
    summary:
      "Sitede bugüne kadar yapılan tüm geliştirmelerin ve sırada bekleyen işlerin listesidir.",
    steps: [
      "Bu sayfa sadece okumak içindir — burada değişiklik yapmazsınız.",
      "En üstte en yeni geliştirmeler, altta tarih sırasıyla eskiler yer alır.",
      "Her kartın sağ üstünde geliştirmenin tarihi, altında o güne ait madde madde değişiklik listesi görünür.",
      "En alttaki turuncu 'Sırada / İçerik Bekleyen' kutusu, sizden içerik veya onay beklenen işleri gösterir.",
    ],
    tips: [
      "'Neler yapıldı, ne kaldı?' sorusunun cevabını burada bulursunuz.",
      "Bekleyen bir maddeyi tamamladığınızda (içerik gönderdiğinizde, erişim verdiğinizde vb.) bunu WhatsApp grubundan veya Revizyonlar > Genel Durum Raporu yorumlarından bize bildirin — biz de raporu ve bu listeyi güncelleriz.",
    ],
  },
];

/** Sekme key → rehber bölümü eşlemesi (akordeon bu eşlemeden okur). */
export const GUIDE_BY_TAB: Record<string, GuideSection> = Object.fromEntries(
  GUIDE_SECTIONS.map((s) => [s.tab, s]),
);
