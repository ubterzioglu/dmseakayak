import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPublishedGallery } from "@/hooks/useAdminContent";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";
import { GALLERY_IMAGES } from "@/content/galleryImages";

type GalleryImage = LightboxImage;

// Shown when the admin gallery (Supabase) is empty, so the page is never blank.
const FALLBACK_IMAGES: GalleryImage[] = GALLERY_IMAGES;

export default function Gallery() {
  const { t, locale } = useLang();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>(FALLBACK_IMAGES);

  useEffect(() => {
    let active = true;
    void fetchPublishedGallery().then((rows) => {
      if (!active || rows.length === 0) return;
      // Pick the caption for the active locale, falling back to the Turkish
      // default when that language is empty.
      const localized = { en: "caption_en", fr: "caption_fr", ru: "caption_ru" } as const;
      setImages(
        rows.map((r) => {
          const key = locale === "tr" ? null : localized[locale];
          const caption = (key ? r[key] : null) ?? r.caption ?? "";
          return {
            src: r.image_url,
            alt: r.alt ?? caption,
            caption,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const IMAGES = images;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + IMAGES.length) % IMAGES.length));
  const nextImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % IMAGES.length));

  return (
    <>
      <Seo title={t("gallery.title")} description={t("gallery.subtitle")} />

      {lightboxIndex !== null && (
        <Lightbox
          images={IMAGES}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      <Section>
        <SectionHeading
          eyebrow={t("gallery.eyebrow")}
          title={t("gallery.title")}
          subtitle={t("gallery.subtitle")}
        />

        {/* Featured carousel */}
        <div className="relative mb-10">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex gap-4">
              {IMAGES.map((img, i) => (
                <div
                  key={i}
                  className="relative min-w-0 flex-[0_0_80%] cursor-pointer overflow-hidden rounded-2xl sm:flex-[0_0_50%] lg:flex-[0_0_33%]"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-teal" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-teal" />
          </button>
        </div>

        {/* Masonry-ish grid */}
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {IMAGES.map((img, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setLightboxIndex(i)}
            >
              <div className="group relative">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: i % 3 === 0 ? "1/1" : i % 3 === 1 ? "4/5" : "4/3" }}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-semibold text-white">{img.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
