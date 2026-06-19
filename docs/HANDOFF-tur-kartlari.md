> ✅ **DONE (2026-06-19):** Tur kartı "basınca genişleme" + "Detaya git" işi kod olarak
> tamamlanmış ve build temiz (`TourCard.tsx`). Tarayıcı/etkileşim doğrulaması kullanıcıya
> bırakıldı (aşağıdaki kontrol listesi). React/Vite migrasyonu commit edildi.

# Handoff — Tur Kartları "Basınca Genişleme" + Tur Detay

**Tarih:** 2026-06-19
**Konu:** Ana sayfada günlük tur kartlarına basınca yerinde genişleme + "Detaya git" → tur detay sayfası.

---

## 1. Bağlam (önemli!)

Bu oturumda proje **statik HTML'den React + Vite + TypeScript + Tailwind SPA'ya** taşındı
(büyük olasılıkla paralel bir süreç/migrasyon tarafından). Çalışmaya başladığımda eski
dosyalar (`mvp.html`, `admin.html`, `config.js`, `blog.html`, `nginx.conf`) silinmiş ya da
`legacy/`'ye taşınmıştı; yerlerine React scaffold gelmişti (`package.json`, `src/`,
`vite.config.ts`, `tailwind.config.ts`).

Orijinal istek: **"Ana sayfada günlük turlar kartı oluşacak; tur kartına basınca kart
büyüyecek; 'detaya git' deyince tur sayfasına gidecek; diğer değişikliklere dokunmadan."**

Yeni React yapısında istenenin **çoğu zaten kuruluydu**:
- Ana sayfada "Günlük Turlar" bölümü: `src/components/home/TourHighlights.tsx` → `TourGrid` → `TourCard`.
- Kartlarda zaten "Detaya git" linki vardı (`/:lang/turlar/:slug` → `TourDetail`).
- **Eksik olan tek şey: "karta basınca yerinde genişleme" idi.** Bu oturumda o eklendi.

Router (`src/App.tsx`): `/:lang/...` yapısı, i18n `tr` (varsayılan) / `en` / `fr`.
Tur verisi: `src/content/tours.ts` — 3 tur (kekova-classic, kekova-west, kekova-east),
tam 3 dilli (title, tagline, highlights, included, itinerary, whyChoose, routeStops...).

---

## 2. Bu oturumda yapılan değişiklikler

### A) `src/components/tours/TourCard.tsx` — TAMAMEN YENİDEN YAZILDI
Karta **basınca yerinde genişleme** davranışı eklendi:
- `useState(open)` + kart gövdesinde `role="button"`, `tabIndex=0`, `aria-expanded`,
  `aria-controls`, Enter/Space klavye desteği, dönen `ChevronDown`.
- Açılan panel `framer-motion` (`AnimatePresence` + `height: auto`) ile yumuşak açılır/kapanır.
  İçerik: **Rota** (`tour.routeStops`), **Öne çıkanlar** (`pick(tour.highlights)`),
  **Dahil olanlar** (`pick(tour.included)`). Etiketler mevcut i18n anahtarlarından:
  `common.route`, `common.highlights`, `common.included` (tr/en/fr'de hepsi mevcut — yeni anahtar EKLENMEDİ).
- **"Detaya git"** (`common.viewDetails`) butonu her zaman görünür, kartın altına sabit
  (`mt-auto`), `to={localePath(turlar/${slug})}`. Linkte `onClick={(e) => e.stopPropagation()}`
  → tıklama kartı toggle ETMEZ, doğrudan detaya gider. (Orijinal isteğin kritik kuralı.)

### B) `tailwind.config.ts` — BUILD DÜZELTMESİ (scaffold eksiği)
`src/index.css` `@apply border-border` kullanıyor ve `:root` içinde `--border`, `--ring`,
`--background`, `--foreground`, `--primary`, `--accent`, `--muted` CSS değişkenlerini
tanımlıyordu; ama `tailwind.config.ts` bu token'ları renk olarak KAYDETMEMİŞTİ →
`border-border` "unknown utility" hatası → **proje hiç derlenmiyordu.**
`theme.extend.colors`'a şu HSL-değişken token'ları eklendi (mevcut marka paleti korunarak):
`border, ring, background, foreground, primary{DEFAULT,foreground}, accent{DEFAULT,foreground}, muted`
— hepsi `hsl(var(--...))` formunda.

> Not: Bu, benim eklediğim özelliğin değil, scaffold'un bıraktığı bir hata. Temiz build için şarttı.

---

## 3. Doğrulama (yapılan)

- `npm run build` → **TEMİZ** (`tsc -b && vite build` hatasız). Tek uyarı: önceden var olan
  "chunk > 500 kB" uyarısı (bizim işimizle ilgisiz, code-splitting önerisi).
- `npm run preview` → `/tr` = **200**, `/tr/turlar/kekova-classic` = **200**.
- Üretim bundle'ında kartın `aria-expanded`/`aria-controls` ve `routeStops`/`viewDetails`
  wiring'i mevcut (grep ile doğrulandı).

### ⚠️ YAPILMAYAN doğrulama (sonraki sessionda yapılmalı)
Bu oturumda **tarayıcı sürücü aracı (Playwright / Chrome MCP) yoktu**, bu yüzden gerçek
fare tıklamasıyla genişleme/çökme **otomatik test EDİLEMEDİ**. Mantık kod incelemesiyle
doğru ve build temiz; ama göz/etkileşim onayı gerekiyor:

```bash
npm run dev      # http://localhost:5173/tr   (preview ise :4173)
```
Kontrol listesi:
1. Ana sayfada bir tur kartına tıkla → **yerinde genişlemeli** (Rota/Öne çıkanlar/Dahil olanlar).
2. Tekrar tıkla → **kapanmalı**. Chevron dönüyor mu?
3. "Detaya git" → `/tr/turlar/<slug>` açılmalı ve **kartı toggle ETMEMELİ**.
4. Klavye: karta Tab ile gel, Enter/Space ile aç/kapa.
5. Dil değiştir (`/en`, `/fr`) → etiketler ve içerik çevrilmiş mi?
6. Mobil/dar ekran: grid ve genişleme düzgün mü?

---

## 4. Commit durumu / dikkat

- **Hiçbir şey commit EDİLMEDİ.** Tüm `src/`, `package.json`, `tailwind.config.ts`, `public/`
  vb. **untracked** (paralel migrasyon süreci oluşturdu). Eski dosyalar staged/silinmiş halde.
- `git status` özeti: `legacy/` altına taşınan eski HTML'ler silinmiş; `blog.html`, `config.js`,
  `nginx.conf` değişmiş/silinmiş; React scaffold tamamı `??` (untracked).
- Sonraki session: önce `git status` + `git diff` ile migrasyonu gözden geçir, sonra
  anlamlı bir commit'le (ör. `feat: React/Vite SPA migrasyonu + tur kartı genişletme`) topla.

## 5. Dokunulan dosyalar (özet)
| Dosya | Değişiklik |
|-------|-----------|
| `src/components/tours/TourCard.tsx` | Yeniden yazıldı — basınca genişleme + stopPropagation'lı "Detaya git" |
| `tailwind.config.ts` | CSS-değişkeni renk token'ları eklendi (build fix) |
| `docs/HANDOFF-tur-kartlari.md` | Bu handoff dosyası |

## 6. İlgili dosyalar (değişmedi, referans)
- `src/content/tours.ts` — tur verisi (3 tur, 3 dil). Yeni tur eklemek istenirse burası.
- `src/components/home/TourHighlights.tsx` — ana sayfa "Günlük Turlar" bölümü (TourCard'ı kullanır).
- `src/pages/TourDetail.tsx` — "Detaya git" hedefi.
- `src/i18n/locales/{tr,en,fr}/common.json` — `common.route/highlights/included/viewDetails` etiketleri.
- `src/App.tsx`, `src/lib/routes.ts` — route yapısı (`SEG.tours = "turlar"`).
