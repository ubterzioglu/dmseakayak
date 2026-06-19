> ✅ **DONE (2026-06-19):** Uygulandı. Marquee `src/components/home/ReviewsMarquee.tsx`
> (Home'da, `WhyChooseUs`'tan sonra). Bulk + tekli yönetim mevcut `ReviewsPanel.tsx`
> "Yorumlar" sekmesine eklendi (ayrı `ReviewsAdmin`/`useReviews` AÇILMADI; veri katmanı
> `useAdminContent.ts` — `insertReviews`/`fetchPublishedReviews`). Bulk parse
> `src/lib/parseReviews.ts`. Tailwind `marquee` animasyonu eklendi. i18n `reviewsMarquee`
> tr/en/fr. 5 örnek yorum seed edildi. Google linki hâlâ placeholder (gerçek link bekleniyor).
> Build + test yeşil.

# Google Yorumları — Marquee + Admin Yönetimi (React/Vite) — Uygulama Talimatı

> **Bu dosya başka bir Claude Code session'ına yapıştırılmak üzere hazırlandı.**
> Hedef proje: `dmseakayak` (React 18 + Vite + TypeScript + Tailwind + Supabase + i18n).
> Amaç: Anasayfada **sağdan sola akan bir marquee** içinde Google yorumlarını göstermek;
> admin panelinde bu yorumları **toplu ekleme + tekli ekleme + yayınla/arşivle/sil** ile yönetmek.
> Yorumlar Supabase `reviews` tablosunda tutulur. İçerik sahibi (kullanıcı) yorumları
> **bulk** olarak verecek; admin panelden yönetecek.

---

## 0) Bağlam — mevcut mimari (DEĞİŞTİRME, sadece uy)

- `src/lib/supabase.ts` → `supabase` adlı client'ı export eder (null olabilir → `hasSupabase`).
- `src/lib/env.ts` → `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` okur (runtime `window.__ENV` öncelikli).
- `src/pages/admin/AdminPage.tsx` → **Supabase Auth** (email+şifre) ile korunuyor. `reservation_requests`
  tablosunu yönetiyor. Yorumlar yönetimi BURAYA, mevcut oturum (`session`) içine ikinci bir bölüm olarak eklenecek.
- `src/pages/Reviews.tsx` → şu an **hardcoded** `REVIEWS[]` dizisi var (Supabase değil). Onu bu işte **DEĞİŞTİRMİYORUZ**;
  marquee ayrı, anasayfaya konan bağımsız bir bileşendir. (İstenirse Reviews.tsx sonradan DB'ye bağlanır — bu talimatın kapsamı dışı.)
- Tema renkleri (Tailwind, `tailwind.config.ts`): `teal` (`DEFAULT #016352`, `deep #014439`, `light #0a8a74`),
  `orange` (`DEFAULT #f16e0b`, `soft #ff8a33`), `foam #eaf6f3`, `sand #f7f1e7`, `ink #042b25`. Font: Poppins.
- Path alias: `@/` → `src/`. i18n: `useLang()` → `{ t }`. Diller: tr (default), en, fr.
- UI primitives: `@/components/ui/section` → `Section`, `SectionHeading`. `lucide-react` → `Star` ikonu.

> **Güvenlik modeli notu:** React admin **authenticated** (Supabase Auth). Bu yüzden `reviews` RLS'i:
> **okuma** → herkese açık AMA sadece `published`; **yazma (insert/update/delete)** → yalnızca `authenticated`.
> (Statik `legacy/admin.html`'deki anon-yazma deseninden bilinçli olarak FARKLI — React tarafı daha güvenli.)

---

## 1) Veritabanı — `reviews` tablosu + RLS

> **DURUM:** Bu adım `scripts/setup-supabase.sh` içine **ZATEN EKLENDİ** (adım `[3/4] reviews tablosu + RLS`,
> authenticated-yazma modeliyle — aşağıdaki SQL ile birebir aynı). Yeniden eklemene gerek YOK; sadece
> `bash scripts/setup-supabase.sh` çalıştırarak tabloyu Supabase'de oluştur. Script idempotent (tekrar
> çalıştırılabilir). Aşağıdaki SQL referans amaçlıdır:

```sql
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  body text not null,
  source_label text,                       -- ör. "Google" — kart üzerinde rozet (opsiyonel)
  status text not null default 'published' check (status in ('published','archived')),
  sort_order integer not null default 0,   -- marquee sırası (artan)
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

drop policy if exists "public read published reviews" on public.reviews;
drop policy if exists "auth insert reviews" on public.reviews;
drop policy if exists "auth update reviews" on public.reviews;
drop policy if exists "auth delete reviews" on public.reviews;

-- Ziyaretçi (anon) YALNIZCA yayında olanları görür → arşiv sızmaz.
create policy "public read published reviews" on public.reviews
  for select using (status = 'published');

-- Admin = authenticated kullanıcı; ekleme/güncelleme/silme yalnızca giriş yapana açık.
-- authenticated rolü tüm satırları SELECT edebilir mi? Yukarıdaki select policy 'public' (anon+authenticated)
-- olduğundan authenticated da yalnızca published görür. Admin'in ARŞİVİ de görmesi için ek policy:
drop policy if exists "auth read all reviews" on public.reviews;
create policy "auth read all reviews" on public.reviews
  for select to authenticated using (true);

create policy "auth insert reviews" on public.reviews
  for insert to authenticated with check (true);
create policy "auth update reviews" on public.reviews
  for update to authenticated using (true) with check (true);
create policy "auth delete reviews" on public.reviews
  for delete to authenticated using (true);
```

> İki SELECT policy birlikte: anon → sadece published; authenticated → tümü (OR mantığıyla birleşir). Doğru.

Çalıştır: `bash scripts/setup-supabase.sh` (`.env.local` içinde `SB_PROJECT_URL` + `SB_ACCESS_TOKEN` olmalı).

---

## 2) Veri katmanı — `src/hooks/useReviews.ts` (YENİ DOSYA)

```ts
import { supabase } from "@/lib/supabase";

export interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  body: string;
  source_label: string | null;
  status: "published" | "archived";
  sort_order: number;
  created_at: string;
}

export interface ReviewInput {
  author: string;
  rating: number;
  body: string;
  source_label?: string | null;
  status?: "published" | "archived";
  sort_order?: number;
}

/** Ziyaretçi tarafı: sadece yayında olanlar, sort_order'a göre. */
export async function fetchPublishedReviews(): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchPublishedReviews:", error.message);
    return [];
  }
  return (data ?? []) as ReviewRow[];
}

/** Admin tarafı: tümü (yayın + arşiv). */
export async function fetchAllReviews(): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("status", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchAllReviews:", error.message);
    return [];
  }
  return (data ?? []) as ReviewRow[];
}

export async function insertReviews(rows: ReviewInput[]): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: "no-supabase" };
  if (!rows.length) return { ok: false, reason: "empty" };
  const payload = rows.map((r, i) => ({
    author: r.author,
    rating: r.rating,
    body: r.body,
    source_label: r.source_label ?? "Google",
    status: r.status ?? "published",
    sort_order: r.sort_order ?? i,
  }));
  const { error } = await supabase.from("reviews").insert(payload);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function setReviewStatus(
  id: string,
  status: "published" | "archived",
): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: "no-supabase" };
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteReview(id: string): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: "no-supabase" };
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
```

---

## 3) Bulk parse yardımcısı — `src/lib/parseReviews.ts` (YENİ DOSYA)

Kullanıcı yorumları **iki formattan biriyle** yapıştırabilsin: (a) JSON dizi, (b) basit satır formatı.
Esnek ol, hataya dayanıklı ol, asla throw etme.

```ts
import type { ReviewInput } from "@/hooks/useReviews";

/**
 * İki girdi biçimini destekler:
 *
 * 1) JSON dizi:
 *    [{ "author": "Ad", "rating": 5, "body": "metin", "source_label": "Google" }, ...]
 *
 * 2) Satır bloğu — her yorum "---" ile ayrılır, ilk satır "Ad | 5", kalan satırlar gövde:
 *    Sophie M. | 5
 *    Harika bir deneyimdi...
 *    ---
 *    James R. | 4
 *    Çok iyiydi...
 *
 * rating belirtilmezse 5 varsayılır. Boş/eksik kayıtlar atlanır.
 */
export function parseBulkReviews(raw: string): { rows: ReviewInput[]; errors: string[] } {
  const errors: string[] = [];
  const text = raw.trim();
  if (!text) return { rows: [], errors: ["Girdi boş."] };

  // --- JSON denemesi ---
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const rows: ReviewInput[] = [];
      arr.forEach((item, i) => {
        const author = String(item.author ?? "").trim();
        const body = String(item.body ?? item.text ?? "").trim();
        const rating = clampRating(Number(item.rating ?? 5));
        if (!author || !body) {
          errors.push(`#${i + 1}: author veya body eksik, atlandı.`);
          return;
        }
        rows.push({ author, body, rating, source_label: item.source_label ?? "Google" });
      });
      return { rows, errors };
    } catch (e) {
      errors.push("JSON ayrıştırılamadı: " + (e instanceof Error ? e.message : String(e)));
      return { rows: [], errors };
    }
  }

  // --- Satır bloğu biçimi ---
  const blocks = text.split(/^\s*---\s*$/m).map((b) => b.trim()).filter(Boolean);
  const rows: ReviewInput[] = [];
  blocks.forEach((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const [head, ...rest] = lines;
    const [authorPart, ratingPart] = head.split("|").map((s) => s.trim());
    const author = authorPart;
    const rating = clampRating(Number(ratingPart ?? 5));
    const body = rest.join(" ").trim();
    if (!author || !body) {
      errors.push(`Blok #${i + 1}: ad veya metin eksik, atlandı.`);
      return;
    }
    rows.push({ author, body, rating, source_label: "Google" });
  });
  if (!rows.length) errors.push("Hiç geçerli yorum bulunamadı.");
  return { rows, errors };
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}
```

---

## 4) Marquee bileşeni — `src/components/home/ReviewsMarquee.tsx` (YENİ DOSYA)

Sağdan sola sürekli akar; hover'da ve `prefers-reduced-motion`'da durur. Kesintisiz döngü için
liste iki kez render edilir ve `-50%` transform ile animasyonlanır. Altında "Google'da değerlendir" butonu.

```tsx
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { fetchPublishedReviews, type ReviewRow } from "@/hooks/useReviews";

// TODO: Kullanıcının Google Haritalar işletme linkini buraya koy.
// "Yorum yaz" formunu doğrudan açmak için ?...&placeid=... biçimi de kullanılabilir;
// basit yöntem: işletmenin Google Maps sayfasının paylaş linki.
const GOOGLE_REVIEW_URL = "https://www.google.com/maps/search/?api=1&query=Dragoman+SeaKayak+Kas";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "fill-orange text-orange" : "fill-transparent text-teal/20"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: ReviewRow }) {
  return (
    <figure className="mx-3 flex w-[300px] flex-shrink-0 flex-col rounded-2xl border border-teal/10 bg-white p-6 shadow-[0_10px_30px_rgba(1,68,57,0.08)] sm:w-[340px]">
      <div className="mb-2 flex items-center justify-between">
        <Stars rating={r.rating} />
        {r.source_label && (
          <span className="rounded-full bg-foam px-2 py-0.5 text-[0.7rem] font-bold text-teal">
            {r.source_label}
          </span>
        )}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-teal/80 line-clamp-6">
        &ldquo;{r.body}&rdquo;
      </blockquote>
      <figcaption className="mt-4 border-t border-teal/5 pt-3 font-semibold text-teal-deep">
        {r.author}
      </figcaption>
    </figure>
  );
}

export function ReviewsMarquee() {
  const { t } = useLang();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPublishedReviews().then((rows) => {
      if (alive) {
        setReviews(rows);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Yorum yoksa bölümü hiç gösterme (boş marquee çirkin durur).
  if (!loading && reviews.length === 0) return null;

  // Kesintisiz akış için listeyi ikiye katla.
  const loop = [...reviews, ...reviews];

  // DİKKAT: <Section> içeriği `container` (max-width + ortalama) ile sarar. Tam genişlikte
  // akan şerit `container` İÇİNDE durmaz — bu yüzden başlık+CTA'yı <Section>'da bırakıyoruz,
  // kayan şeridi ise <Section> DIŞINDA, tam-genişlik kendi sarmalayıcısında render ediyoruz.
  return (
    <div className="bg-sand/40 py-16 md:py-20">
      <div className="container">
        <SectionHeading
          eyebrow={t("reviewsMarquee.eyebrow")}
          title={t("reviewsMarquee.title")}
          subtitle={t("reviewsMarquee.subtitle")}
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-teal/50">{t("common.loading")}</p>
      ) : (
        <div className="group relative w-full overflow-hidden py-2">
          {/* Kenar yumuşatma (fade) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-sand/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-sand/70 to-transparent" />

          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {loop.map((r, i) => (
              <ReviewCard key={`${r.id}-${i}`} r={r} />
            ))}
          </div>
        </div>
      )}

      <div className="container mt-8 text-center">
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-semibold text-white shadow-[0_10px_26px_rgba(241,110,11,0.4)] transition-transform hover:-translate-y-0.5 hover:bg-orange-soft"
        >
          {t("reviewsMarquee.cta")}
        </a>
      </div>
    </div>
  );
}
```

### 4a) Marquee animasyonu — `tailwind.config.ts`

`theme.extend` içine `keyframes` + `animation` ekle (zaten varsa birleştir):

```ts
extend: {
  // ...mevcut alanlar...
  keyframes: {
    marquee: {
      "0%": { transform: "translateX(0)" },
      "100%": { transform: "translateX(-50%)" },
    },
  },
  animation: {
    marquee: "marquee 40s linear infinite",
  },
},
```

> Hız ayarı: `40s` değerini değiştir (büyük = yavaş). Yorum sayısı arttıkça süreyi artır
> (ör. ~3s/yorum). Sağdan sola akış için `0% → -50%` doğru yön; ters istenirse yönü değiştir.

> **`line-clamp` notu:** Tailwind v3.3+ çekirdeğinde `line-clamp-6` vardır. Sürüm eskiyse
> `@tailwindcss/line-clamp` eklentisini kur ya da kartta `max-h-[12rem] overflow-hidden` kullan.

---

## 5) Anasayfaya ekle — `src/pages/Home.tsx`

`WhyChooseUs`'tan sonra marquee'yi yerleştir:

```tsx
import { ReviewsMarquee } from "@/components/home/ReviewsMarquee";
// ...
      <Hero />
      <TourHighlights />
      <WhyChooseUs />
      <ReviewsMarquee />   {/* ← EKLE */}
```

---

## 6) Admin paneline yönetim bölümü — `src/pages/admin/AdminPage.tsx`

`AdminPage` zaten `session` (Supabase Auth) ile korunuyor. Mevcut rezervasyon bloğunun ALTINA,
aynı dönen JSX içinde, yorum yönetimi için bağımsız bir bölüm ekle. İzole kalması için ayrı
bir alt-bileşen olarak yazman önerilir: `ReviewsAdmin` (aynı dosyaya ekleyebilirsin ya da
`src/pages/admin/ReviewsAdmin.tsx` yapıp import edebilirsin).

`src/pages/admin/ReviewsAdmin.tsx` (YENİ DOSYA — temiz ayrım için önerilen):

```tsx
import { useCallback, useEffect, useState } from "react";
import {
  fetchAllReviews,
  insertReviews,
  setReviewStatus,
  deleteReview,
  type ReviewRow,
} from "@/hooks/useReviews";
import { parseBulkReviews } from "@/lib/parseReviews";

export function ReviewsAdmin() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulk, setBulk] = useState("");
  const [msg, setMsg] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setReviews(await fetchAllReviews());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBulkAdd = async () => {
    setMsg("");
    const { rows, errors } = parseBulkReviews(bulk);
    if (!rows.length) {
      setMsg("Eklenecek geçerli yorum yok. " + errors.join(" "));
      return;
    }
    const res = await insertReviews(rows);
    if (!res.ok) {
      setMsg("Kaydedilemedi: " + (res.reason ?? "bilinmeyen hata"));
      return;
    }
    setMsg(`${rows.length} yorum eklendi.` + (errors.length ? ` (${errors.length} atlandı)` : ""));
    setBulk("");
    void load();
  };

  const handleStatus = async (id: string, status: "published" | "archived") => {
    setBusyId(id);
    await setReviewStatus(id, status);
    setBusyId(null);
    void load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu yorumu kalıcı olarak sil?")) return;
    setBusyId(id);
    await deleteReview(id);
    setBusyId(null);
    void load();
  };

  const published = reviews.filter((r) => r.status === "published");
  const archived = reviews.filter((r) => r.status === "archived");

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-teal-deep">Yorumlar (Google)</h2>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-full border border-teal/20 px-4 py-1.5 text-sm font-semibold text-teal transition-colors hover:bg-foam disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yenile"}
        </button>
      </div>

      {/* Toplu ekleme */}
      <div className="mb-6 rounded-2xl border border-teal/10 bg-white p-5 shadow-sm">
        <h3 className="mb-2 font-semibold text-teal-deep">Toplu Ekle</h3>
        <p className="mb-2 text-xs text-teal/60">
          JSON dizi <code>[{`{ "author": "Ad", "rating": 5, "body": "..." }`}]</code> ya da satır biçimi:
          ilk satır <code>Ad | 5</code>, sonraki satır(lar) yorum metni, yorumlar arası <code>---</code>.
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={8}
          placeholder={`Sophie M. | 5\nHarika bir deneyimdi, kesinlikle tavsiye ederim.\n---\nJames R. | 4\nÇok keyifliydi, rehberler profesyoneldi.`}
          className="w-full rounded-xl border border-teal/15 p-3 font-mono text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => void handleBulkAdd()}
            className="rounded-full bg-orange px-5 py-2 text-sm font-semibold text-white hover:bg-orange-soft"
          >
            Yorumları Ekle
          </button>
          {msg && <span className="text-sm text-teal/70">{msg}</span>}
        </div>
      </div>

      {/* Listeler */}
      {loading ? (
        <p className="py-8 text-center text-teal/50">Yükleniyor...</p>
      ) : (
        <div className="space-y-8">
          <ReviewList
            title={`Yayında (${published.length})`}
            rows={published}
            busyId={busyId}
            onArchive={(id) => void handleStatus(id, "archived")}
            onPublish={(id) => void handleStatus(id, "published")}
            onDelete={(id) => void handleDelete(id)}
          />
          <ReviewList
            title={`Arşiv (${archived.length})`}
            rows={archived}
            busyId={busyId}
            onArchive={(id) => void handleStatus(id, "archived")}
            onPublish={(id) => void handleStatus(id, "published")}
            onDelete={(id) => void handleDelete(id)}
          />
        </div>
      )}
    </section>
  );
}

interface ReviewListProps {
  title: string;
  rows: ReviewRow[];
  busyId: string | null;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function ReviewList({ title, rows, busyId, onPublish, onArchive, onDelete }: ReviewListProps) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-teal-deep">{title}</h3>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-teal/15 py-6 text-center text-sm text-teal/40">
          Kayıt yok.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col rounded-2xl border border-teal/10 bg-white p-4 shadow-sm"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-teal-deep">{r.author}</span>
                <span className="text-xs font-bold text-orange">{r.rating}★</span>
              </div>
              <p className="flex-1 text-sm text-teal/70 line-clamp-4">{r.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "archived" ? (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onPublish(r.id)}
                    className="rounded-full border border-teal/20 px-3 py-1 text-xs font-semibold text-teal hover:bg-foam disabled:opacity-40"
                  >
                    Yayınla
                  </button>
                ) : (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onArchive(r.id)}
                    className="rounded-full border border-teal/20 px-3 py-1 text-xs font-semibold text-teal hover:bg-foam disabled:opacity-40"
                  >
                    Arşivle
                  </button>
                )}
                <button
                  disabled={busyId === r.id}
                  onClick={() => onDelete(r.id)}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

Sonra `AdminPage.tsx` içinde import edip, oturum açıkken render edilen JSX'in sonuna (rezervasyon
grid'inin kapanışından sonra, `</div>` `container`'dan ÖNCE) yerleştir:

```tsx
import { ReviewsAdmin } from "@/pages/admin/ReviewsAdmin";
// ...
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reservations.map((r) => ( /* ...mevcut... */ ))}
        </div>

        <ReviewsAdmin />   {/* ← EKLE: rezervasyon grid'inin hemen altına */}
      </div>            {/* container kapanışı */}
```

---

## 7) i18n anahtarları — 3 dilde ekle

`src/i18n/locales/{tr,en,fr}/common.json` içine yeni bir `reviewsMarquee` bloğu ekle.
(Mevcut `reviews` bloğunu BOZMA; bu AYRI bir anahtar grubu.)

**tr:**
```json
"reviewsMarquee": {
  "eyebrow": "GÖRÜŞLER",
  "title": "Misafirlerimiz ne diyor?",
  "subtitle": "Google üzerinde bizi değerlendiren gerçek katılımcıların yorumları.",
  "cta": "Bizi Google'da değerlendirin"
}
```

**en:**
```json
"reviewsMarquee": {
  "eyebrow": "TESTIMONIALS",
  "title": "What our guests say",
  "subtitle": "Real reviews from guests who rated us on Google.",
  "cta": "Rate us on Google"
}
```

**fr:**
```json
"reviewsMarquee": {
  "eyebrow": "TÉMOIGNAGES",
  "title": "Ce que disent nos clients",
  "subtitle": "Avis authentiques de clients qui nous ont évalués sur Google.",
  "cta": "Évaluez-nous sur Google"
}
```

> JSON'a eklerken bir önceki bloğun sonuna virgül koymayı unutma (geçerli JSON kalsın).

---

## 8) Kullanıcıdan istenecekler (bu talimatı uygulayan session, sahibine sorsun)

1. **Google Haritalar işletme linki** → `ReviewsMarquee.tsx` içindeki `GOOGLE_REVIEW_URL` placeholder'ını değiştir.
2. **Yorum metinleri (bulk)** → admin panelindeki "Toplu Ekle" kutusuna yapıştırılacak. Format:
   - Basit: her yorum `Ad | Puan` satırı + altına metin, yorumlar arası `---`.
   - Veya JSON: `[{ "author": "...", "rating": 5, "body": "..." }]`

---

## 9) Doğrulama (uygulama sonrası)

```bash
npm run lint        # ESLint temiz mi
npm run build       # tsc -b && vite build hatasız mı
npm run test        # mevcut testler kırılmadı mı
npm run dev         # /tr anasayfada marquee akıyor mu; /admin'de yönetim çalışıyor mu
```

Manuel kontrol listesi:
- [ ] `/admin` → giriş → "Yorumlar (Google)" bölümü görünüyor.
- [ ] Toplu ekle: örnek 2-3 yorum yapıştır → "Yorumları Ekle" → listede beliriyor.
- [ ] Arşivle → yorum "Arşiv" listesine geçiyor ve anasayfa marquee'sinden kayboluyor.
- [ ] Yayınla → geri yayına alınıyor, marquee'de tekrar görünüyor.
- [ ] Sil → onay sonrası kalıcı siliniyor.
- [ ] Anasayfa `/tr`, `/en`, `/fr` → marquee sağdan sola akıyor, hover'da duruyor, başlık çevrilmiş.
- [ ] Hiç yayında yorum yokken marquee bölümü gizli (null döner).

---

## Özet — oluşturulacak/değişecek dosyalar

| Dosya | İşlem |
|------|------|
| `scripts/setup-supabase.sh` | `reviews` tablosu + RLS adımı ekle |
| `src/hooks/useReviews.ts` | YENİ — veri katmanı |
| `src/lib/parseReviews.ts` | YENİ — bulk parse |
| `src/components/home/ReviewsMarquee.tsx` | YENİ — marquee |
| `src/pages/admin/ReviewsAdmin.tsx` | YENİ — admin yönetim bölümü |
| `tailwind.config.ts` | `marquee` keyframe + animation ekle |
| `src/pages/Home.tsx` | `<ReviewsMarquee />` ekle |
| `src/pages/admin/AdminPage.tsx` | `<ReviewsAdmin />` ekle |
| `src/i18n/locales/{tr,en,fr}/common.json` | `reviewsMarquee` bloğu ekle |
