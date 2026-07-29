import { Anchor, BadgeCheck, ShieldCheck, Users, Sparkles, Waves } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

/** Fixed company-wide selling points, translated in the i18n locale files.
 *  Deliberately not tour-driven: this section describes the operator, not a tour. */
const REASONS = [
  { icon: Anchor, titleKey: "whyChoose.item1Title", bodyKey: "whyChoose.item1Body" },
  { icon: BadgeCheck, titleKey: "whyChoose.item2Title", bodyKey: "whyChoose.item2Body" },
  { icon: ShieldCheck, titleKey: "whyChoose.item3Title", bodyKey: "whyChoose.item3Body" },
  { icon: Users, titleKey: "whyChoose.item4Title", bodyKey: "whyChoose.item4Body" },
  { icon: Sparkles, titleKey: "whyChoose.item5Title", bodyKey: "whyChoose.item5Body" },
  { icon: Waves, titleKey: "whyChoose.item6Title", bodyKey: "whyChoose.item6Body" },
] as const;

interface WhyChooseUsProps {
  /** Section background/spacing override, e.g. "bg-foam" on the About page. */
  className?: string;
}

export function WhyChooseUs({ className }: WhyChooseUsProps) {
  const { t } = useLang();

  return (
    <Section className={cn("bg-sand", className)}>
      <SectionHeading
        title={t("whyChoose.title")}
        subtitle={t("whyChoose.subtitle")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="rounded-2xl border border-teal/10 bg-white p-6 shadow-[0_10px_30px_rgba(1,68,57,0.08)] transition-all hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
              <Icon className="h-6 w-6 text-teal" />
            </div>
            <h3 className="font-bold text-teal-deep">{t(titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
