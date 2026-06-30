import { CheckCircle2, Clock } from "lucide-react";

/**
 * Static "Genel Durum Raporu" shown as a collapsible card inside the Revizyonlar
 * panel. Mirrors docs/bekledigimiz-seyler.md so Osi & Elif can see — at a glance,
 * inside the admin panel — what is still waiting on them. Update this component
 * (and the source markdown) together when the outstanding list changes.
 */

interface WaitingItem {
  title: string;
  body: React.ReactNode;
}

const OSI_ITEMS: WaitingItem[] = [
  {
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
  {
    title: "Drone videosu (kısa ve net hali)",
    body: (
      <>
        <p>
          <strong>Video kalitesi:</strong> Daha <strong>kısa ve yüksek kaliteli</strong> bir
          kesit gönderebilir misin? Uzun/büyük video sayfayı yavaşlatıyor — sen kısa kesiti
          at, biz koyalım.
        </p>
        <p className="mt-2">
          <strong>Hero kutusu:</strong> Videonun üzerindeki kutudan rezervasyon formunu
          kaldırdık. Ama hâlâ yarı-şeffaf bir kutu + "Turları keşfet" / "Hemen rezervasyon"
          butonları duruyor. <strong>Bunları tamamen kaldıralım mı, yoksa kalsın mı?</strong>{" "}
          Bir "evet kaldır" / "kalsın" de, ona göre yapalım.
        </p>
      </>
    ),
  },
  {
    title: "Kekova Klasik fiyatı — küçük bir onay",
    body: (
      <>
        Yemek "isteğe bağlı" olsun ve fiyat şöyle net görünsün dedin:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>45€</strong> (yemeksiz)
          </li>
          <li>
            <strong>60€</strong> (yemekli)
          </li>
        </ul>
        <p className="mt-2">
          Şu an sadece 45€ görünüyor ve yanında İngilizce "(optional)" yazıyor. Sen "evet
          böyle olsun" dersen 5 dakikalık iş, hemen düzeltiriz. (Türkçede "isteğe bağlı"
          yazacağız.)
        </p>
      </>
    ),
  },
];

const ELIF_ITEMS: WaitingItem[] = [
  {
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
  { who: "Osi", what: 'Kısa & kaliteli drone video + "kutuyu kaldıralım mı?" cevabı' },
  { who: "Osi", what: "Kekova Klasik fiyat gösterimi onayı (45€ / 60€)" },
  { who: "Elif", what: "Google işletme hesabı erişimi (yorumlar için)" },
];

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
            key={it.title}
            className="rounded-2xl border border-teal/10 bg-white p-4 shadow-[0_8px_24px_rgba(4,43,37,0.04)]"
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-sm font-bold text-orange">{i + 1}.</span>
              <span className="text-sm font-bold text-teal-deep">{it.title}</span>
            </div>
            <div className="text-[13px] leading-6 text-teal/80">{it.body}</div>
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
          Sitedeki revizyonların çoğu bitti (29 istekten 23'ü tamam). Geri kalan birkaç şey{" "}
          <strong className="mx-1">bizde değil, sizde</strong> takılı — siz şunları
          gönderince / onaylayınca biz hemen bitiriyoruz.
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
