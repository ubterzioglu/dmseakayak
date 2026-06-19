import { Seo } from "@/components/seo/Seo";
import { Hero } from "@/components/home/Hero";
import { TourHighlights } from "@/components/home/TourHighlights";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ReviewsMarquee } from "@/components/home/ReviewsMarquee";
import { useLang } from "@/hooks/useLang";
import { SITE } from "@/lib/site";

export default function Home() {
  const { t } = useLang();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: SITE.name,
    url: SITE.domain,
    image: SITE.ogImage,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Kaş",
      addressCountry: "TR",
    },
  };

  return (
    <>
      <Seo
        title={t("hero.title")}
        description={t("hero.subtitle")}
        jsonLd={jsonLd}
      />
      <Hero />
      <TourHighlights />
      <WhyChooseUs />
      <ReviewsMarquee />
    </>
  );
}
