/**
 * "Rehber" — admin panelinin nasıl kullanılacağını anlatan statik yardım
 * sayfası. Teknik bilgisi olmayan kullanıcılar (Elif, müşteri ekibi) için
 * her sekmenin ne işe yaradığını ve adım adım nasıl kullanılacağını açıklar.
 * Yeni bir panel/özellik eklenince buradaki ilgili bölümü de güncelleyin.
 */

import type { ReactNode } from "react";
import { AdminSurface } from "./admin-ui";

interface GuideSection {
  /** Üst şeritteki sekme adıyla aynı etiket */
  tab: string;
  /** Bölümün ne işe yaradığını anlatan tek cümle */
  summary: string;
  /** Adım adım kullanım talimatları */
  steps: string[];
  /** İsteğe bağlı ipuçları / dikkat edilecekler */
  tips?: string[];
}

const SECTIONS: GuideSection[] = [
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
    tab: "Galeri",
    summary:
      "Sitedeki fotoğraf galerisini yönetirsiniz — fotoğraf ekler, sıralar, gizler veya silersiniz.",
    steps: [
      "'Fotoğraf' alanından bilgisayarınızdan bir görsel seçin; önizleme çıkar.",
      "'Başlık / Açıklama' fotoğrafın üzerinde görünür (örn. 'Kekova Batık Şehir').",
      "'Alt metin' SEO ve erişilebilirlik içindir; boş bırakırsanız başlık kullanılır.",
      "'Sıra' fotoğrafın galeride kaçıncı sırada görüneceğini belirler (küçük sayı önce gelir).",
      "'Yayınla' işaretliyse sitede görünür; kaldırırsanız 'Gizli' olur ve ziyaretçilere gösterilmez.",
      "'Kaydet'e basın. Var olan bir fotoğrafı değiştirmek için 'Düzenle'yi kullanın.",
    ],
    tips: [
      "Galeri boşsa site geçici olarak örnek görseller gösterir; siz ekledikçe gerçekleriyle değişir.",
      "Sıralamayı değiştirmek için fotoğrafları düzenleyip 'Sıra' sayısını ayarlamanız yeterli.",
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

const TOP_BAR = [
  {
    label: "Şifre Değiştir",
    text: "Sağ üstteki buton ile panel şifrenizi değiştirebilirsiniz. Yeni şifre en az 8 karakter olmalıdır.",
  },
  {
    label: "Çıkış",
    text: "İşiniz bitince 'Çıkış' ile oturumu kapatın. Ortak bir bilgisayar kullanıyorsanız bu önemlidir.",
  },
  {
    label: "Google Drive",
    text: "Üstteki turuncu kart, tüm belge ve görsellerin bulunduğu proje klasörünü yeni sekmede açar.",
  },
  {
    label: "WhatsApp Grubu",
    text: "Yeşil kart, proje iletişim WhatsApp grubunu açar — sorularınızı buradan iletebilirsiniz.",
  },
];

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-teal/10 bg-white p-6 shadow-[0_18px_50px_rgba(4,43,37,0.07)]">
      {children}
    </div>
  );
}

export default function GuidePanel() {
  return (
    <div className="space-y-8">
      <AdminSurface
        title="Admin Paneli Rehberi"
        description="Bu panel ile sitedeki içeriği yönetir, rezervasyon taleplerini takip eder ve ekip içi istekleri kaydedersiniz. Teknik bilgi gerekmeden ilerleyebilmeniz için her bölümün kullanımı aşağıda özetlenmiştir."
        className="border-orange/20 bg-orange/5"
      >
        <div className="text-sm leading-7 text-teal/70">
          İlk kez giren kullanıcı için en doğru başlangıç noktası bu ekran. Sekmelerin tamamı
          mevcut işlevleri korur; sadece yeni çalışma alanında daha net bir akışla sunulur.
        </div>
      </AdminSurface>

      {/* Genel: üst bar / kartlar */}
      <Card>
        <h3 className="mb-4 font-bold text-teal-deep">Genel — Üst Bardaki Butonlar</h3>
        <ul className="space-y-3">
          {TOP_BAR.map((b) => (
            <li key={b.label} className="flex gap-3 text-sm text-teal/80">
              <span className="mt-0.5 flex-shrink-0 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal">
                {b.label}
              </span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Sekme rehberleri */}
      {SECTIONS.map((s, idx) => (
        <Card key={s.tab}>
          <div className="mb-3 flex flex-wrap items-baseline gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange/15 text-sm font-bold text-orange">
              {idx + 1}
            </span>
            <h3 className="font-bold text-teal-deep">{s.tab} sekmesi</h3>
          </div>
          <p className="mb-4 text-sm text-teal/70">{s.summary}</p>

          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal/50">
            Nasıl kullanılır
          </div>
          <ol className="mb-4 space-y-2">
            {s.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-teal/80">
                <span className="mt-0.5 flex-shrink-0 font-bold text-teal-light">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {s.tips && s.tips.length > 0 && (
            <div className="rounded-xl border border-teal/10 bg-foam/40 p-4">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal/50">
                İpuçları
              </div>
              <ul className="space-y-1.5">
                {s.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-teal/80">
                    <span className="mt-0.5 flex-shrink-0 text-orange">★</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      {/* Kapanış / sık karşılaşılanlar */}
      <Card>
        <h3 className="mb-4 font-bold text-teal-deep">Sık Sorulanlar</h3>
        <ul className="space-y-3 text-sm text-teal/80">
          <li>
            <span className="font-semibold text-teal-deep">Bir şeyi yanlışlıkla sildim, geri alabilir miyim?</span>{" "}
            Silme işlemleri kalıcıdır. Bu yüzden silmeden önce onay sorulur. Emin değilseniz
            yayından kaldırmayı (Galeri/Yorumlar için 'Gizli' / 'Arşiv') tercih edin.
          </li>
          <li>
            <span className="font-semibold text-teal-deep">Yaptığım değişiklik sitede neden görünmüyor?</span>{" "}
            Blog ve galeride içerik 'Taslak' / 'Gizli' ise ziyaretçilere gösterilmez. 'Yayınla'
            kutusunu işaretlediğinizden emin olun.
          </li>
          <li>
            <span className="font-semibold text-teal-deep">Panele kimler girebilir?</span>{" "}
            Sadece yetkilendirilmiş e-posta adresleri. Listede olmayan bir hesap giriş yapsa bile
            otomatik çıkış yaptırılır.
          </li>
          <li>
            <span className="font-semibold text-teal-deep">Bir sorun veya değişiklik isteğim var.</span>{" "}
            'Revizyonlar' sekmesinden kaydedin ya da WhatsApp grubundan yazın.
          </li>
        </ul>
      </Card>
    </div>
  );
}
