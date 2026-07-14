import { Section, SectionHeading } from "@/components/ui/section";
import { TourGrid } from "@/components/tours/TourGrid";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";

export function TourHighlights() {
  const { t } = useLang();
  const { dayTours, multiDayTours, loading, error } = useToursData();

  if (error) {
    return (
      <Section>
        <p className="text-center text-sm text-red-600">{t("tours.loadError")}</p>
      </Section>
    );
  }

  return (
    <>
      <Section className="pt-6 md:pt-8">
        <SectionHeading
          eyebrow={t("tours.eyebrow")}
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">{t("common.loading")}</p>
        ) : (
          <TourGrid tours={dayTours} />
        )}
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          eyebrow={t("tours.multiDayEyebrow")}
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
          subtitleClassName="md:whitespace-nowrap"
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">{t("common.loading")}</p>
        ) : (
          <TourGrid tours={multiDayTours} />
        )}
      </Section>
    </>
  );
}
