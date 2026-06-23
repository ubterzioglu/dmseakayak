import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Waves, TrendingUp, MapPin, Check, Star, Calendar } from "lucide-react";
import type { Tour } from "@/content/tours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function TourCard({ tour }: { tour: Tour }) {
  const { t, pick, localePath } = useLang();
  const [open, setOpen] = useState(false);
  const md = tour.multiDay;

  // TRAK links to its existing dedicated page; everything else to the generated detail page.
  const detailPath =
    md?.externalDetailPath === "trak"
      ? localePath(SEG.trak)
      : localePath(`${SEG.tours}/${tour.slug}`);
  const titleId = `tour-modal-title-${tour.slug}`;

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  const durationLabel = md ? `${md.durationDays} ${t("common.days")} / ${md.nights} ${t("common.nights")}` : null;

  // Meta row, shared by card and modal.
  const MetaRow = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-teal">
      {md ? (
        <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {durationLabel}</span>
      ) : (
        <>
          {tour.distanceKm != null && (
            <span className="inline-flex items-center gap-1"><Waves className="h-4 w-4" /> {tour.distanceKm} {t("common.km")}</span>
          )}
          {tour.departure && (
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {tour.departure}</span>
          )}
          {tour.hikingKm && (
            <span className="inline-flex items-center gap-1"><TrendingUp className="h-4 w-4" /> {tour.hikingKm} {t("common.hikingKm")}</span>
          )}
        </>
      )}
    </div>
  );

  // Price label, shared by card and modal.
  const PriceLabel = () => {
    if (md?.status === "special") {
      return <div className="text-lg font-extrabold text-orange">{t("common.privateSession")}</div>;
    }
    const price = md ? md.pricePerPersonEur : tour.priceEur;
    if (price == null) {
      return <div className="text-lg font-extrabold text-orange">{t("common.onRequest")}</div>;
    }
    return (
      <div className="text-lg font-extrabold text-orange">
        {t("common.from")} €{price}
        <span className="ml-1 text-xs font-medium text-ink/60">/ {t("common.perPerson")}</span>
      </div>
    );
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden p-0 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(1,68,57,0.14)]">
        {/* Clickable region — tap to open the detail popup */}
        <div
          role="button"
          tabIndex={0}
          onClick={openModal}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal();
            }
          }}
          className="cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        >
          <div className="hero-gradient relative aspect-[16/10] w-full">
            <img
              src={tour.heroImage}
              alt={pick(tour.title)}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-deep">
              {t(`level.${tour.level}`)}
            </span>
            {md?.status === "draft" && (
              <span className="absolute right-3 top-3 rounded-full bg-orange/90 px-3 py-1 text-xs font-bold text-white">
                {t("common.draft")}
              </span>
            )}
          </div>

          <div className="flex flex-col p-6">
            <h3 className="text-xl font-extrabold text-teal-deep">{pick(tour.title)}</h3>
            <p className="mt-1 text-sm text-ink/75">{pick(tour.tagline)}</p>

            <div className="mt-4">
              <MetaRow />
            </div>
          </div>
        </div>

        {/* Price + detail link — always visible, anchored to the card bottom */}
        <div className="mt-auto flex items-center justify-between border-t border-teal/10 px-6 py-4">
          <PriceLabel />
          <Button asChild size="sm" variant="outline">
            <Link to={detailPath} onClick={(e) => e.stopPropagation()}>{t("common.viewDetails")}</Link>
          </Button>
        </div>
      </Card>

      {/* Detail popup */}
      <Modal open={open} onClose={closeModal} labelledBy={titleId}>
        <div className="hero-gradient relative aspect-[21/9] w-full overflow-hidden rounded-t-3xl sm:aspect-[2/1]">
          <img
            src={tour.heroImage}
            alt={pick(tour.title)}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-teal-deep">
            {t(`level.${tour.level}`)}
          </span>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h3 id={titleId} className="text-xl font-extrabold text-teal-deep">{pick(tour.title)}</h3>
            <p className="mt-0.5 text-[13px] text-ink/75">{pick(tour.tagline)}</p>
          </div>

          <MetaRow />

          <div className="space-y-2.5 border-t border-teal/10 pt-3 text-[13px]">
            {tour.routeStops && tour.routeStops.length > 0 && (
              <div>
                <div className="mb-0.5 flex items-center gap-1.5 font-bold text-teal-deep">
                  <MapPin className="h-4 w-4 text-orange" /> {t("common.route")}
                </div>
                <p className="text-ink/75">{tour.routeStops.join(" · ")}</p>
              </div>
            )}

            <div>
              <div className="mb-0.5 flex items-center gap-1.5 font-bold text-teal-deep">
                <Star className="h-4 w-4 text-orange" /> {t("common.highlights")}
              </div>
              <ul className="space-y-0.5 text-ink/75">
                {pick(tour.highlights).map((h, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-orange">•</span> {h}</li>
                ))}
              </ul>
            </div>

            {tour.included && (
              <div>
                <div className="mb-0.5 flex items-center gap-1.5 font-bold text-teal-deep">
                  <Check className="h-4 w-4 text-orange" /> {t("common.included")}
                </div>
                <ul className="space-y-0.5 text-ink/75">
                  {pick(tour.included).map((it, i) => (
                    <li key={i} className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" /> {it}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-teal/10 pt-3">
            <PriceLabel />
            <Button asChild size="sm" variant="primary">
              <Link to={detailPath}>{t("common.viewDetails")}</Link>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
