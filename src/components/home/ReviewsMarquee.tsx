import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { fetchPublishedReviews, type ReviewRow } from "@/hooks/useAdminContent";

// TODO: Kullanıcının Google Haritalar işletme linkini buraya koy (gerçek link bekleniyor).
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
      <blockquote className="line-clamp-6 flex-1 text-sm leading-relaxed text-teal/80">
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

  // Yorum yoksa bölümü hiç gösterme.
  if (!loading && reviews.length === 0) return null;

  // Kesintisiz akış için listeyi ikiye katla.
  const loop = [...reviews, ...reviews];

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
