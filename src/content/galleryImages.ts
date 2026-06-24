import { TOUR_IMAGES } from "@/content/tourImages";

/**
 * Static gallery used by the public /galeri page. Aggregates every tour photo
 * (src/content/tourImages.ts) into a flat, captioned list. This is the primary
 * source when the Supabase gallery is empty; if admin-managed rows exist they
 * override this (see src/pages/Gallery.tsx).
 */
export interface StaticGalleryImage {
  src: string;
  alt: string;
  caption: string;
}

/** Turkish caption per tour folder, shown under each photo. */
const TOUR_CAPTIONS: Record<string, string> = {
  "kekova-classic": "Kekova Classic",
  "kekova-east": "Kekova East",
  "kekova-west": "Kekova West",
  "trak-signature": "TRAK Experience",
};

export const GALLERY_IMAGES: StaticGalleryImage[] = Object.entries(TOUR_IMAGES).flatMap(
  ([slug, paths]) =>
    (paths ?? []).map((src) => {
      const caption = TOUR_CAPTIONS[slug] ?? "Dragoman SeaKayak";
      return { src, alt: caption, caption };
    }),
);
