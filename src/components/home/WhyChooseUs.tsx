import { CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { useToursData } from "@/hooks/useTours";
import { useLang } from "@/hooks/useLang";

export function WhyChooseUs() {
  const { t, pick } = useLang();
  const { dayTours, error } = useToursData();
  const benefits = pick(
    dayTours.find((tour) => tour.whyChoose)?.whyChoose ?? { tr: [], en: [], fr: [], ru: [] },
  );

  if (error || benefits.length === 0) return null;

  return (
    <Section className="bg-sand">
      <SectionHeading
        title={t("whyChoose.title")}
        subtitle={t("whyChoose.subtitle")}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-teal/10 bg-white p-5 shadow-sm"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            <span className="text-sm leading-relaxed text-ink/80">{benefit}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
