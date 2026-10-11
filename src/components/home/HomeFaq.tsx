import { ChevronDown } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Link } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { FAQS, HOME_FAQ_COUNT } from "@/content/faqs";
import { SEG } from "@/lib/routes";
import type { Locale } from "@/lib/site";

const COPY: Record<Locale, { title: string; more: string }> = {
  tr: { title: "Sık sorulan sorular", more: "Tüm soruları gör" },
  en: { title: "Frequently asked questions", more: "See all questions" },
  fr: { title: "Questions fréquentes", more: "Voir toutes les questions" },
  ru: { title: "Частые вопросы", more: "Все вопросы" },
  de: { title: "Häufige Fragen", more: "Alle Fragen ansehen" },
};

/** Short FAQ teaser. Its questions are the same ones emitted as FAQPage JSON-LD
 *  on Home, so the structured data always matches visible content. */
export function HomeFaq() {
  const { locale, pick, localePath } = useLang();
  const copy = COPY[locale];

  return (
    <Section className="bg-sand">
      <SectionHeading title={copy.title} />
      <div className="max-w-3xl space-y-3">
        {FAQS.slice(0, HOME_FAQ_COUNT).map((item, i) => (
          <details
            key={i}
            className="group overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-[0_4px_16px_rgba(1,68,57,0.06)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-teal-deep hover:bg-foam">
              <h3 className="text-base font-semibold">{pick(item.q)}</h3>
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-teal transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-6 pb-5 text-sm leading-relaxed text-teal/70">{pick(item.a)}</p>
          </details>
        ))}
      </div>
      <Link
        to={localePath(SEG.faq)}
        className="mt-6 inline-block font-semibold text-teal underline-offset-4 hover:underline"
      >
        {copy.more}
      </Link>
    </Section>
  );
}
