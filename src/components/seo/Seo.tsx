import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE, LOCALES } from "@/lib/site";
import { useLang } from "@/hooks/useLang";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  /** JSON-LD structured data object(s). */
  jsonLd?: object | object[];
  /** When true, emits robots noindex (e.g. 404, admin) and skips canonical. */
  noindex?: boolean;
}

/** Per-route head manager: title, description, OG/Twitter, canonical, hreflang, JSON-LD. */
export function Seo({ title, description, image = SITE.ogImage, jsonLd, noindex }: SeoProps) {
  const { locale } = useLang();
  const location = useLocation();
  const path = location.pathname;
  const canonical = `${SITE.domain}${path}`;
  const fullTitle = `${title} — ${SITE.name}`;

  // Build hreflang alternates by swapping the lang segment.
  const parts = path.split("/");
  const alternates = LOCALES.map((l) => {
    const p = [...parts];
    p[1] = l;
    return { lang: l, href: `${SITE.domain}${p.join("/")}` };
  });

  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex,follow" />
      ) : (
        <link rel="canonical" href={canonical} />
      )}
      {!noindex &&
        alternates.map((a) => (
          <link key={a.lang} rel="alternate" hrefLang={a.lang} href={a.href} />
        ))}
      {!noindex && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE.domain}/${LOCALES[0]}`} />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={locale} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
