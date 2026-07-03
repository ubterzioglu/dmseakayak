import { Link } from "react-router-dom";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TourGrid } from "@/components/tours/TourGrid";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function TourHighlights() {
  const { t, localePath } = useLang();
  const { dayTours, multiDayTours } = useToursData();

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Deneyimler"
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        <TourGrid tours={dayTours} />
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          eyebrow="Ekspedisyonlar"
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        <TourGrid tours={multiDayTours} />
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
