import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { TourGrid } from "@/components/tours/TourGrid";
import { CurrencyConverter } from "@/components/tours/CurrencyConverter";
import { TOURS, MULTI_DAY_TOURS } from "@/content/tours";
import { useLang } from "@/hooks/useLang";

export default function Tours() {
  const { t } = useLang();

  return (
    <>
      <Seo title={t("tours.title")} description={t("tours.subtitle")} />
      <Section>
        <SectionHeading
          title={t("tours.title")}
          subtitle={t("tours.subtitle")}
        />
        <CurrencyConverter />
        <TourGrid tours={TOURS} />
      </Section>
      <Section className="bg-foam/40">
        <SectionHeading
          title={t("tours.multiDayTitle")}
          subtitle={t("tours.multiDaySubtitle")}
        />
        <TourGrid tours={MULTI_DAY_TOURS} />
      </Section>
    </>
  );
}
