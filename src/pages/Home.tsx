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
    priceRange: "€€",
    sport: "Sea Kayaking",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Uzunçarşı Cad. No:15",
      addressLocality: "Kaş",
      addressRegion: "Antalya",
      postalCode: "07580",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 36.201899, longitude: 29.638667 },
    hasMap: "https://www.google.com/maps/search/?api=1&query=36.201899,29.638667",
    areaServed: ["Kekova", "Kaş", "Kalkan", "Antalya"],
    sameAs: [SITE.instagram, SITE.facebook],
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
