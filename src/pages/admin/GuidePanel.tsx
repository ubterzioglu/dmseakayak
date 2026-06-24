/**
 * "Rehber" — admin panelinin nasıl kullanılacağını anlatan statik yardım
 * sayfası. Teknik bilgisi olmayan kullanıcılar (Elif, müşteri ekibi) için
 * her sekmenin ne işe yaradığını ve adım adım nasıl kullanılacağını açıklar.
 * Yeni bir panel/özellik eklenince buradaki ilgili bölümü de güncelleyin.
 */

import type { ReactNode } from "react";
import { type AdminPanelProps, AdminSurface } from "./admin-ui";
import { GUIDE_SECTIONS as SECTIONS } from "./guide-content";

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

export default function GuidePanel({ infoSlot }: AdminPanelProps) {
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

      {infoSlot}

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
            <h3 className="font-bold text-teal-deep">{s.tab} sekmesi — Nasıl kullanılır</h3>
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
