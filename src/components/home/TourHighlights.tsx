import { Link } from "react-router-dom";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TourGrid } from "@/components/tours/TourGrid";
import { TOURS, MULTI_DAY_TOURS } from "@/content/tours";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function TourHighlights() {
  const { t, localePath } = useLang();

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Deneyimler"
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        <TourGrid tours={TOURS} />
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          eyebrow="Expedisyonlar"
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        <TourGrid tours={MULTI_DAY_TOURS} />
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
