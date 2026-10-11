import { Seo } from "@/components/seo/Seo";
import { Hero } from "@/components/home/Hero";
import { TourHighlights } from "@/components/home/TourHighlights";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ReviewsMarquee } from "@/components/home/ReviewsMarquee";
import { TailorMadeBanner } from "@/components/home/TailorMadeBanner";
import { useLang } from "@/hooks/useLang";
import { LOCALES, SITE } from "@/lib/site";

export default function Home() {
  const { t } = useLang();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "@id": `${SITE.domain}/#location`,
        name: SITE.name,
        url: SITE.domain,
        image: SITE.ogImage,
        telephone: SITE.phone,
        email: SITE.email,
        priceRange: "€€",
        sport: "Sea Kayaking",
        dateModified: __BUILD_DATE__,
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
        parentOrganization: { "@id": `${SITE.domain}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.domain}/#organization`,
        name: SITE.name,
        url: SITE.domain,
        logo: SITE.ogImage,
        image: SITE.ogImage,
        email: SITE.email,
        telephone: SITE.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Uzunçarşı Cad. No:15",
          addressLocality: "Kaş",
          addressRegion: "Antalya",
          postalCode: "07580",
          addressCountry: "TR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: SITE.phone,
          email: SITE.email,
          availableLanguage: ["tr", "en", "fr", "ru", "de"],
        },
        sameAs: [SITE.instagram, SITE.facebook],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.domain}/#website`,
        name: SITE.name,
        url: SITE.domain,
        inLanguage: LOCALES as readonly string[],
        publisher: { "@id": `${SITE.domain}/#organization` },
      },
    ],
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
      <TailorMadeBanner />
      <WhyChooseUs />
      <ReviewsMarquee />
    </>
  );
}
