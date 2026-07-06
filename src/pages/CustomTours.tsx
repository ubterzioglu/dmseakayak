import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { Map, User, CalendarDays, Users } from "lucide-react";

export default function CustomTours() {
  const { t, localePath } = useLang();
  const waLink = buildWhatsappLink();

  const features = [
    { icon: Map, titleKey: "custom.feature1Title", bodyKey: "custom.feature1Body" },
    { icon: User, titleKey: "custom.feature2Title", bodyKey: "custom.feature2Body" },
    { icon: CalendarDays, titleKey: "custom.feature3Title", bodyKey: "custom.feature3Body" },
    { icon: Users, titleKey: "custom.feature4Title", bodyKey: "custom.feature4Body" },
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Custom Sea Kayaking Tour",
    name: t("custom.title"),
    description: t("custom.subtitle"),
    provider: { "@type": "Organization", name: SITE.name, url: SITE.domain },
    areaServed: ["Kekova", "Kaş", "Kalkan", "Antalya"],
  };

  return (
    <>
      <Seo title={t("custom.title")} description={t("custom.subtitle")} jsonLd={jsonLd} />

      {/* Hero band */}
      <div className="hero-gradient py-20 text-white md:py-28">
        <div className="container">
          <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">
            {t("custom.eyebrow")}
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            {t("custom.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">{t("custom.heroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="primary" size="lg">
              <Link to={localePath(SEG.contact)}>{t("custom.ctaContact")}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                {t("custom.ctaWhatsapp")}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <Section>
        <SectionHeading title={t("custom.whyTitle")} subtitle={t("custom.subtitle")} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, titleKey, bodyKey }) => (
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

      {/* CTA band */}
      <Section className="bg-foam">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-teal-deep">{t("custom.title")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-teal/70">{t("custom.subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild variant="teal" size="lg">
              <Link to={localePath(SEG.contact)}>{t("custom.ctaContact")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                {t("custom.ctaWhatsapp")}
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
