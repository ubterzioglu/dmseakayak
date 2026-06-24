import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Full-screen image viewer with prev/next navigation. Shared by the gallery
 * page and tour detail galleries.
 */
export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const img = images[index];
  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={img.caption}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        className="relative max-h-[85vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.src}
          alt={img.alt}
          className="max-h-[80vh] rounded-xl object-contain shadow-2xl"
        />
        <p className="mt-3 text-center text-sm text-white/70">{img.caption}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
