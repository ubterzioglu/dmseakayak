import { useState } from "react";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/content/faqs";

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ question, answer, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-[0_4px_16px_rgba(1,68,57,0.06)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-teal-deep transition-colors hover:bg-foam"
        aria-expanded={isOpen}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-teal transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          id={`faq-panel-${index}`}
          role="region"
          aria-labelledby={`faq-btn-${index}`}
          className="px-6 pb-5 text-sm leading-relaxed text-teal/70"
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const { t, pick } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    dateModified: __BUILD_DATE__,
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: pick(item.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: pick(item.a),
      },
    })),
  };

  return (
    <>
      <Seo title={t("faq.title")} description={t("faq.subtitle")} jsonLd={jsonLd} />

      <Section>
        <SectionHeading
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
        />

        <div className="mt-2 max-w-3xl space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              index={i}
              question={pick(item.q)}
              answer={pick(item.a)}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
