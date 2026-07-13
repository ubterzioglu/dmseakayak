import { Link } from "react-router-dom";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TourGrid } from "@/components/tours/TourGrid";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function TourHighlights() {
  const { t, localePath } = useLang();
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
      <Section>
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
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
