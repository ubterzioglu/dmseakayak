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

/** Google's "G" mark. Repeating the word "Google" on every card made it the
 *  page's densest keyword (flagged as keyword stuffing by GEO audits). */
function GoogleMark({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" role="img" aria-label={label}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function ReviewCard({ r }: { r: ReviewRow }) {
  return (
    <figure className="mx-3 flex w-[300px] flex-shrink-0 flex-col rounded-2xl border border-teal/10 bg-white p-6 shadow-[0_10px_30px_rgba(1,68,57,0.08)] sm:w-[340px]">
      <div className="mb-2 flex items-center justify-between">
        <Stars rating={r.rating} />
        {r.source_label &&
          (r.source_label.trim().toLowerCase() === "google" ? (
            <GoogleMark label={r.source_label} />
          ) : (
            <span className="rounded-full bg-foam px-2 py-0.5 text-[0.7rem] font-bold text-teal">
              {r.source_label}
            </span>
          ))}
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

          <div
            className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${Math.max(reviews.length * 8, 40)}s` }}
          >
            {reviews.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
            {/* Kesintisiz akış için ikinci kopya — yalnızca görsel; ekran okuyuculardan gizli. */}
            <div className="flex" aria-hidden="true">
              {reviews.map((r) => (
                <ReviewCard key={`${r.id}-dup`} r={r} />
              ))}
            </div>
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
