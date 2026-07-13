# Turları tamamen DB'ye taşıma (statik fallback kaldırma)

## Sorun

Ana sayfadaki "Çok Günlü Ekspedisyonlar" bölümünde bazı tur kartlarında fotoğraf yerine
boş yeşil gradient görünüyordu. Kök neden: `useToursData()`/`useTour()` hook'ları önce
`STATIC_TOURS_DATA` (kod içine gömülü `TOURS` + `MULTI_DAY_TOURS`) ile render ediyor,
ardından DB'den veri gelince onunla değiştiriyor. Statik veri setindeki 4 turun
(`lycian-comfort-escape`, `coast-of-light`, `kekova-sound`, `carian-shore`,
`trak-signature`) `heroImage` yolu `public/images/tours/` kökünde hiç var olmayan
dosyalara işaret ediyordu, bu yüzden her sayfa yüklemesinde DB verisi gelene kadarki ilk
paint anında kırık/boş kart görünüyordu.

DB tarafı kontrol edildi: `public.tours` tablosundaki 9 kayıt da dolu, `hero_image`
alanları geçerli Supabase Storage URL'leri (hepsi HTTP 200 dönüyor), `description`,
`highlights`, `multi_day.dayByDay` gibi alanlar da eksiksiz ve çok dilli. Yani DB zaten
üretime hazır; sorun sadece statik fallback'in araya girmesiydi.

## Karar

Statik fallback tamamen kaldırılacak. Site artık yalnızca `public.tours` tablosundan
veri okuyacak. DB'ye erişilemediğinde (ağ hatası, yanlış yapılandırma, Supabase kesintisi)
kırık/yanlış statik veri göstermek yerine kullanıcıya açık bir hata durumu gösterilecek.

## Kapsam

### 1. `src/hooks/useTours.ts`
- `STATIC_TOURS_DATA` sabiti ve onu üreten import'lar (`TOURS`, `MULTI_DAY_TOURS`) kaldırılır.
- `fetchPublishedTours()`: hata veya boş sonuçta artık statik veriye düşmez;
  hata durumunda `throw` eder (çağıran taraf yakalar), boş sonuçta `{ dayTours: [], multiDayTours: [] }` döner.
- `useToursData()`: `{ dayTours, multiDayTours, loading, error }` şekline genişler.
  Başlangıç state'i boş dizilerdir (statik veri yok); `loading: true` ile başlar.
- `useTour(slug)`: `getTour()` statik-arama fallback'i kaldırılır. DB'de bulunamazsa
  `{ tour: undefined, loading: false, error? }` döner.
- `importStaticTours()` fonksiyonu kaldırılır (statik veri kaynağı kalmayacağı için).

### 2. Tüketen bileşenler — yeni `loading`/`error` state'ini karşılama
- `src/components/home/TourHighlights.tsx`
- `src/pages/Tours.tsx`
- `src/pages/About.tsx`
- `src/components/home/WhyChooseUs.tsx`
- `src/components/reservation/ReservationForm.tsx`

Her biri: `loading` iken mevcut iskelet/placeholder davranışını korur (ya da basit bir
yükleniyor durumu eklenir, bileşende zaten yoksa); `error` iken kullanıcıya Türkçe kısa bir
mesaj gösterir: "Turlar yüklenemedi, lütfen daha sonra tekrar deneyin." Tasarım/CSS
değişikliği kapsam dışı — mevcut kart/liste yapısı korunur, sadece veri kaynağı ve
boş/hata durumu değişir.

`ReservationForm.tsx`'teki `getTour(data.tourSlug)` fallback çağrısı kaldırılır; sadece
DB'den gelen `dayTours` içinde arama yapılır.

### 3. `src/content/tours.ts`
- `TOURS` dizisi ve statik arama yapan `getTour()` gövdesi kaldırılır.
- Paylaşılan type tanımları (`Tour`, `Localized`, `ItineraryStep`, `DayPlan`,
  `MultiDayMeta`, `TourStatus`, `TourSlug`) olduğu gibi kalır — bunlar DB satırlarını
  domain modeline çeviren `rowToTour()`, admin formu ve `TourCard`/`TourForm` gibi UI
  bileşenlerinde hâlâ kullanılıyor.
- `MULTI_DAY_TOURS` re-export'u kaldırılır.

### 4. Silinecek dosyalar
- `src/content/multiDayTours.ts`
- `src/content/tourImages.ts`
- Bu dosyalara özgü statik-veri testleri: `src/content/tours.test.ts` ve
  `src/hooks/useTours.test.ts` içindeki `TOURS`/`MULTI_DAY_TOURS`/`getTour()` statik-arama
  senaryolarını doğrulayan test case'leri kaldırılır veya DB-mock'lu eşdeğerleriyle
  değiştirilir (test dosyalarının geri kalanı, örn. `rowToTour`/`tourToInput` testleri, korunur).

### 5. Admin panel (`src/pages/admin/tours/ToursPanel.tsx`)
- "Statik turları içe aktar" butonu ve `handleImport` fonksiyonu kaldırılır.
- Boş-liste mesajı ("Panelde henüz tur yok...") güncellenir — artık içe aktarma
  önerisi değil, doğrudan "Yeni tur" formuna yönlendirme yapılır.

## Test planı
- `npm run test` (veya proje test komutuyla) — güncellenmiş `useTours.test.ts` ve
  `tours.test.ts` dosyaları DB-mock senaryolarıyla geçmeli.
- `npm run build` — silinen dosyalara kalan import olmadığını (TypeScript hatası
  vermediğini) doğrular.
- Manuel: dev sunucusu ile ana sayfa ve `/tours` sayfası açılıp DB'den gelen 9 turun
  tamamının doğru hero görselleriyle göründüğü teyit edilir.
