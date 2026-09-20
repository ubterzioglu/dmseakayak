/**
 * Client-side downscaling for admin image uploads.
 *
 * Photos come straight off a camera (8000 px wide, 10 MB) and the site serves
 * them from a public Supabase bucket, so every oversized upload is paid for
 * again as egress on every page view. This re-encodes to WebP at web
 * dimensions before the upload, matching the one-time backfill in
 * scripts/optimize-supabase-images.mjs so old and new images look alike.
 *
 * Failure is never fatal: anything we cannot decode is uploaded untouched.
 */

/** Longest edge, in pixels, that the site ever needs. */
export const MAX_IMAGE_DIM = 1600;
export const IMAGE_QUALITY = 0.8;

/** Vector art, and animations a canvas round-trip would flatten. */
const PASSTHROUGH = new Set(["image/svg+xml", "image/gif"]);

function withExtension(name: string, ext: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.${ext}`;
}

/**
 * Returns a WebP copy of `file` scaled to fit MAX_IMAGE_DIM, or the original
 * file when it is already smaller, cannot be decoded, or is a passthrough type.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || PASSTHROUGH.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY)
  );
  // A tiny or already-optimized source can come back bigger as WebP.
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], withExtension(file.name, "webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
