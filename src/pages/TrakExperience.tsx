import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";
import {
  CheckCircle2,
  Package,
  Gauge,
  Waves,
  Landmark,
  UtensilsCrossed,
  Luggage,
  HeartHandshake,
  Sparkles,
  Users,
} from "lucide-react";

export default function TrakExperience() {
  const { t, localePath } = useLang();

  const highlights = [
    { icon: Package, title: t("trak.different1Title"), body: t("trak.different1Body") },
    { icon: Gauge, title: t("trak.different2Title"), body: t("trak.different2Body") },
    { icon: Waves, title: t("trak.different3Title"), body: t("trak.different3Body") },
    { icon: Landmark, title: t("trak.different4Title"), body: t("trak.different4Body") },
    { icon: UtensilsCrossed, title: t("trak.different5Title"), body: t("trak.different5Body") },
    { icon: Luggage, title: t("trak.different6Title"), body: t("trak.different6Body") },
    { icon: HeartHandshake, title: t("trak.different7Title"), body: t("trak.different7Body") },
  ];

  const expectSteps = [
    { title: t("trak.expect1Title"), body: t("trak.expect1Body") },
    { title: t("trak.expect2Title"), body: t("trak.expect2Body") },
    { title: t("trak.expect3Title"), body: t("trak.expect3Body") },
    { title: t("trak.expect4Title"), body: t("trak.expect4Body") },
    { title: t("trak.expect5Title"), body: t("trak.expect5Body") },
  ];

  const includes = [
    t("trak.include1"),
    t("trak.include2"),
    t("trak.include3"),
    t("trak.include4"),
    t("trak.include5"),
    t("trak.include6"),
    t("trak.include7"),
  ];

  const gallery = [
    { src: "/images/tours/trak/trak-assembly.webp", alt: "TRAK kayak hands-on assembly" },
    { src: "/images/tours/trak/trak-paddle.webp", alt: "Paddling the TRAK kayak on the Mediterranean" },
    { src: "/images/tours/trak/trak-coastline.webp", alt: "Lycian coastline near Kekova" },
    { src: "/images/tours/trak/trak-lunch.webp", alt: "Lunch in Simena castle village" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE.name, item: `${SITE.domain}${localePath()}` },
      { "@type": "ListItem", position: 2, name: t("trak.title") },
    ],
  };

  return (
    <>
      <Seo title={t("trak.title")} description={t("trak.subtitle")} jsonLd={jsonLd} />

      {/* Hero band */}
      <div className="hero-gradient py-20 text-white md:py-28">
        <div className="container">
          <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">
            {t("trak.eyebrow")}
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            {t("trak.title")}
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-wide text-white/60">
            {t("trak.poweredBy")}
          </p>
          <p className="mt-4 max-w-xl text-lg text-white/80">{t("trak.subtitle")}</p>
          <p className="mt-4 inline-block rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white/90">
            {t("trak.notATour")}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="primary">
              <Link to={localePath(SEG.contact)}>{t("trak.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Intro */}
      <Section>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title={t("trak.introTitle")} />
            <div className="space-y-3.5">
              {t("trak.introBody")
                .split("\n")
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-teal/80">
                    {para}
                  </p>
                ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/images/tours/trak/trak-paddle.webp"
              alt={t("trak.title")}
              className="h-72 w-full object-cover md:h-96"
            />
          </div>
        </div>
      </Section>

      {/* What Makes This Different */}
      <Section className="bg-foam">
        <SectionHeading eyebrow={t("trak.eyebrow")} title={t("trak.differentTitle")} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-teal/10 bg-white p-6 shadow-[0_10px_30px_rgba(1,68,57,0.08)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-orange/10">
                  <Icon className="h-5 w-5 text-orange" />
                </div>
                <h3 className="text-base font-bold text-teal-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal/70">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Designed for All Levels */}
      <Section>
        <SectionHeading eyebrow={t("trak.eyebrow")} title={t("trak.levelsTitle")} subtitle={t("trak.levelsSubtitle")} />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
              <Users className="h-6 w-6 text-teal" />
            </div>
            <h3 className="text-lg font-bold text-teal-deep">{t("trak.beginnersTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t("trak.beginnersBody")}</p>
          </div>
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange/10">
              <Sparkles className="h-6 w-6 text-orange" />
            </div>
            <h3 className="text-lg font-bold text-teal-deep">{t("trak.advancedTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal/70">{t("trak.advancedBody")}</p>
          </div>
        </div>
      </Section>

      {/* What to Expect */}
      <Section className="bg-foam">
        <SectionHeading eyebrow={t("trak.eyebrow")} title={t("trak.expectTitle")} />
        <ol className="relative ml-4 border-l-2 border-teal/20">
          {expectSteps.map((step, i) => (
            <li key={i} className="mb-8 ml-6 last:mb-0">
              <span className="absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm font-bold text-white ring-4 ring-foam">
                {i + 1}
              </span>
              <div className="rounded-xl border border-teal/10 bg-white p-4 shadow-sm">
                <h4 className="font-bold text-teal-deep">{step.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Gallery */}
      <Section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105 md:h-56"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Includes */}
      <Section className="bg-foam">
        <SectionHeading title={t("trak.includesTitle")} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {includes.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ink/80">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Book CTA */}
      <Section>
        <div className="rounded-2xl bg-teal-deep px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold md:text-4xl">{t("trak.bookTitle")}</h2>
          <p className="mt-3 text-white/70">{t("trak.bookSubtitle")}</p>
          <div className="mt-8">
            <Button asChild size="lg" variant="primary">
              <Link to={localePath(SEG.contact)}>{t("trak.cta")}</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
