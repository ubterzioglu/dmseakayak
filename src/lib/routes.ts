/**
 * Path segments per page (Turkish slugs, language-agnostic structure).
 * Full URLs are `/:lang/<segment>`. Centralized so nav, router and sitemap agree.
 */
export const SEG = {
  tours: "turlar",
  customTours: "ozel-turlar",
  trak: "trak-experience",
  about: "hakkimizda",
  reviews: "yorumlar",
  contact: "iletisim",
  faq: "sss",
} as const;
