import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { TourGrid } from "@/components/tours/TourGrid";
import { CurrencyConverter } from "@/components/tours/CurrencyConverter";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";

export default function Tours() {
  const { t, pick, localePath } = useLang();
  const { dayTours, multiDayTours } = useToursData();

  const allTours = [...dayTours, ...multiDayTours];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allTours.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.domain}${localePath(`${SEG.tours}/${tour.slug}`)}`,
      name: pick(tour.title),
    })),
  };

  return (
    <>
      <Seo title={t("tours.title")} description={t("tours.subtitle")} jsonLd={jsonLd} />
      <Section>
        <SectionHeading
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        <TourGrid tours={dayTours} />
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        <TourGrid tours={multiDayTours} />
      </Section>
      <Section>
        <CurrencyConverter />
      </Section>
    </>
  );
}
