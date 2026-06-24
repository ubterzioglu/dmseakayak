import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { Package, Layers, Waves } from "lucide-react";

/**
 * TRAK Experience page — placeholder content (folding/portable kayak experience).
 * Real copy, specs and imagery to be supplied later; structure mirrors About.tsx.
 */
export default function TrakExperience() {
  const { t, localePath } = useLang();

  const features = [
    { icon: Package, title: t("trak.feature1Title"), body: t("trak.feature1Body") },
    { icon: Layers, title: t("trak.feature2Title"), body: t("trak.feature2Body") },
    { icon: Waves, title: t("trak.feature3Title"), body: t("trak.feature3Body") },
  ];

  return (
    <>
      <Seo title={t("trak.title")} description={t("trak.subtitle")} />

      {/* Hero band */}
      <div className="hero-gradient py-20 text-white md:py-28">
        <div className="container">
          <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">
            {t("trak.eyebrow")}
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            {t("trak.title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">{t("trak.subtitle")}</p>
        </div>
      </div>

      {/* Intro */}
      <Section>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title={t("trak.introTitle")} />
            <p className="text-base leading-relaxed text-teal/80">{t("trak.introBody")}</p>
            <div className="mt-6">
              <Button asChild size="lg" variant="primary">
                <Link to={localePath(SEG.contact)}>{t("trak.cta")}</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/images/tours/trak/trakexperience.jpg"
              alt="TRAK Experience"
              className="h-72 w-full object-cover md:h-96"
            />
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-foam">
        <SectionHeading eyebrow={t("trak.eyebrow")} title={t("trak.featuresTitle")} />
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange/10">
                  <Icon className="h-6 w-6 text-orange" />
                </div>
                <h3 className="text-lg font-bold text-teal-deep">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal/70">{f.body}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-teal/50">{t("trak.placeholderNote")}</p>
      </Section>
    </>
  );
}
