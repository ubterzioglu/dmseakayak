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
        <p className="text-center text-sm text-red-600">
          Turlar yüklenemedi, lütfen daha sonra tekrar deneyin.
        </p>
      </Section>
    );
  }

  return (
    <>
      <Section className="pt-6 md:pt-8">
        <SectionHeading
          eyebrow="Deneyimler"
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
        ) : (
          <TourGrid tours={dayTours} />
        )}
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          eyebrow="Ekspedisyonlar"
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        {loading ? (
          <p className="text-center text-sm text-teal/60">Yükleniyor...</p>
        ) : (
          <TourGrid tours={multiDayTours} />
        )}
      </Section>
    </>
  );
}
