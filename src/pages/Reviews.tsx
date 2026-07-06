import { useEffect, useState } from "react";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { SITE } from "@/lib/site";
import { Star } from "lucide-react";
import {
  fetchPublishedReviewsLocalized,
  type ReviewRow,
  type ReviewLang,
} from "@/hooks/useAdminContent";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "fill-orange text-orange" : "fill-transparent text-teal/20"}`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t, locale } = useLang();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPublishedReviewsLocalized(locale as ReviewLang)
      .then((rows) => {
        if (alive) setReviews(rows);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [locale]);

  const jsonLd =
    reviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          name: SITE.name,
          url: SITE.domain,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
          },
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
            ...(r.review_date ? { datePublished: r.review_date } : {}),
          })),
        }
      : undefined;

  return (
    <>
      <Seo title={t("reviews.title")} description={t("reviews.subtitle")} jsonLd={jsonLd} />

      <Section>
        <SectionHeading
          eyebrow={t("reviews.eyebrow")}
          title={t("reviews.title")}
          subtitle={t("reviews.subtitle")}
        />

        {/* Review cards */}
        {!loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col rounded-2xl border border-teal/10 bg-white p-6 shadow-[0_10px_30px_rgba(1,68,57,0.08)]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  {review.source_label && (
                    <span className="rounded-full bg-foam px-2 py-0.5 text-[0.7rem] font-bold text-teal">
                      {review.source_label}
                    </span>
                  )}
                </div>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-teal/80">
                  &ldquo;{review.body}&rdquo;
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-teal/5 pt-4">
                  <div className="font-semibold text-teal-deep">
                    {review.author_country && <span className="mr-1.5">{review.author_country}</span>}
                    {review.author}
                  </div>
                  {review.review_date && (
                    <div className="text-xs text-teal/40">
                      {new Date(review.review_date).toLocaleDateString(locale, {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="py-12 text-center text-teal/50">{t("common.loading")}</p>}

        {!loading && reviews.length === 0 && (
          <p className="py-12 text-center text-teal/50">{t("reviews.empty")}</p>
        )}
      </Section>
    </>
  );
}
