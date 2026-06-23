import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { TOURS } from "@/content/tours";
import { ShieldCheck, Users, Award } from "lucide-react";

export default function About() {
  const { t, pick } = useLang();

  // Day tours always define whyChoose; the widened Tour type makes it optional.
  const whyChoose = pick(TOURS[0].whyChoose!);

  return (
    <>
      <Seo title={t("about.title")} description={t("about.subtitle")} />

      {/* Hero band */}
      <div className="hero-gradient py-20 text-white md:py-28">
        <div className="container">
          <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">
            {t("about.eyebrow")}
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">{t("about.subtitle")}</p>
        </div>
      </div>

      {/* Story */}
      <Section>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title={t("about.storyTitle")} />
            <p className="text-base leading-relaxed text-teal/80">{t("about.storyBody")}</p>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/seakayakog.jpg"
              alt="Dragoman SeaKayak — Kekova"
              className="h-72 w-full object-cover md:h-96"
            />
          </div>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section className="bg-foam">
        <SectionHeading
          eyebrow={t("whyChoose.title")}
          title={t("whyChoose.title")}
          subtitle={t("whyChoose.subtitle")}
        />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {whyChoose.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                ✓
              </span>
              <span className="text-teal/80">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Guides & Safety */}
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Guides */}
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
              <Award className="h-6 w-6 text-teal" />
            </div>
            <h3 className="text-lg font-bold text-teal-deep">{t("about.guidesTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t("about.guidesBody")}</p>
          </div>

          {/* Safety */}
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange/10">
              <ShieldCheck className="h-6 w-6 text-orange" />
            </div>
            <h3 className="text-lg font-bold text-teal-deep">{t("about.safetyTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t("about.safetyBody")}</p>
          </div>

          {/* Small groups */}
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
              <Users className="h-6 w-6 text-teal" />
            </div>
            <h3 className="text-lg font-bold text-teal-deep">{t("whyChoose.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t("whyChoose.subtitle")}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
