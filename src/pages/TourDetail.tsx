import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Clock, Waves, TrendingUp, Euro, Calendar, XCircle } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Itinerary } from "@/components/tours/Itinerary";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { getTour } from "@/content/tours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { buildWhatsappLink } from "@/lib/whatsapp";

export default function TourDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, pick, localePath } = useLang();

  const tour = getTour(slug ?? "");

  if (!tour) {
    return (
      <Section>
        <p className="text-lg text-ink/70">Tour not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={localePath(SEG.tours)}>{t("nav.tours")}</Link>
        </Button>
      </Section>
    );
  }

  const md = tour.multiDay;
  const title = pick(tour.title);
  const tagline = pick(tour.tagline);
  const description = tour.description ? pick(tour.description) : null;
  const highlights = pick(tour.highlights);
  const included = tour.included ? pick(tour.included) : null;
  const notIncluded = md?.notIncluded ? pick(md.notIncluded) : null;
  const dayByDay = md?.dayByDay ? pick(md.dayByDay) : null;
  const itinerary = tour.itinerary ? pick(tour.itinerary) : null;
  const contactPath = `${localePath(SEG.contact)}?tour=${tour.slug}`;
  const whatsappHref = buildWhatsappLink({ tourTitle: title });

  const price = md ? md.pricePerPersonEur : tour.priceEur;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: title,
    description: tagline,
    ...(price != null
      ? { offers: { "@type": "Offer", price, priceCurrency: "EUR" } }
      : {}),
  };

  return (
    <>
      <Seo title={title} description={tagline} jsonLd={jsonLd} />

      {/* Hero band */}
      <div className="hero-gradient relative overflow-hidden pb-12 pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${tour.heroImage})` }}
          aria-hidden="true"
        />
        <div className="relative z-10 container mx-auto max-w-4xl px-4">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/90">
            {t(`level.${tour.level}`)}
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-white/80 md:text-lg">{tagline}</p>

          {/* Key meta */}
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/90">
            {md ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {md.durationDays} {t("common.days")} / {md.nights} {t("common.nights")}
                </span>
                {md.groupSize && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {pick(md.groupSize)}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 font-bold text-orange-soft">
                  <Euro className="h-4 w-4" />
                  {md.status === "special"
                    ? t("common.privateSession")
                    : price != null
                      ? `${t("common.from")} €${price} / ${t("common.perPerson")}`
                      : t("common.onRequest")}
                </span>
              </>
            ) : (
              <>
                {tour.distanceKm != null && (
                  <span className="inline-flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    {tour.distanceKm} {t("common.km")}
                  </span>
                )}
                {tour.hikingKm && (
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {tour.hikingKm} {t("common.hikingKm")}
                  </span>
                )}
                {tour.departure && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("common.departure")}: {tour.departure}
                  </span>
                )}
                {tour.arrival && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("common.arrival")}: {tour.arrival}
                  </span>
                )}
                {tour.priceEur != null && (
                  <span className="inline-flex items-center gap-2 font-bold text-orange-soft">
                    <Euro className="h-4 w-4" />
                    {t("common.from")} €{tour.priceEur}
                    {tour.priceFromKalkanEur && (
                      <span className="ml-1 font-normal text-white/70">
                        (Kalkan: €{tour.priceFromKalkanEur})
                      </span>
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description (multi-day intro) */}
      {description && (
        <Section>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-ink/80">{description}</p>
        </Section>
      )}

      {/* Highlights */}
      <Section className={description ? "bg-foam/40" : undefined}>
        <SectionHeading title={t("common.highlights")} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Route (day tours) */}
      {tour.routeStops && tour.routeStops.length > 0 && (
        <Section className="bg-foam/40">
          <SectionHeading title={t("common.route")} />
          <p className="text-sm text-ink/75">{tour.routeStops.join(" → ")}</p>
        </Section>
      )}

      {/* Itinerary */}
      <Section>
        <SectionHeading title={t("common.itinerary")} />
        {md ? (
          dayByDay ? (
            <ol className="space-y-5">
              {dayByDay.map((d) => (
                <li key={d.day} className="rounded-2xl border border-teal/10 bg-white/60 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-teal-deep">
                      <span className="text-orange">{t("common.day")} {d.day}</span> — {d.title}
                    </h3>
                    {d.distance && (
                      <span className="inline-flex items-center gap-1 text-sm text-teal">
                        <Waves className="h-4 w-4" /> {d.distance}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/75">{d.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm italic text-ink/60">{t("common.comingSoonItinerary")}</p>
          )
        ) : itinerary ? (
          <Itinerary steps={itinerary} />
        ) : null}
      </Section>

      {/* Departure dates (multi-day) */}
      {md?.dates && md.dates.length > 0 && (
        <Section className="bg-foam/40">
          <SectionHeading title={t("common.dates")} />
          <ul className="flex flex-wrap gap-2">
            {md.dates.map((d, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal/20 bg-white/70 px-3 py-1 text-sm text-teal-deep"
              >
                <Calendar className="h-3.5 w-3.5 text-orange" /> {d}
              </li>
            ))}
          </ul>
          {md.singleSupplementEur && (
            <p className="mt-3 text-xs text-ink/60">
              {t("common.singleSupplement")}: €{md.singleSupplementEur}
            </p>
          )}
        </Section>
      )}

      {/* What's included */}
      {included && (
        <Section className={md?.dates ? undefined : "bg-foam/40"}>
          <SectionHeading title={t("common.included")} />
          <ul className="space-y-2">
            {included.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink/80">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Not included (multi-day) */}
      {notIncluded && (
        <Section className="bg-foam/40">
          <SectionHeading title={t("common.notIncluded")} />
          <ul className="space-y-2">
            {notIncluded.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink/70">
                <XCircle className="h-4 w-4 shrink-0 text-orange" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CTA */}
      <Section>
        <div className="rounded-2xl border border-teal/10 bg-teal p-8 text-center shadow-lg">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            {t("common.bookNow")}
          </h2>
          <p className="mt-2 text-white/80">{tagline}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="primary">
              <Link to={contactPath}>{t("common.bookNow")}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("common.askQuestion")}
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
